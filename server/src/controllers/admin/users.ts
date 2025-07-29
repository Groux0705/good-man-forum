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

// 获取用户列表 - 增强版
export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      role, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc',
      trustScoreMin,
      trustScoreMax,
      violationCountMin,
      violationCountMax,
      registrationDateFrom,
      registrationDateTo,
      lastActiveDateFrom,
      lastActiveDateTo
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    // 基础过滤
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (role && role !== 'all') {
      where.role = role;
    }
    
    // 搜索
    if (search) {
      where.OR = [
        { username: { contains: search as string } },
        { email: { contains: search as string } },
        { realName: { contains: search as string } }
      ];
    }

    // 信用分过滤
    if (trustScoreMin || trustScoreMax) {
      where.trustScore = {};
      if (trustScoreMin) where.trustScore.gte = Number(trustScoreMin);
      if (trustScoreMax) where.trustScore.lte = Number(trustScoreMax);
    }

    // 违规次数过滤
    if (violationCountMin || violationCountMax) {
      where.violationCount = {};
      if (violationCountMin) where.violationCount.gte = Number(violationCountMin);
      if (violationCountMax) where.violationCount.lte = Number(violationCountMax);
    }

    // 注册时间过滤
    if (registrationDateFrom || registrationDateTo) {
      where.createdAt = {};
      if (registrationDateFrom) where.createdAt.gte = new Date(registrationDateFrom as string);
      if (registrationDateTo) where.createdAt.lte = new Date(registrationDateTo as string);
    }

    // 最后活跃时间过滤
    if (lastActiveDateFrom || lastActiveDateTo) {
      where.lastActiveAt = {};
      if (lastActiveDateFrom) where.lastActiveAt.gte = new Date(lastActiveDateFrom as string);
      if (lastActiveDateTo) where.lastActiveAt.lte = new Date(lastActiveDateTo as string);
    }

    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          role: true,
          status: true,
          level: true,
          balance: true,
          trustScore: true,
          violationCount: true,
          emailVerified: true,
          phoneVerified: true,
          lastActiveAt: true,
          registrationIp: true,
          lastLoginIp: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              topics: true,
              replies: true,
              reports: true,
              punishments: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    const pages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          ...user,
          topicCount: user._count.topics,
          replyCount: user._count.replies,
          reportCount: user._count.reports,
          punishmentCount: user._count.punishments
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages
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

// 获取用户详情 - 增强版
export const getUserDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            topics: true,
            replies: true,
            reports: true,
            punishments: true,
            appeals: true,
            loginLogs: true
          }
        },
        punishments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            type: true,
            reason: true,
            duration: true,
            startTime: true,
            endTime: true,
            status: true,
            severity: true,
            createdAt: true
          }
        },
        appeals: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            type: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true
          }
        },
        loginLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            ip: true,
            location: true,
            success: true,
            createdAt: true
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

    // 获取用户风险画像
    const riskProfile = await calculateUserRiskProfile(user.id);

    res.json({
      success: true,
      data: {
        ...user,
        riskProfile,
        topicCount: user._count.topics,
        replyCount: user._count.replies,
        reportCount: user._count.reports,
        punishmentCount: user._count.punishments,
        appealCount: user._count.appeals,
        loginCount: user._count.loginLogs
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

// 用户处罚
export const punishUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { type, reason, duration, severity = 1, evidence } = req.body;
    const adminId = req.user!.id;

    if (!type || !reason) {
      return res.status(400).json({
        success: false,
        message: '处罚类型和原因不能为空'
      });
    }

    // 计算结束时间
    let endTime = null;
    if (duration && duration > 0) {
      endTime = new Date(Date.now() + duration * 60 * 1000);
    }

    // 开始事务
    const result = await prisma.$transaction(async (tx) => {
      // 创建处罚记录
      const punishment = await tx.userPunishment.create({
        data: {
          userId: id,
          adminId,
          type,
          reason,
          duration,
          endTime,
          severity: Number(severity),
          evidence: evidence ? JSON.stringify(evidence) : null
        }
      });

      // 更新用户状态
      let newStatus = 'active';
      if (type === 'ban') newStatus = 'banned';
      else if (type === 'mute') newStatus = 'muted';
      else if (type === 'suspend') newStatus = 'suspended';

      const user = await tx.user.update({
        where: { id },
        data: {
          status: newStatus,
          violationCount: { increment: 1 },
          trustScore: { decrement: severity * 10 }
        }
      });

      return { punishment, user };
    }, {
      timeout: 10000, // 增加超时时间到10秒
    });

    // 记录管理员操作（移到事务外部）
    await logAdminAction(adminId, 'PUNISH_USER', 'user', id, {
      type,
      reason,
      duration,
      severity
    }, req);

    res.json({
      success: true,
      data: result,
      message: '处罚执行成功'
    });
  } catch (error) {
    console.error('用户处罚失败:', error);
    res.status(500).json({
      success: false,
      message: '用户处罚失败'
    });
  }
};

// 撤销处罚
export const revokePunishment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { punishmentId } = req.params;
    const { reason } = req.body;
    const adminId = req.user!.id;

    const result = await prisma.$transaction(async (tx) => {
      // 更新处罚状态
      const punishment = await tx.userPunishment.update({
        where: { id: punishmentId },
        data: {
          status: 'revoked',
          details: JSON.stringify({ revokeReason: reason, revokedBy: adminId })
        },
        include: { user: true }
      });

      // 检查用户是否还有其他活跃处罚
      const activePunishments = await tx.userPunishment.findMany({
        where: {
          userId: punishment.userId,
          status: 'active',
          OR: [
            { endTime: null },
            { endTime: { gt: new Date() } }
          ]
        }
      });

      // 如果没有其他活跃处罚，恢复用户正常状态
      if (activePunishments.length === 0) {
        await tx.user.update({
          where: { id: punishment.userId },
          data: { status: 'active' }
        });
      }

      return punishment;
    }, {
      timeout: 10000, // 增加超时时间到10秒
    });

    // 记录管理员操作（移到事务外部）
    await logAdminAction(adminId, 'REVOKE_PUNISHMENT', 'user', result.userId, {
      punishmentId,
      reason
    }, req);

    res.json({
      success: true,
      data: result,
      message: '处罚已撤销'
    });
  } catch (error) {
    console.error('撤销处罚失败:', error);
    res.status(500).json({
      success: false,
      message: '撤销处罚失败'
    });
  }
};

