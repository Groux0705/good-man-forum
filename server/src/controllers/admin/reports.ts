import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logAdminAction } from '../../middleware/adminAuth';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

// 获取举报列表
export const getReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'pending', 
      type, 
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (category) {
      where.category = category;
    }

    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          handler: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy,
        skip,
        take: Number(limit)
      }),
      prisma.report.count({ where })
    ]);

    // 获取举报目标的详细信息
    const reportsWithTargetInfo = await Promise.all(
      reports.map(async (report) => {
        let targetInfo = null;
        
        try {
          switch (report.type) {
            case 'topic':
              targetInfo = await prisma.topic.findUnique({
                where: { id: report.targetId },
                select: {
                  id: true,
                  title: true,
                  status: true,
                  user: {
                    select: { username: true }
                  }
                }
              });
              break;
              
            case 'reply':
              targetInfo = await prisma.reply.findUnique({
                where: { id: report.targetId },
                select: {
                  id: true,
                  content: true,
                  user: {
                    select: { username: true }
                  },
                  topic: {
                    select: { id: true, title: true }
                  }
                }
              });
              break;
              
            case 'user':
              targetInfo = await prisma.user.findUnique({
                where: { id: report.targetId },
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  status: true
                }
              });
              break;
          }
        } catch (error) {
          console.error(`Failed to fetch target info for report ${report.id}:`, error);
        }

        return {
          ...report,
          targetInfo
        };
      })
    );

    res.json({
      success: true,
      data: {
        reports: reportsWithTargetInfo,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取举报列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取举报列表失败'
    });
  }
};

// 获取举报详情
export const getReportDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
            status: true,
            createdAt: true
          }
        },
        handler: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: '举报不存在'
      });
    }

    // 获取举报目标的详细信息
    let targetInfo = null;
    
    try {
      switch (report.type) {
        case 'topic':
          targetInfo = await prisma.topic.findUnique({
            where: { id: report.targetId },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  status: true
                }
              },
              node: {
                select: {
                  name: true,
                  title: true
                }
              },
              _count: {
                select: {
                  replyList: true,
                  topicLikes: true
                }
              }
            }
          });
          break;
          
        case 'reply':
          targetInfo = await prisma.reply.findUnique({
            where: { id: report.targetId },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  status: true
                }
              },
              topic: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          });
          break;
          
        case 'user':
          targetInfo = await prisma.user.findUnique({
            where: { id: report.targetId },
            select: {
              id: true,
              username: true,
              avatar: true,
              bio: true,
              status: true,
              role: true,
              createdAt: true,
              _count: {
                select: {
                  topics: true,
                  replies: true,
                  reports: true
                }
              }
            }
          });
          break;
      }
    } catch (error) {
      console.error(`Failed to fetch target info:`, error);
    }

    // 获取相同目标的其他举报
    const relatedReports = await prisma.report.findMany({
      where: {
        targetId: report.targetId,
        type: report.type,
        id: { not: id }
      },
      include: {
        reporter: {
          select: {
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      data: {
        ...report,
        targetInfo,
        relatedReports
      }
    });
  } catch (error) {
    console.error('获取举报详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取举报详情失败'
    });
  }
};

