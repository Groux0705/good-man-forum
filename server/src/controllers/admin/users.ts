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

// 获取用户列表
export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      role, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { username: { contains: search as string } },
        { email: { contains: search as string } }
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          role: true,
          status: true,
          level: true,
          balance: true,
          experience: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              topics: true,
              replies: true,
              reports: true
            }
          }
        },
        orderBy,
        skip,
        take: Number(limit)
      }),
      prisma.user.count({ where })
    ]);

    const usersWithStats = users.map(user => ({
      ...user,
      topicCount: user._count.topics,
      replyCount: user._count.replies,
      reportCount: user._count.reports
    }));

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
};

// 获取用户详情
export const getUserDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        level: true,
        balance: true,
        experience: true,
        createdAt: true,
        updatedAt: true,
        topics: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            node: {
              select: { name: true, title: true }
            }
          }
        },
        replies: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            content: true,
            createdAt: true,
            topic: {
              select: { id: true, title: true }
            }
          }
        },
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            type: true,
            reason: true,
            status: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            topics: true,
            replies: true,
            reports: true,
            handledReports: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取用户最近的登录记录等额外信息
    const stats = {
      totalTopics: user._count.topics,
      totalReplies: user._count.replies,
      totalReports: user._count.reports,
      handledReports: user._count.handledReports
    };

    res.json({
      success: true,
      data: {
        ...user,
        stats,
        recentTopics: user.topics,
        recentReplies: user.replies,
        recentReports: user.reports
      }
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户详情失败'
    });
  }
};

// 更新用户状态
export const updateUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'banned', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        username: true, 
        status: true, 
        role: true 
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 防止管理员被其他管理员禁用（只有超级管理员可以）
    if (user.role === 'admin' && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权限操作管理员用户'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status }
    });

    // 记录管理员操作日志
    await logAdminAction(
      req.user!.id,
      'UPDATE_USER_STATUS',
      'user',
      id,
      {
        username: user.username,
        oldStatus: user.status,
        newStatus: status,
        reason
      },
      req
    );

    // 发送通知给用户
    if (['banned', 'suspended'].includes(status)) {
      try {
        await prisma.notification.create({
          data: {
            userId: id,
            type: 'system',
            title: `您的账户已被${status === 'banned' ? '禁用' : '暂停'}`,
            content: `您的账户已被管理员${status === 'banned' ? '禁用' : '暂停'}。${reason ? `原因：${reason}` : ''}如有疑问请联系管理员。`,
            data: JSON.stringify({ action: status, reason })
          }
        });
      } catch (notificationError) {
        console.error('发送通知失败:', notificationError);
      }
    }

    res.json({
      success: true,
      data: updatedUser,
      message: '用户状态更新成功'
    });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户状态失败'
    });
  }
};

// 更新用户角色
export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: '无效的角色值'
      });
    }

    // 只有超级管理员可以设置管理员角色
    if (role === 'admin' && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权限设置管理员角色'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        username: true, 
        role: true 
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });

    // 记录管理员操作日志
    await logAdminAction(
      req.user!.id,
      'UPDATE_USER_ROLE',
      'user',
      id,
      {
        username: user.username,
        oldRole: user.role,
        newRole: role
      },
      req
    );

    // 发送通知给用户
    try {
      await prisma.notification.create({
        data: {
          userId: id,
          type: 'system',
          title: '您的角色已更新',
          content: `您的账户角色已更新为：${role === 'admin' ? '管理员' : role === 'moderator' ? '版主' : '普通用户'}`,
          data: JSON.stringify({ action: 'role_update', newRole: role })
        }
      });
    } catch (notificationError) {
      console.error('发送通知失败:', notificationError);
    }

    res.json({
      success: true,
      data: updatedUser,
      message: '用户角色更新成功'
    });
  } catch (error) {
    console.error('更新用户角色失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户角色失败'
    });
  }
};

// 批量操作用户
export const batchUpdateUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ids, action, status, role, reason } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID列表不能为空'
      });
    }

    let result;
    switch (action) {
      case 'updateStatus':
        if (!['active', 'banned', 'suspended'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: '无效的状态值'
          });
        }

        // 检查是否包含管理员用户
        const adminUsers = await prisma.user.findMany({
          where: { 
            id: { in: ids },
            role: 'admin'
          },
          select: { id: true }
        });

        if (adminUsers.length > 0 && req.user!.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: '无权限操作管理员用户'
          });
        }
        
        result = await prisma.user.updateMany({
          where: { id: { in: ids } },
          data: { status }
        });
        
        await logAdminAction(
          req.user!.id,
          'BATCH_UPDATE_USER_STATUS',
          'user',
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

      case 'updateRole':
        if (!['user', 'moderator', 'admin'].includes(role)) {
          return res.status(400).json({
            success: false,
            message: '无效的角色值'
          });
        }

        if (role === 'admin' && req.user!.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: '无权限设置管理员角色'
          });
        }
        
        result = await prisma.user.updateMany({
          where: { id: { in: ids } },
          data: { role }
        });
        
        await logAdminAction(
          req.user!.id,
          'BATCH_UPDATE_USER_ROLE',
          'user',
          undefined,
          {
            ids,
            newRole: role,
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
      message: `批量操作成功，影响 ${result.count} 个用户`
    });
  } catch (error) {
    console.error('批量操作失败:', error);
    res.status(500).json({
      success: false,
      message: '批量操作失败'
    });
  }
};

// 获取用户统计信息
export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
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
      totalUsers,
      activeUsers,
      bannedUsers,
      suspendedUsers,
      adminUsers,
      moderatorUsers,
      newUsers,
      usersByLevel
    ] = await Promise.all([
      // 总用户数
      prisma.user.count(),
      
      // 活跃用户数
      prisma.user.count({
        where: { status: 'active' }
      }),
      
      // 被禁用户数
      prisma.user.count({
        where: { status: 'banned' }
      }),
      
      // 被暂停用户数
      prisma.user.count({
        where: { status: 'suspended' }
      }),
      
      // 管理员数
      prisma.user.count({
        where: { role: 'admin' }
      }),
      
      // 版主数
      prisma.user.count({
        where: { role: 'moderator' }
      }),
      
      // 时间段内新用户
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // 按等级统计用户
      prisma.user.groupBy({
        by: ['level'],
        _count: {
          id: true
        },
        orderBy: {
          level: 'asc'
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers,
          suspended: suspendedUsers,
          admin: adminUsers,
          moderator: moderatorUsers,
          new: newUsers
        },
        levelDistribution: usersByLevel.map(item => ({
          level: item.level,
          count: item._count.id
        })),
        period
      }
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户统计失败'
    });
  }
};