// 批量操作
export const batchOperation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, userIds, params } = req.body;
    const adminId = req.user!.id;

    if (!type || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '参数错误'
      });
    }

    // 创建批量操作记录
    const batchOp = await prisma.batchOperation.create({
      data: {
        adminId,
        type,
        targets: JSON.stringify(userIds),
        params: JSON.stringify(params),
        status: 'processing'
      }
    });

    // 异步执行批量操作
    processBatchOperation(batchOp.id, type, userIds, params, adminId, req);

    res.json({
      success: true,
      data: { operationId: batchOp.id },
      message: '批量操作已开始执行'
    });
  } catch (error) {
    console.error('批量操作失败:', error);
    res.status(500).json({
      success: false,
      message: '批量操作失败'
    });
  }
};

// 获取批量操作状态
export const getBatchOperationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { operationId } = req.params;

    const operation = await prisma.batchOperation.findUnique({
      where: { id: operationId }
    });

    if (!operation) {
      return res.status(404).json({
        success: false,
        message: '操作不存在'
      });
    }

    res.json({
      success: true,
      data: operation
    });
  } catch (error) {
    console.error('获取批量操作状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取批量操作状态失败'
    });
  }
};

// 获取用户申诉列表
export const getUserAppeals = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'all',
      priority = 'all',
      type = 'all'
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    
    if (status !== 'all') where.status = status;
    if (priority !== 'all') where.priority = priority;
    if (type !== 'all') where.type = type;

    const [appeals, total] = await Promise.all([
      prisma.userAppeal.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              role: true
            }
          }
        }
      }),
      prisma.userAppeal.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        appeals,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取申诉列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取申诉列表失败'
    });
  }
};

// 处理申诉
export const handleAppeal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { appealId } = req.params;
    const { status, adminNote } = req.body;
    const adminId = req.user!.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的处理状态'
      });
    }

    const appeal = await prisma.userAppeal.update({
      where: { id: appealId },
      data: {
        status,
        adminId,
        adminNote,
        handledAt: new Date()
      },
      include: {
        user: true
      }
    });

    // 记录管理员操作
    await logAdminAction(adminId, 'HANDLE_APPEAL', 'appeal', appealId, {
      status,
      adminNote
    }, req);

    res.json({
      success: true,
      data: appeal,
      message: '申诉处理完成'
    });
  } catch (error) {
    console.error('处理申诉失败:', error);
    res.status(500).json({
      success: false,
      message: '处理申诉失败'
    });
  }
};