// 处理举报
export const handleReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, adminNote, reason } = req.body;

    if (!['resolve', 'dismiss'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: '无效的处理动作'
      });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: { id: true, username: true }
        }
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: '举报不存在'
      });
    }

    if (report.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '举报已被处理'
      });
    }

    const newStatus = action === 'resolve' ? 'resolved' : 'dismissed';

    // 在事务中处理举报和相关操作
    await prisma.$transaction(async (tx) => {
      // 更新举报状态
      await tx.report.update({
        where: { id },
        data: {
          status: newStatus,
          adminNote,
          handlerId: req.user!.id,
          handledAt: new Date()
        }
      });

      // 如果是解决举报，需要对举报目标采取行动
      if (action === 'resolve') {
        switch (report.type) {
          case 'topic':
            // 隐藏或删除主题
            await tx.topic.update({
              where: { id: report.targetId },
              data: { status: 'hidden' }
            });
            
            // 通知主题作者
            const topic = await tx.topic.findUnique({
              where: { id: report.targetId },
              select: { title: true, userId: true }
            });
            
            if (topic) {
              await tx.notification.create({
                data: {
                  userId: topic.userId,
                  type: 'system',
                  title: '您的主题已被处理',
                  content: `您的主题"${topic.title}"因被举报而被隐藏。${reason ? `原因：${reason}` : ''}`,
                  data: JSON.stringify({ 
                    topicId: report.targetId, 
                    action: 'hidden',
                    reason: report.reason,
                    adminNote 
                  })
                }
              });
            }
            break;

          case 'reply':
            // 删除回复
            await tx.reply.delete({
              where: { id: report.targetId }
            });
            
            // 通知回复作者
            const reply = await tx.reply.findUnique({
              where: { id: report.targetId },
              select: { userId: true, topicId: true }
            });
            
            if (reply) {
              await tx.notification.create({
                data: {
                  userId: reply.userId,
                  type: 'system',
                  title: '您的回复已被删除',
                  content: `您的回复因被举报而被删除。${reason ? `原因：${reason}` : ''}`,
                  data: JSON.stringify({ 
                    replyId: report.targetId,
                    topicId: reply.topicId,
                    action: 'deleted',
                    reason: report.reason,
                    adminNote 
                  })
                }
              });
            }
            break;

          case 'user':
            // 暂停用户
            await tx.user.update({
              where: { id: report.targetId },
              data: { status: 'suspended' }
            });
            
            // 通知用户
            await tx.notification.create({
              data: {
                userId: report.targetId,
                type: 'system',
                title: '您的账户已被暂停',
                content: `您的账户因被举报而被暂停。${reason ? `原因：${reason}` : ''}如有疑问请联系管理员。`,
                data: JSON.stringify({ 
                  action: 'suspended',
                  reason: report.reason,
                  adminNote 
                })
              }
            });
            break;
        }
      }

      // 通知举报者处理结果
      await tx.notification.create({
        data: {
          userId: report.reporterId,
          type: 'system',
          title: `您的举报已被${action === 'resolve' ? '处理' : '驳回'}`,
          content: `您举报的${report.type === 'topic' ? '主题' : report.type === 'reply' ? '回复' : '用户'}已被管理员${action === 'resolve' ? '处理' : '驳回'}。${adminNote ? `管理员备注：${adminNote}` : ''}`,
          data: JSON.stringify({ 
            reportId: id,
            action: newStatus,
            adminNote 
          })
        }
      });
    });

    // 记录管理员操作日志
    await logAdminAction(
      req.user!.id,
      'HANDLE_REPORT',
      'report',
      id,
      {
        reportType: report.type,
        targetId: report.targetId,
        action: newStatus,
        reason: report.reason,
        adminNote
      },
      req
    );

    res.json({
      success: true,
      message: `举报${action === 'resolve' ? '处理' : '驳回'}成功`
    });
  } catch (error) {
    console.error('处理举报失败:', error);
    res.status(500).json({
      success: false,
      message: '处理举报失败'
    });
  }
};

// 批量处理举报
export const batchHandleReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ids, action, adminNote, reason } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID列表不能为空'
      });
    }

    if (!['resolve', 'dismiss'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: '无效的处理动作'
      });
    }

    const newStatus = action === 'resolve' ? 'resolved' : 'dismissed';

    const result = await prisma.report.updateMany({
      where: { 
        id: { in: ids },
        status: 'pending'
      },
      data: {
        status: newStatus,
        adminNote,
        handlerId: req.user!.id,
        handledAt: new Date()
      }
    });

    // 记录批量操作日志
    await logAdminAction(
      req.user!.id,
      'BATCH_HANDLE_REPORTS',
      'report',
      undefined,
      {
        ids,
        action: newStatus,
        adminNote,
        reason,
        count: result.count
      },
      req
    );

    res.json({
      success: true,
      data: { count: result.count },
      message: `批量${action === 'resolve' ? '处理' : '驳回'}成功，影响 ${result.count} 个举报`
    });
  } catch (error) {
    console.error('批量处理举报失败:', error);
    res.status(500).json({
      success: false,
      message: '批量处理举报失败'
    });
  }
};

// 获取举报统计信息
export const getReportStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period = '30d' } = req.query;
    
    // 计算时间范围
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      totalReports,
      pendingReports,
      resolvedReports,
      dismissedReports,
      recentReports,
      reportsByType,
      reportsByCategory,
      topReporters
    ] = await Promise.all([
      // 总举报数
      prisma.report.count(),
      
      // 待处理举报数
      prisma.report.count({
        where: { status: 'pending' }
      }),
      
      // 已解决举报数
      prisma.report.count({
        where: { status: 'resolved' }
      }),
      
      // 已驳回举报数
      prisma.report.count({
        where: { status: 'dismissed' }
      }),
      
      // 时间段内新举报
      prisma.report.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // 按类型统计举报
      prisma.report.groupBy({
        by: ['type'],
        _count: { id: true },
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // 按分类统计举报
      prisma.report.groupBy({
        by: ['category'],
        _count: { id: true },
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // 举报最多的用户
      prisma.user.findMany({
        where: {
          reports: {
            some: {
              createdAt: { gte: startDate }
            }
          }
        },
        include: {
          _count: {
            select: {
              reports: {
                where: {
                  createdAt: { gte: startDate }
                }
              }
            }
          }
        },
        orderBy: {
          reports: {
            _count: 'desc'
          }
        },
        take: 5
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total: totalReports,
          pending: pendingReports,
          resolved: resolvedReports,
          dismissed: dismissedReports,
          recent: recentReports
        },
        reportsByType: reportsByType.map(item => ({
          type: item.type,
          count: item._count.id
        })),
        reportsByCategory: reportsByCategory.map(item => ({
          category: item.category,
          count: item._count.id
        })),
        topReporters: topReporters.map(user => ({
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          reportCount: user._count.reports
        })),
        period
      }
    });
  } catch (error) {
    console.error('获取举报统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取举报统计失败'
    });
  }
};