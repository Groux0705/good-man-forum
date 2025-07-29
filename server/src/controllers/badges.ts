import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BadgeService } from '../services/badgeService';

// 获取用户勋章列表
export const getUserBadges = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const badges = await BadgeService.getUserBadges(userId);
    
    res.json({
      success: true,
      data: badges
    });
  } catch (error) {
    console.error('获取用户勋章失败:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取所有可用勋章
export const getAllBadges = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // 获取所有勋章
    const allBadges = await BadgeService.getAllBadges();
    
    // 获取用户已获得的勋章
    const userBadges = await BadgeService.getUserBadges(userId);
    const userBadgeIds = new Set(userBadges.map(ub => ub.badge.id));
    
    // 标记用户是否已获得每个勋章
    const badgesWithStatus = allBadges.map(badge => ({
      ...badge,
      earned: userBadgeIds.has(badge.id),
      earnedAt: userBadges.find(ub => ub.badge.id === badge.id)?.earnedAt || null
    }));
    
    res.json({
      success: true,
      data: badgesWithStatus
    });
  } catch (error) {
    console.error('获取勋章列表失败:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 手动检查并授予勋章（用于测试或管理员操作）
export const checkBadges = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const awardedBadges = await BadgeService.checkAndAwardBadges(userId);
    
    res.json({
      success: true,
      data: {
        awardedBadges,
        count: awardedBadges.length
      },
      message: awardedBadges.length > 0 ? 
        `恭喜！您获得了 ${awardedBadges.length} 个新勋章` : 
        '暂无新勋章可获得'
    });
  } catch (error) {
    console.error('检查勋章失败:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取勋章详情
export const getBadgeDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // 获取勋章信息
    const allBadges = await BadgeService.getAllBadges();
    const badge = allBadges.find(b => b.id === id);
    
    if (!badge) {
      return res.status(404).json({
        success: false,
        error: 'Badge not found'
      });
    }
    
    // 检查用户是否已获得该勋章
    const userBadges = await BadgeService.getUserBadges(userId);
    const userBadge = userBadges.find(ub => ub.badge.id === id);
    
    // 解析条件为可读文本
    const condition = JSON.parse(badge.condition);
    let conditionText = '';
    
    switch (condition.type) {
      case 'post_count':
        conditionText = `发布 ${condition.target} 个主题`;
        if (condition.period && condition.period !== 'all_time') {
          const periodMap = {
            'day': '当日',
            'week': '一周内',
            'month': '当月'
          };
          conditionText += `（${periodMap[condition.period as keyof typeof periodMap]}）`;
        }
        break;
      case 'reply_count':
        conditionText = `发表 ${condition.target} 个回复`;
        break;
      case 'like_count':
        conditionText = `获得 ${condition.target} 个点赞`;
        break;
      case 'level':
        conditionText = `达到 ${condition.target} 级`;
        break;
      case 'consecutive_checkin':
        conditionText = `连续签到 ${condition.target} 天`;
        break;
      case 'course_complete':
        conditionText = `完成 ${condition.target} 门课程`;
        break;
      default:
        conditionText = '特殊条件';
    }
    
    res.json({
      success: true,
      data: {
        ...badge,
        conditionText,
        earned: !!userBadge,
        earnedAt: userBadge?.earnedAt || null
      }
    });
  } catch (error) {
    console.error('获取勋章详情失败:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};