// 用户统计
export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      mutedUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      totalPunishments,
      totalAppeals,
      pendingAppeals,
      avgTrustScore,
      highRiskUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.user.count({ where: { status: 'banned' } }),
      prisma.user.count({ where: { status: 'muted' } }),
      prisma.user.count({ where: { createdAt: { gte: yesterday } } }),
      prisma.user.count({ where: { createdAt: { gte: lastWeek } } }),
      prisma.user.count({ where: { createdAt: { gte: lastMonth } } }),
      prisma.userPunishment.count(),
      prisma.userAppeal.count(),
      prisma.userAppeal.count({ where: { status: 'pending' } }),
      prisma.user.aggregate({ _avg: { trustScore: true } }),
      prisma.user.count({ where: { trustScore: { lt: 50 } } })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          bannedUsers,
          mutedUsers,
          newUsersToday,
          newUsersWeek,
          newUsersMonth,
          avgTrustScore: Math.round(avgTrustScore._avg.trustScore || 100),
          highRiskUsers
        },
        punishments: {
          total: totalPunishments
        },
        appeals: {
          total: totalAppeals,
          pending: pendingAppeals
        }
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

// 辅助函数：计算用户风险画像
async function calculateUserRiskProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      punishments: { where: { status: 'active' } },
      reports: true,
      _count: {
        select: {
          topics: true,
          replies: true
        }
      }
    }
  });

  if (!user) return null;

  const riskFactors = [];
  let riskScore = 0;

  // 信用分低于60分
  if (user.trustScore < 60) {
    riskFactors.push('信用分过低');
    riskScore += 30;
  }

  // 违规次数超过5次
  if (user.violationCount > 5) {
    riskFactors.push('多次违规');
    riskScore += 25;
  }

  // 有活跃处罚
  if (user.punishments.length > 0) {
    riskFactors.push('当前被处罚');
    riskScore += 20;
  }

  // 被举报次数多
  if (user.reports.length > 3) {
    riskFactors.push('被举报较多');
    riskScore += 15;
  }

  // 活跃度异常（注册很久但内容很少）
  const daysSinceRegistration = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const totalContent = user._count.topics + user._count.replies;
  if (daysSinceRegistration > 30 && totalContent < 5) {
    riskFactors.push('活跃度异常');
    riskScore += 10;
  }

  let riskLevel = 'low';
  if (riskScore >= 50) riskLevel = 'high';
  else if (riskScore >= 25) riskLevel = 'medium';

  return {
    riskScore: Math.min(riskScore, 100),
    riskLevel,
    riskFactors
  };
}

// 辅助函数：处理批量操作
async function processBatchOperation(
  operationId: string, 
  type: string, 
  userIds: string[], 
  params: any, 
  adminId: string,
  req: Request
) {
  try {
    let processed = 0;
    const results: any[] = [];

    for (const userId of userIds) {
      try {
        // 为每个用户操作使用独立事务
        await prisma.$transaction(async (tx) => {
          if (type === 'batch_ban') {
            await tx.user.update({
              where: { id: userId },
              data: { 
                status: 'banned',
                violationCount: { increment: 1 }
              }
            });
            
            await tx.userPunishment.create({
              data: {
                userId,
                adminId,
                type: 'ban',
                reason: params.reason || '批量处罚',
                duration: params.duration,
                endTime: params.duration ? new Date(Date.now() + params.duration * 60 * 1000) : null
              }
            });
          } else if (type === 'batch_mute') {
            await tx.user.update({
              where: { id: userId },
              data: { 
                status: 'muted',
                violationCount: { increment: 1 }
              }
            });
            
            await tx.userPunishment.create({
              data: {
                userId,
                adminId,
                type: 'mute',
                reason: params.reason || '批量禁言',
                duration: params.duration,
                endTime: params.duration ? new Date(Date.now() + params.duration * 60 * 1000) : null
              }
            });
          }
        }, {
          timeout: 10000, // 10秒超时
        });

        results.push({ userId, success: true });
        processed++;
      } catch (error) {
        results.push({ userId, success: false, error: (error as Error).message });
      }

      // 更新进度
      const progress = Math.round((processed / userIds.length) * 100);
      await prisma.batchOperation.update({
        where: { id: operationId },
        data: { progress }
      });
    }

    // 更新最终状态
    await prisma.batchOperation.update({
      where: { id: operationId },
      data: {
        status: 'completed',
        progress: 100,
        result: JSON.stringify(results)
      }
    });

    // 记录管理员操作
    await logAdminAction(adminId, 'BATCH_OPERATION', 'user', undefined, {
      type,
      userCount: userIds.length,
      successCount: results.filter(r => r.success).length
    }, req);

  } catch (error) {
    await prisma.batchOperation.update({
      where: { id: operationId },
      data: {
        status: 'failed',
        result: JSON.stringify({ error: (error as Error).message })
      }
    });
  }
}