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

// 获取主题列表（管理员视图）
export const getTopics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, search, nodeId, userId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { content: { contains: search as string } }
      ];
    }
    
    if (nodeId) {
      where.nodeId = nodeId;
    }
    
    if (userId) {
      where.authorId = userId;
    }

    const [topics, total] = await Promise.all([
      prisma.topic.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              status: true,
              role: true
            }
          },
          node: {
            select: {
              id: true,
              name: true,
              title: true
            }
          },
          _count: {
            select: {
              replyList: true,
              topicLikes: true,
              topicFavorites: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.topic.count({ where })
    ]);

    const topicsWithStats = topics.map(topic => ({
      ...topic,
      replies: topic._count.replyList,
      likes: topic._count.topicLikes,
      favorites: topic._count.topicFavorites
    }));

    res.json({
      success: true,
      data: {
        topics: topicsWithStats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取主题列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取主题列表失败'
    });
  }
};

// 获取主题详情
export const getTopicDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
            status: true,
            role: true,
            createdAt: true
          }
        },
        node: {
          select: {
            id: true,
            name: true,
            title: true
          }
        },
        replyList: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            replyList: true,
            topicLikes: true,
            topicFavorites: true
          }
        }
      }
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: '主题不存在'
      });
    }

    res.json({
      success: true,
      data: {
        ...topic,
        replies: topic._count.replyList,
        likes: topic._count.topicLikes,
        favorites: topic._count.topicFavorites,
        recentReplies: topic.replyList
      }
    });
  } catch (error) {
    console.error('获取主题详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取主题详情失败'
    });
  }
};

// 更新主题状态
export const updateTopicStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    if (!['published', 'hidden', 'deleted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }

    const topic = await prisma.topic.findUnique({
      where: { id },
      select: { id: true, title: true, status: true, userId: true }
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: '主题不存在'
      });
    }

    const updatedTopic = await prisma.topic.update({
      where: { id },
      data: { status }
    });

    // 记录管理员操作日志
    await logAdminAction(
      req.user!.id,
      'UPDATE_TOPIC_STATUS',
      'topic',
      id,
      {
        oldStatus: topic.status,
        newStatus: status,
        reason,
        title: topic.title
      },
      req
    );

    // 如果是隐藏或删除主题，可以考虑发送通知给作者
    if (['hidden', 'deleted'].includes(status)) {
      try {
        await prisma.notification.create({
          data: {
            userId: topic.userId,
            type: 'system',
            title: `您的主题已被${status === 'hidden' ? '隐藏' : '删除'}`,
            content: `主题"${topic.title}"已被管理员${status === 'hidden' ? '隐藏' : '删除'}。${reason ? `原因：${reason}` : ''}`,
            data: JSON.stringify({ topicId: id, action: status, reason })
          }
        });
      } catch (notificationError) {
        console.error('发送通知失败:', notificationError);
      }
    }

    res.json({
      success: true,
      data: updatedTopic,
      message: '主题状态更新成功'
    });
  } catch (error) {
    console.error('更新主题状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新主题状态失败'
    });
  }
};

// 删除主题
export const deleteTopic = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const topic = await prisma.topic.findUnique({
      where: { id },
      select: { 
        id: true, 
        title: true, 
        userId: true,
        nodeId: true
      }
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: '主题不存在'
      });
    }

    // 在事务中删除主题及相关数据
    await prisma.$transaction(async (tx) => {
      // 删除相关的回复
      await tx.reply.deleteMany({
        where: { topicId: id }
      });

      // 删除相关的点赞
      await tx.topicLike.deleteMany({
        where: { topicId: id }
      });

      // 删除相关的收藏
      await tx.topicFavorite.deleteMany({
        where: { topicId: id }
      });

      // 删除相关的投票
      await tx.vote.deleteMany({
        where: { topicId: id }
      });

      // 删除相关的通知
      await tx.notification.deleteMany({
        where: {
          data: {
            contains: id
          }
        }
      });

      // 删除主题
      await tx.topic.delete({
        where: { id }
      });

      // 更新节点的主题计数
      await tx.node.update({
        where: { id: topic.nodeId },
        data: {
          topics: {
            decrement: 1
          }
        }
      });
    });

    // 记录管理员操作日志
    await logAdminAction(
      req.user!.id,
      'DELETE_TOPIC',
      'topic',
      id,
      {
        title: topic.title,
        reason,
        userId: topic.userId
      },
      req
    );

    // 发送通知给作者
    try {
      await prisma.notification.create({
        data: {
          userId: topic.userId,
          type: 'system',
          title: '您的主题已被删除',
          content: `主题"${topic.title}"已被管理员删除。${reason ? `原因：${reason}` : ''}`,
          data: JSON.stringify({ topicId: id, action: 'delete', reason })
        }
      });
    } catch (notificationError) {
      console.error('发送通知失败:', notificationError);
    }

    res.json({
      success: true,
      message: '主题删除成功'
    });
  } catch (error) {
    console.error('删除主题失败:', error);
    res.status(500).json({
      success: false,
      message: '删除主题失败'
    });
  }
};

