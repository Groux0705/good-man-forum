import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { PointService } from '../services/pointService';
import { calculateLevel, getLevelInfo, getLevelProgress, getNextLevelRequiredExp } from '../utils/levelSystem';

const prisma = new PrismaClient();

// 获取用户积分和等级信息
export const getUserPointsInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        balance: true,
        level: true,
        experience: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const levelInfo = getLevelInfo(user.level);
    const levelProgress = getLevelProgress(user.experience, user.level);
    const nextLevelExp = getNextLevelRequiredExp(user.level);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          balance: user.balance,
          level: user.level,
          experience: user.experience
        },
        levelInfo: {
          ...levelInfo,
          progress: levelProgress,
          nextLevelExp,
          currentLevelExp: user.experience
        }
      }
    });

  } catch (error) {
    console.error('Error getting user points info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 获取积分历史记录
export const getPointHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await PointService.getPointHistory(userId, page, limit);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting point history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 每日签到
export const dailyCheckIn = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await PointService.dailyLogin(userId);

    res.json({
      success: result.success,
      data: {
        points: result.points,
        experience: result.experience,
        consecutiveDays: result.consecutiveDays
      },
      message: result.message
    });

  } catch (error) {
    console.error('Error daily check in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 管理员调整用户积分 (需要管理员权限)
export const adminAdjustPoints = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 检查管理员权限 (这里简化，实际应该检查用户角色)
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin || admin.level < 15) {
      return res.status(403).json({ error: 'Insufficient privileges' });
    }

    const { userId, pointsAdjustment, experienceAdjustment, reason } = req.body;

    if (!userId || typeof pointsAdjustment !== 'number' || typeof experienceAdjustment !== 'number' || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await PointService.adminAdjustPoints(
      userId,
      pointsAdjustment,
      experienceAdjustment,
      reason,
      adminId
    );

    res.json({
      success: result.success,
      message: result.message
    });

  } catch (error) {
    console.error('Error admin adjust points:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 获取积分排行榜
export const getPointsLeaderboard = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const type = req.query.type as string || 'balance'; // 'balance' or 'level'

    const offset = (page - 1) * limit;

    const orderBy = type === 'level' 
      ? [{ level: 'desc' as const }, { experience: 'desc' as const }]
      : [{ balance: 'desc' as const }, { level: 'desc' as const }];

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          avatar: true,
          balance: true,
          level: true,
          experience: true,
          createdAt: true
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.user.count()
    ]);

    // 添加排名和等级信息
    const leaderboard = users.map((user, index) => {
      const levelInfo = getLevelInfo(user.level);
      return {
        rank: offset + index + 1,
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          balance: user.balance,
          level: user.level,
          experience: user.experience,
          createdAt: user.createdAt
        },
        levelInfo: {
          title: levelInfo.title,
          badge: levelInfo.badge
        }
      };
    });

    res.json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting points leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 消费积分 (用于购买特殊功能等)
export const consumePoints = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { amount, reason, relatedId, relatedType } = req.body;

    if (!amount || !reason || amount <= 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    const result = await PointService.consumePoints(
      userId,
      amount,
      reason,
      relatedId,
      relatedType
    );

    res.json({
      success: result.success,
      data: {
        newBalance: result.newBalance
      },
      message: result.message
    });

  } catch (error) {
    console.error('Error consuming points:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};