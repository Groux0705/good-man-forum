import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SpecialTagService {
  // 授予专属标识给用户
  static async grantSpecialTag(
    userId: string, 
    tagId: string, 
    duration?: number // 持续天数
  ): Promise<boolean> {
    try {
      // 检查标识是否存在且激活
      const tag = await prisma.specialTag.findUnique({
        where: { id: tagId }
      });

      if (!tag || !tag.active) {
        return false;
      }

      // 计算过期时间
      let expiresAt: Date | null = null;
      if (duration && !tag.permanent) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + duration);
      } else if (tag.duration && !tag.permanent) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + tag.duration);
      }

      // 检查用户是否已经拥有该标识
      const existingTag = await prisma.userSpecialTag.findUnique({
        where: {
          userId_tagId: {
            userId,
            tagId
          }
        }
      });

      if (existingTag) {
        // 如果已存在，更新过期时间
        await prisma.userSpecialTag.update({
          where: { id: existingTag.id },
          data: {
            expiresAt,
            active: true,
            grantedAt: new Date()
          }
        });
      } else {
        // 创建新的标识关系
        await prisma.userSpecialTag.create({
          data: {
            userId,
            tagId,
            expiresAt,
            active: true
          }
        });
      }

      return true;
    } catch (error) {
      console.error('授予专属标识失败:', error);
      return false;
    }
  }

  // 撤销用户的专属标识
  static async revokeSpecialTag(userId: string, tagId: string): Promise<boolean> {
    try {
      const result = await prisma.userSpecialTag.updateMany({
        where: {
          userId,
          tagId
        },
        data: {
          active: false
        }
      });

      return result.count > 0;
    } catch (error) {
      console.error('撤销专属标识失败:', error);
      return false;
    }
  }

  // 获取用户的有效专属标识
  static async getUserSpecialTags(userId: string) {
    try {
      const now = new Date();
      
      const userTags = await prisma.userSpecialTag.findMany({
        where: {
          userId,
          active: true,
          OR: [
            { expiresAt: null }, // 永久标识
            { expiresAt: { gt: now } } // 未过期标识
          ]
        },
        include: {
          tag: true
        },
        orderBy: {
          tag: {
            order: 'asc'
          }
        }
      });

      return userTags.map(ut => ({
        id: ut.id,
        tag: ut.tag,
        grantedAt: ut.grantedAt,
        expiresAt: ut.expiresAt,
        isExpiring: ut.expiresAt ? 
          (ut.expiresAt.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000 : // 7天内过期
          false
      }));
    } catch (error) {
      console.error('获取用户专属标识失败:', error);
      return [];
    }
  }

  // 检查并自动授予基于条件的专属标识
  static async checkAndGrantConditionalTags(userId: string): Promise<string[]> {
    try {
      const grantedTags: string[] = [];
      
      // 获取所有有条件的专属标识
      const conditionalTags = await prisma.specialTag.findMany({
        where: {
          active: true,
          condition: { not: null }
        }
      });

      for (const tag of conditionalTags) {
        // 检查用户是否已经拥有该标识
        const existingTag = await prisma.userSpecialTag.findFirst({
          where: {
            userId,
            tagId: tag.id,
            active: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          }
        });

        if (existingTag) {
          continue; // 已经拥有有效标识
        }

        // 解析并检查条件
        const condition = JSON.parse(tag.condition!);
        const eligible = await this.checkTagCondition(userId, condition);
        
        if (eligible) {
          const granted = await this.grantSpecialTag(userId, tag.id);
          if (granted) {
            grantedTags.push(tag.id);
          }
        }
      }

      return grantedTags;
    } catch (error) {
      console.error('检查和授予专属标识失败:', error);
      return [];
    }
  }

  // 检查标识条件
  private static async checkTagCondition(userId: string, condition: any): Promise<boolean> {
    try {
      switch (condition.type) {
        case 'level':
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { level: true }
          });
          return user ? user.level >= condition.target : false;

        case 'badge_count':
          const badgeCount = await prisma.userBadge.count({
            where: { userId }
          });
          return badgeCount >= condition.target;

        case 'consecutive_checkin':
          // 使用BadgeService的逻辑
          const { BadgeService } = await import('./badgeService');
          return await BadgeService['checkConsecutiveCheckin'](userId, condition.target);

        case 'vip':
          // VIP条件可以基于付费、特殊活动等
          return condition.special === 'manual'; // 需要手动授予

        default:
          return false;
      }
    } catch (error) {
      console.error('检查标识条件失败:', error);
      return false;
    }
  }

  // 清理过期的专属标识
  static async cleanupExpiredTags(): Promise<number> {
    try {
      const now = new Date();
      
      const result = await prisma.userSpecialTag.updateMany({
        where: {
          active: true,
          expiresAt: { lt: now }
        },
        data: {
          active: false
        }
      });

      return result.count;
    } catch (error) {
      console.error('清理过期标识失败:', error);
      return 0;
    }
  }

  // 获取所有可用的专属标识
  static async getAllSpecialTags() {
    try {
      return await prisma.specialTag.findMany({
        where: { active: true },
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
          { createdAt: 'asc' }
        ]
      });
    } catch (error) {
      console.error('获取专属标识列表失败:', error);
      return [];
    }
  }

  // 管理员：创建专属标识
  static async createSpecialTag(tagData: {
    name: string;
    title: string;
    description: string;
    icon: string;
    color?: string;
    category: string;
    privileges?: any;
    condition?: any;
    permanent?: boolean;
    duration?: number;
    order?: number;
  }) {
    try {
      return await prisma.specialTag.create({
        data: {
          ...tagData,
          color: tagData.color || '#3B82F6',
          privileges: tagData.privileges ? JSON.stringify(tagData.privileges) : null,
          condition: tagData.condition ? JSON.stringify(tagData.condition) : null,
          permanent: tagData.permanent || false,
          order: tagData.order || 0
        }
      });
    } catch (error) {
      console.error('创建专属标识失败:', error);
      throw error;
    }
  }

  // 管理员：批量授予标识给用户
  static async batchGrantSpecialTag(
    userIds: string[], 
    tagId: string, 
    duration?: number
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of userIds) {
      const granted = await this.grantSpecialTag(userId, tagId, duration);
      if (granted) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  // 获取标识统计信息
  static async getTagStats(tagId: string) {
    try {
      const now = new Date();
      
      const [totalUsers, activeUsers, expiredUsers] = await Promise.all([
        prisma.userSpecialTag.count({
          where: { tagId }
        }),
        prisma.userSpecialTag.count({
          where: {
            tagId,
            active: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } }
            ]
          }
        }),
        prisma.userSpecialTag.count({
          where: {
            tagId,
            active: false
          }
        })
      ]);

      return {
        totalUsers,
        activeUsers,
        expiredUsers,
        inactiveUsers: totalUsers - activeUsers - expiredUsers
      };
    } catch (error) {
      console.error('获取标识统计失败:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        expiredUsers: 0,
        inactiveUsers: 0
      };
    }
  }
}