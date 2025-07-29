import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

// 获取操作日志列表
export const getAdminLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      action, 
      resource, 
      adminId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (action) {
      where.action = action;
    }
    
    if (resource) {
      where.resource = resource;
    }
    
    if (adminId) {
      where.adminId = adminId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              username: true,
              avatar: true,
              role: true
            }
          }
        },
        orderBy,
        skip,
        take: Number(limit)
      }),
      prisma.adminLog.count({ where })
    ]);

    const logsWithParsedDetails = logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));

    res.json({
      success: true,
      data: {
        logs: logsWithParsedDetails,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取操作日志失败:', error);
    res.status(500).json({
      success: false,
      message: '获取操作日志失败'
    });
  }
};

// 获取操作日志详情
export const getAdminLogDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const log = await prisma.adminLog.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
            email: true
          }
        }
      }
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: '操作日志不存在'
      });
    }

    // 获取相关的资源信息（如果还存在的话）
    let resourceInfo = null;
    if (log.resourceId) {
      try {
        switch (log.resource) {
          case 'user':
            resourceInfo = await prisma.user.findUnique({
              where: { id: log.resourceId },
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true,
                role: true
              }
            });
            break;
            
          case 'topic':
            resourceInfo = await prisma.topic.findUnique({
              where: { id: log.resourceId },
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
            
          case 'node':
            resourceInfo = await prisma.node.findUnique({
              where: { id: log.resourceId },
              select: {
                id: true,
                name: true,
                title: true
              }
            });
            break;
            
          case 'report':
            resourceInfo = await prisma.report.findUnique({
              where: { id: log.resourceId },
              select: {
                id: true,
                type: true,
                status: true,
                reason: true
              }
            });
            break;
        }
      } catch (error) {
        console.error(`Failed to fetch resource info:`, error);
      }
    }

    res.json({
      success: true,
      data: {
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
        resourceInfo
      }
    });
  } catch (error) {
    console.error('获取操作日志详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取操作日志详情失败'
    });
  }
};

// 获取操作日志统计信息
export const getAdminLogStats = async (req: AuthenticatedRequest, res: Response) => {
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
      totalLogs,
      recentLogs,
      logsByAction,
      logsByResource,
      logsByAdmin,
      dailyActivity
    ] = await Promise.all([
      // 总日志数
      prisma.adminLog.count(),
      
      // 时间段内日志数
      prisma.adminLog.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // 按操作类型统计
      prisma.adminLog.groupBy({
        by: ['action'],
        _count: { id: true },
        where: {
          createdAt: { gte: startDate }
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      }),
      
      // 按资源类型统计
      prisma.adminLog.groupBy({
        by: ['resource'],
        _count: { id: true },
        where: {
          createdAt: { gte: startDate }
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      }),
      
      // 按管理员统计
      prisma.adminLog.groupBy({
        by: ['adminId'],
        _count: { id: true },
        where: {
          createdAt: { gte: startDate }
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      }),
      
      // 每日活动统计
      prisma.adminLog.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: {
          createdAt: { gte: startDate }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    ]);

    // 获取管理员信息
    const adminIds = logsByAdmin.map(log => log.adminId);
    const adminInfo = await prisma.user.findMany({
      where: { id: { in: adminIds } },
      select: {
        id: true,
        username: true,
        avatar: true,
        role: true
      }
    });

    const adminMap = new Map(adminInfo.map(admin => [admin.id, admin]));

    // 格式化每日活动数据
    const formatDailyActivity = (data: any[]) => {
      const activityMap = new Map();
      data.forEach(item => {
        const date = item.createdAt.toISOString().split('T')[0];
        activityMap.set(date, (activityMap.get(date) || 0) + item._count.id);
      });

      // 生成完整的日期序列
      const days = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      const activity = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        activity.push({
          date: dateStr,
          count: activityMap.get(dateStr) || 0
        });
      }
      
      return activity;
    };

    res.json({
      success: true,
      data: {
        overview: {
          total: totalLogs,
          recent: recentLogs
        },
        logsByAction: logsByAction.map(item => ({
          action: item.action,
          count: item._count.id
        })),
        logsByResource: logsByResource.map(item => ({
          resource: item.resource,
          count: item._count.id
        })),
        logsByAdmin: logsByAdmin.map(item => ({
          admin: adminMap.get(item.adminId) || { 
            id: item.adminId, 
            username: 'Unknown', 
            avatar: null,
            role: 'unknown'
          },
          count: item._count.id
        })),
        dailyActivity: formatDailyActivity(dailyActivity),
        period
      }
    });
  } catch (error) {
    console.error('获取操作日志统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取操作日志统计失败'
    });
  }
};

// 清理旧日志
export const cleanupOldLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { days = 90 } = req.body;

    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有超级管理员可以清理日志'
      });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(days));

    const result = await prisma.adminLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    res.json({
      success: true,
      data: { deletedCount: result.count },
      message: `成功清理 ${result.count} 条超过 ${days} 天的日志记录`
    });
  } catch (error) {
    console.error('清理旧日志失败:', error);
    res.status(500).json({
      success: false,
      message: '清理旧日志失败'
    });
  }
};