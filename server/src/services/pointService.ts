import { PrismaClient } from '@prisma/client';
import { calculateLevel, getPointRule, POINT_RULES } from '../utils/levelSystem';

const prisma = new PrismaClient();

export interface PointTransaction {
  userId: string;
  type: string;
  amount: number;
  reason: string;
  relatedId?: string;
  relatedType?: string;
}

export class PointService {
  /**
   * 添加积分和经验值
   */
  static async addPoints(transaction: PointTransaction): Promise<{ 
    success: boolean; 
    newBalance: number; 
    newLevel: number; 
    leveledUp: boolean;
    message: string;
  }> {
    try {
      const rule = getPointRule(transaction.type);
      if (!rule) {
        throw new Error(`Unknown point rule type: ${transaction.type}`);
      }

      // 检查每日限制
      if (rule.dailyLimit) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayCount = await prisma.pointHistory.count({
          where: {
            userId: transaction.userId,
            type: transaction.type,
            createdAt: {
              gte: today
            }
          }
        });

        if (todayCount >= rule.dailyLimit) {
          return {
            success: false,
            newBalance: 0,
            newLevel: 0,
            leveledUp: false,
            message: `今日${rule.description}次数已达上限`
          };
        }
      }

      // 获取用户当前数据
      const user = await prisma.user.findUnique({
        where: { id: transaction.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const oldLevel = user.level;
      const newBalance = user.balance + rule.points;
      const newExperience = user.experience + rule.experience;
      const newLevelConfig = calculateLevel(newExperience);
      const leveledUp = newLevelConfig.level > oldLevel;

      // 使用事务更新用户数据和记录历史
      await prisma.$transaction(async (tx) => {
        // 更新用户数据
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            balance: newBalance,
            experience: newExperience,
            level: newLevelConfig.level,
            updatedAt: new Date()
          }
        });

        // 记录积分历史
        await tx.pointHistory.create({
          data: {
            userId: transaction.userId,
            amount: rule.points,
            type: transaction.type,
            reason: transaction.reason,
            relatedId: transaction.relatedId,
            relatedType: transaction.relatedType
          }
        });

        // 如果升级了，记录升级奖励
        if (leveledUp) {
          const levelUpBonus = Math.floor(newLevelConfig.level * 10);
          await tx.user.update({
            where: { id: transaction.userId },
            data: {
              balance: newBalance + levelUpBonus
            }
          });

          await tx.pointHistory.create({
            data: {
              userId: transaction.userId,
              amount: levelUpBonus,
              type: 'level_up',
              reason: `升级到 ${newLevelConfig.level} 级奖励`,
              relatedType: 'level_up'
            }
          });
        }
      });

      return {
        success: true,
        newBalance: leveledUp ? newBalance + Math.floor(newLevelConfig.level * 10) : newBalance,
        newLevel: newLevelConfig.level,
        leveledUp,
        message: leveledUp ? 
          `恭喜升级到 ${newLevelConfig.level} 级！获得升级奖励 ${Math.floor(newLevelConfig.level * 10)} 积分` : 
          `获得 ${rule.points} 积分，${rule.experience} 经验值`
      };

    } catch (error) {
      console.error('Error adding points:', error);
      return {
        success: false,
        newBalance: 0,
        newLevel: 0,
        leveledUp: false,
        message: '积分添加失败'
      };
    }
  }

  /**
   * 消费积分
   */
  static async consumePoints(
    userId: string, 
    amount: number, 
    reason: string, 
    relatedId?: string,
    relatedType?: string
  ): Promise<{ success: boolean; newBalance: number; message: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.balance < amount) {
        return {
          success: false,
          newBalance: user.balance,
          message: '积分不足'
        };
      }

      const newBalance = user.balance - amount;

      // 使用事务更新
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            balance: newBalance,
            updatedAt: new Date()
          }
        });

        await tx.pointHistory.create({
          data: {
            userId,
            amount: -amount,
            type: 'consume',
            reason,
            relatedId,
            relatedType
          }
        });
      });

      return {
        success: true,
        newBalance,
        message: `消费 ${amount} 积分成功`
      };

    } catch (error) {
      console.error('Error consuming points:', error);
      return {
        success: false,
        newBalance: 0,
        message: '积分消费失败'
      };
    }
  }

  /**
   * 获取用户积分历史
   */
  static async getPointHistory(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{
    history: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const offset = (page - 1) * limit;

      const [history, total] = await Promise.all([
        prisma.pointHistory.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
          select: {
            id: true,
            amount: true,
            type: true,
            reason: true,
            relatedId: true,
            relatedType: true,
            createdAt: true
          }
        }),
        prisma.pointHistory.count({
          where: { userId }
        })
      ]);

      return {
        history,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Error getting point history:', error);
      return {
        history: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      };
    }
  }

  /**
   * 管理员调整用户积分
   */
  static async adminAdjustPoints(
    userId: string,
    pointsAdjustment: number,
    experienceAdjustment: number,
    reason: string,
    adminId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return { success: false, message: '用户不存在' };
      }

      const newBalance = Math.max(0, user.balance + pointsAdjustment);
      const newExperience = Math.max(0, user.experience + experienceAdjustment);
      const newLevelConfig = calculateLevel(newExperience);

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            balance: newBalance,
            experience: newExperience,
            level: newLevelConfig.level,
            updatedAt: new Date()
          }
        });

        if (pointsAdjustment !== 0) {
          await tx.pointHistory.create({
            data: {
              userId,
              amount: pointsAdjustment,
              type: 'admin_adjust',
              reason: `管理员调整: ${reason}`,
              relatedId: adminId,
              relatedType: 'admin'
            }
          });
        }
      });

      return {
        success: true,
        message: `成功调整用户积分 ${pointsAdjustment}，经验值 ${experienceAdjustment}`
      };

    } catch (error) {
      console.error('Error adjusting points:', error);
      return { success: false, message: '调整失败' };
    }
  }

  /**
   * 每日签到
   */
  static async dailyLogin(userId: string): Promise<{
    success: boolean;
    points: number;
    experience: number;
    consecutiveDays: number;
    message: string;
  }> {
    try {
      // 检查今天是否已经签到
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayLogin = await prisma.pointHistory.findFirst({
        where: {
          userId,
          type: 'login',
          createdAt: {
            gte: today
          }
        }
      });

      if (todayLogin) {
        return {
          success: false,
          points: 0,
          experience: 0,
          consecutiveDays: 0,
          message: '今日已经签到过了'
        };
      }

      // 计算连续签到天数
      const consecutiveDays = await this.getConsecutiveLoginDays(userId);
      
      // 基础签到奖励
      const baseRule = getPointRule('login')!;
      let totalPoints = baseRule.points;
      let totalExperience = baseRule.experience;

      // 连续签到奖励
      if (consecutiveDays >= 7) {
        totalPoints += 20;
        totalExperience += 15;
      }
      if (consecutiveDays >= 30) {
        totalPoints += 50;
        totalExperience += 30;
      }

      // 添加签到积分
      const result = await this.addPoints({
        userId,
        type: 'login',
        amount: totalPoints,
        reason: `每日签到 (连续${consecutiveDays}天)`
      });

      return {
        success: result.success,
        points: totalPoints,
        experience: totalExperience,
        consecutiveDays,
        message: result.message
      };

    } catch (error) {
      console.error('Error daily login:', error);
      return {
        success: false,
        points: 0,
        experience: 0,
        consecutiveDays: 0,
        message: '签到失败'
      };
    }
  }

  /**
   * 计算连续签到天数
   */
  private static async getConsecutiveLoginDays(userId: string): Promise<number> {
    try {
      const loginHistory = await prisma.pointHistory.findMany({
        where: {
          userId,
          type: 'login'
        },
        orderBy: { createdAt: 'desc' },
        take: 365 // 最多查询一年
      });

      if (loginHistory.length === 0) return 1;

      let consecutiveDays = 1;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 1; i < loginHistory.length; i++) {
        const currentDate = new Date(loginHistory[i].createdAt);
        currentDate.setHours(0, 0, 0, 0);
        
        const previousDate = new Date(loginHistory[i - 1].createdAt);
        previousDate.setHours(0, 0, 0, 0);

        const dayDiff = (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

        if (dayDiff === 1) {
          consecutiveDays++;
        } else {
          break;
        }
      }

      return consecutiveDays;

    } catch (error) {
      console.error('Error calculating consecutive login days:', error);
      return 1;
    }
  }
}