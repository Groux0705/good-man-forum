import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    status: string;
  };
}

// 获取当前用户的处罚状态
export const getCurrentUserPunishments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未授权访问'
      });
    }

    const now = new Date();
    
    // 获取用户所有活跃处罚
    const activePunishments = await prisma.userPunishment.findMany({
      where: {
        userId: req.user.id,
        status: 'active',
        OR: [
          { endTime: null }, // 永久处罚
          { endTime: { gt: now } } // 临时处罚未过期
        ]
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        type: true,
        reason: true,
        startTime: true,
        endTime: true,
        severity: true,
        createdAt: true
      }
    });

    // 获取最近的处罚历史
    const recentPunishments = await prisma.userPunishment.findMany({
      where: {
        userId: req.user.id,
        status: { in: ['expired', 'revoked'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        reason: true,
        startTime: true,
        endTime: true,
        severity: true,
        status: true,
        createdAt: true
      }
    });

    // 计算处罚统计
    const punishmentStats = {
      totalWarnings: await prisma.userPunishment.count({
        where: { userId: req.user.id, type: 'warning' }
      }),
      totalMutes: await prisma.userPunishment.count({
        where: { userId: req.user.id, type: 'mute' }
      }),
      totalBans: await prisma.userPunishment.count({
        where: { userId: req.user.id, type: 'ban' }
      }),
      totalSuspensions: await prisma.userPunishment.count({
        where: { userId: req.user.id, type: 'suspend' }
      })
    };

    // 判断用户当前是否被限制
    const isRestricted = activePunishments.some(p => ['ban', 'mute', 'suspend'].includes(p.type));
    const currentRestriction = activePunishments.find(p => ['ban', 'mute', 'suspend'].includes(p.type));

    res.json({
      success: true,
      data: {
        userStatus: req.user.status,
        isRestricted,
        currentRestriction: currentRestriction || null,
        activePunishments,
        recentPunishments,
        punishmentStats
      }
    });

  } catch (error) {
    console.error('获取用户处罚状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取处罚状态失败'
    });
  }
};

// 获取用户可以申诉的处罚
export const getAppealablePunishments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未授权访问'
      });
    }

    const now = new Date();
    
    // 获取可以申诉的处罚（活跃状态且严重程度>=2）
    const appealablePunishments = await prisma.userPunishment.findMany({
      where: {
        userId: req.user.id,
        status: 'active',
        severity: { gte: 2 }, // 只有严重程度>=2的处罚可以申诉
        OR: [
          { endTime: null },
          { endTime: { gt: now } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        reason: true,
        startTime: true,
        endTime: true,
        severity: true,
        createdAt: true
      }
    });

    // 检查每个处罚是否已经有申诉记录
    const punishmentsWithAppealStatus = await Promise.all(
      appealablePunishments.map(async (punishment) => {
        const existingAppeal = await prisma.userAppeal.findFirst({
          where: {
            userId: req.user!.id,
            punishmentId: punishment.id,
            status: { in: ['pending', 'processing'] }
          }
        });

        return {
          ...punishment,
          hasActiveAppeal: !!existingAppeal,
          appealId: existingAppeal?.id || null
        };
      })
    );

    res.json({
      success: true,
      data: {
        appealablePunishments: punishmentsWithAppealStatus
      }
    });

  } catch (error) {
    console.error('获取可申诉处罚失败:', error);
    res.status(500).json({
      success: false,
      message: '获取可申诉处罚失败'
    });
  }
};

// 用户提交申诉
export const submitAppeal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未授权访问'
      });
    }

    const { punishmentId, title, content, evidence } = req.body;

    if (!punishmentId || !title || !content) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的申诉信息'
      });
    }

    // 验证处罚是否存在且属于当前用户
    const punishment = await prisma.userPunishment.findFirst({
      where: {
        id: punishmentId,
        userId: req.user.id,
        status: 'active'
      }
    });

    if (!punishment) {
      return res.status(404).json({
        success: false,
        message: '处罚记录不存在或无法申诉'
      });
    }

    // 检查是否已有未完成的申诉
    const existingAppeal = await prisma.userAppeal.findFirst({
      where: {
        userId: req.user.id,
        punishmentId,
        status: { in: ['pending', 'processing'] }
      }
    });

    if (existingAppeal) {
      return res.status(400).json({
        success: false,
        message: '该处罚已有未完成的申诉，请等待处理结果'
      });
    }

    // 创建申诉记录
    const appeal = await prisma.userAppeal.create({
      data: {
        userId: req.user.id,
        punishmentId,
        type: 'punishment_appeal',
        title,
        content,
        evidence: evidence ? JSON.stringify(evidence) : null,
        priority: punishment.severity >= 4 ? 'high' : 'normal'
      }
    });

    res.json({
      success: true,
      data: appeal,
      message: '申诉提交成功，请等待管理员处理'
    });

  } catch (error) {
    console.error('提交申诉失败:', error);
    res.status(500).json({
      success: false,
      message: '提交申诉失败'
    });
  }
};

// 获取用户的申诉记录
export const getUserAppeals = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未授权访问'
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [appeals, total] = await Promise.all([
      prisma.userAppeal.findMany({
        where: { userId: req.user.id },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          title: true,
          content: true,
          status: true,
          priority: true,
          adminNote: true,
          handledAt: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.userAppeal.count({
        where: { userId: req.user.id }
      })
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
    console.error('获取申诉记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取申诉记录失败'
    });
  }
};