// 批量操作主题
export const batchUpdateTopics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ids, action, status, reason } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID列表不能为空'
      });
    }

    let result;
    switch (action) {
      case 'updateStatus':
        if (!['published', 'hidden', 'deleted'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: '无效的状态值'
          });
        }
        
        result = await prisma.topic.updateMany({
          where: { id: { in: ids } },
          data: { status }
        });
        
        // 记录批量操作日志
        await logAdminAction(
          req.user!.id,
          'BATCH_UPDATE_TOPIC_STATUS',
          'topic',
          undefined,
          {
            ids,
            newStatus: status,
            reason,
            count: result.count
          },
          req
        );
        break;

      case 'delete':
        // 批量删除需要在事务中处理
        result = await prisma.$transaction(async (tx) => {
          // 删除相关数据
          await tx.reply.deleteMany({
            where: { topicId: { in: ids } }
          });
          
          await tx.topicLike.deleteMany({
            where: { topicId: { in: ids } }
          });
          
          await tx.topicFavorite.deleteMany({
            where: { topicId: { in: ids } }
          });
          
          await tx.vote.deleteMany({
            where: { topicId: { in: ids } }
          });

          // 删除主题
          return await tx.topic.deleteMany({
            where: { id: { in: ids } }
          });
        });

        await logAdminAction(
          req.user!.id,
          'BATCH_DELETE_TOPICS',
          'topic',
          undefined,
          {
            ids,
            reason,
            count: result.count
          },
          req
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: '无效的操作类型'
        });
    }

    res.json({
      success: true,
      data: { count: result.count },
      message: `批量操作成功，影响 ${result.count} 个主题`
    });
  } catch (error) {
    console.error('批量操作失败:', error);
    res.status(500).json({
      success: false,
      message: '批量操作失败'
    });
  }
};

// 获取主题统计信息
export const getTopicStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period = '7d' } = req.query;
    
    // 计算时间范围
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const [
      totalTopics,
      publishedTopics,
      hiddenTopics,
      deletedTopics,
      recentTopics,
      topNodes,
      topAuthors
    ] = await Promise.all([
      // 总主题数
      prisma.topic.count(),
      
      // 已发布主题数
      prisma.topic.count({
        where: { status: 'published' }
      }),
      
      // 隐藏主题数
      prisma.topic.count({
        where: { status: 'hidden' }
      }),
      
      // 删除主题数（如果有软删除的话）
      prisma.topic.count({
        where: { status: 'deleted' }
      }),
      
      // 时间段内新增主题
      prisma.topic.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // 主题最多的节点
      prisma.node.findMany({
        orderBy: { topics: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          title: true,
          topics: true
        }
      }),
      
      // 发帖最多的用户
      prisma.user.findMany({
        where: {
          topics: {
            some: {
              createdAt: {
                gte: startDate
              }
            }
          }
        },
        include: {
          _count: {
            select: {
              topics: true
            }
          }
        },
        orderBy: {
          topics: {
            _count: 'desc'
          }
        },
        take: 10
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total: totalTopics,
          published: publishedTopics,
          hidden: hiddenTopics,
          deleted: deletedTopics,
          recent: recentTopics
        },
        topNodes,
        topAuthors: topAuthors.map(author => ({
          id: author.id,
          username: author.username,
          avatar: author.avatar,
          topicCount: author._count.topics
        })),
        period
      }
    });
  } catch (error) {
    console.error('获取主题统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取主题统计失败'
    });
  }
};