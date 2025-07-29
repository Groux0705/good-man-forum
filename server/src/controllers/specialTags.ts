import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SpecialTagService } from '../services/specialTagService';

// 获取用户的专属标识
export const getUserSpecialTags = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const tags = await SpecialTagService.getUserSpecialTags(userId);
    
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('获取用户专属标识失败:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取所有可用的专属标识
export const getAllSpecialTags = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // 获取所有标识
    const allTags = await SpecialTagService.getAllSpecialTags();
    
    // 获取用户已拥有的标识
    const userTags = await SpecialTagService.getUserSpecialTags(userId);
    const userTagIds = new Set(userTags.map(ut => ut.tag.id));
    
    // 标记用户是否已拥有每个标识
    const tagsWithStatus = allTags.map(tag => ({
      ...tag,
      owned: userTagIds.has(tag.id),
      grantedAt: userTags.find(ut => ut.tag.id === tag.id)?.grantedAt || null,
      expiresAt: userTags.find(ut => ut.tag.id === tag.id)?.expiresAt || null
    }));
    
    res.json({
      success: true,
      data: tagsWithStatus
    });
  } catch (error) {
    console.error('获取专属标识列表失败:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 检查并授予条件标识
export const checkConditionalTags = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const grantedTags = await SpecialTagService.checkAndGrantConditionalTags(userId);
    
    res.json({
      success: true,
      data: {
        grantedTags,
        count: grantedTags.length
      },
      message: grantedTags.length > 0 ? 
        `恭喜！您获得了 ${grantedTags.length} 个新标识` : 
        '暂无新标识可获得'
    });
  } catch (error) {
    console.error('检查条件标识失败:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取专属标识详情
export const getSpecialTagDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // 获取标识信息
    const allTags = await SpecialTagService.getAllSpecialTags();
    const tag = allTags.find(t => t.id === id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Special tag not found'
      });
    }
    
    // 检查用户是否已拥有该标识
    const userTags = await SpecialTagService.getUserSpecialTags(userId);
    const userTag = userTags.find(ut => ut.tag.id === id);
    
    // 解析条件为可读文本
    let conditionText = '';
    if (tag.condition) {
      const condition = JSON.parse(tag.condition);
      
      switch (condition.type) {
        case 'level':
          conditionText = `达到 ${condition.target} 级`;
          break;
        case 'badge_count':
          conditionText = `获得 ${condition.target} 个勋章`;
          break;
        case 'consecutive_checkin':
          conditionText = `连续签到 ${condition.target} 天`;
          break;
        case 'vip':
          conditionText = 'VIP用户专属';
          break;
        default:
          conditionText = '特殊条件';
      }
    } else {
      conditionText = '管理员授予';
    }
    
    // 解析特权
    let privileges = [];
    if (tag.privileges) {
      const privData = JSON.parse(tag.privileges);
      privileges = privData.list || [];
    }
    
    res.json({
      success: true,
      data: {
        ...tag,
        conditionText,
        privileges,
        owned: !!userTag,
        grantedAt: userTag?.grantedAt || null,
        expiresAt: userTag?.expiresAt || null,
        isExpiring: userTag?.isExpiring || false
      }
    });
  } catch (error) {
    console.error('获取专属标识详情失败:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取标识统计信息
export const getTagStats = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const stats = await SpecialTagService.getTagStats(id);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取标识统计失败:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};