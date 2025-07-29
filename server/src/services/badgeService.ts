import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 勋章条件类型
interface BadgeCondition {
  type: 'post_count' | 'reply_count' | 'like_count' | 'level' | 'consecutive_checkin' | 'course_complete' | 'special';
  target?: number;
  period?: 'all_time' | 'month' | 'week' | 'day';
  special?: string;
}

export class BadgeService {
  // 检查用户是否满足勋章条件
  static async checkBadgeCondition(userId: string, condition: BadgeCondition): Promise<boolean> {
    try {
      switch (condition.type) {
        case 'post_count':
          return await this.checkPostCount(userId, condition.target!, condition.period);
        
        case 'reply_count':
          return await this.checkReplyCount(userId, condition.target!, condition.period);
        
        case 'like_count':
          return await this.checkLikeCount(userId, condition.target!, condition.period);
        
        case 'level':
          return await this.checkLevel(userId, condition.target!);
        
        case 'consecutive_checkin':
          return await this.checkConsecutiveCheckin(userId, condition.target!);
        
        case 'course_complete':
          return await this.checkCourseComplete(userId, condition.target!);
        
        default:
          return false;
      }
    } catch (error) {
      console.error('检查勋章条件失败:', error);
      return false;
    }
  }

  // 检查发帖数量
  private static async checkPostCount(userId: string, target: number, period = 'all_time'): Promise<boolean> {
    const where: any = { userId };
    
    if (period !== 'all_time') {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      where.createdAt = { gte: startDate };
    }
    
    const count = await prisma.topic.count({ where });
    return count >= target;
  }

  // 检查回复数量
  private static async checkReplyCount(userId: string, target: number, period = 'all_time'): Promise<boolean> {
    const where: any = { userId };
    
    if (period !== 'all_time') {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      where.createdAt = { gte: startDate };
    }
    
    const count = await prisma.reply.count({ where });
    return count >= target;
  }

  // 检查获得点赞数量
  private static async checkLikeCount(userId: string, target: number, period = 'all_time'): Promise<boolean> {
    const where: any = {
      topic: { userId }
    };
    
    if (period !== 'all_time') {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      where.createdAt = { gte: startDate };
    }
    
    const count = await prisma.topicLike.count({ where });
    return count >= target;
  }

  // 检查用户等级
  private static async checkLevel(userId: string, target: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true }
    });
    
    return user ? user.level >= target : false;
  }

  // 检查连续签到天数
  private static async checkConsecutiveCheckin(userId: string, target: number): Promise<boolean> {
    // 获取最近的签到记录
    const recentCheckins = await prisma.pointHistory.findMany({
      where: {
        userId,
        type: 'checkin'
      },
      orderBy: { createdAt: 'desc' },
      take: target
    });

    if (recentCheckins.length < target) {
      return false;
    }

    // 检查是否连续
    const today = new Date();
    let consecutiveDays = 0;
    
    for (let i = 0; i < recentCheckins.length; i++) {
      const checkinDate = new Date(recentCheckins[i].createdAt);
      const expectedDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      
      // 检查日期是否匹配（忽略时分秒）
      if (
        checkinDate.getFullYear() === expectedDate.getFullYear() &&
        checkinDate.getMonth() === expectedDate.getMonth() &&
        checkinDate.getDate() === expectedDate.getDate()
      ) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return consecutiveDays >= target;
  }

  // 检查课程完成数量
  private static async checkCourseComplete(userId: string, target: number): Promise<boolean> {
    const count = await prisma.courseEnrollment.count({
      where: {
        userId,
        completed: true
      }
    });
    
    return count >= target;
  }

  // 授予勋章给用户
  static async awardBadge(userId: string, badgeId: string): Promise<boolean> {
    try {
      // 检查用户是否已经拥有该勋章
      const existingBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId
          }
        }
      });

      if (existingBadge) {
        return false; // 已经拥有该勋章
      }

      // 获取勋章信息
      const badge = await prisma.badge.findUnique({
        where: { id: badgeId }
      });

      if (!badge || !badge.active) {
        return false;
      }

      // 授予勋章
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId
        }
      });

      // 奖励积分和经验值
      if (badge.points > 0 || badge.experience > 0) {
        const { PointService } = await import('./pointService');
        await PointService.addPoints({
          userId,
          type: 'badge',
          amount: badge.points,
          reason: `获得勋章：${badge.title}`,
          relatedId: badgeId,
          relatedType: 'badge'
        });
      }

      return true;
    } catch (error) {
      console.error('授予勋章失败:', error);
      return false;
    }
  }

  // 检查并授予用户所有符合条件的勋章
  static async checkAndAwardBadges(userId: string): Promise<string[]> {
    try {
      const awardedBadges: string[] = [];
      
      // 获取所有激活的勋章
      const badges = await prisma.badge.findMany({
        where: { active: true }
      });

      for (const badge of badges) {
        // 检查用户是否已经拥有该勋章
        const existingBadge = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId,
              badgeId: badge.id
            }
          }
        });

        if (existingBadge) {
          continue; // 已经拥有该勋章
        }

        // 解析勋章条件
        const condition: BadgeCondition = JSON.parse(badge.condition);
        
        // 检查是否满足条件
        const eligible = await this.checkBadgeCondition(userId, condition);
        
        if (eligible) {
          const awarded = await this.awardBadge(userId, badge.id);
          if (awarded) {
            awardedBadges.push(badge.id);
          }
        }
      }

      return awardedBadges;
    } catch (error) {
      console.error('检查和授予勋章失败:', error);
      return [];
    }
  }

  // 获取用户的勋章列表
  static async getUserBadges(userId: string) {
    try {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: {
          badge: true
        },
        orderBy: {
          earnedAt: 'desc'
        }
      });

      return userBadges.map(ub => ({
        id: ub.id,
        badge: ub.badge,
        earnedAt: ub.earnedAt
      }));
    } catch (error) {
      console.error('获取用户勋章失败:', error);
      return [];
    }
  }

  // 获取所有可用勋章
  static async getAllBadges() {
    try {
      return await prisma.badge.findMany({
        where: { active: true },
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
          { createdAt: 'asc' }
        ]
      });
    } catch (error) {
      console.error('获取勋章列表失败:', error);
      return [];
    }
  }
}