/**
 * 用户等级和积分系统
 */

// 等级配置
export interface LevelConfig {
  level: number;
  requiredExp: number;
  title: string;
  privileges: string[];
  badge?: string;
}

// 积分获取规则
export interface PointRule {
  type: string;
  points: number;
  experience: number;
  description: string;
  dailyLimit?: number; // 每日获取上限
}

// 等级配置表 (1-50级)
export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, requiredExp: 0, title: "初出茅庐", privileges: ["基础发帖", "基础回复"], badge: "🌱" },
  { level: 2, requiredExp: 100, title: "略有小成", privileges: ["基础发帖", "基础回复"], badge: "🌿" },
  { level: 3, requiredExp: 300, title: "渐入佳境", privileges: ["基础发帖", "基础回复", "上传头像"], badge: "🍃" },
  { level: 4, requiredExp: 600, title: "小有名气", privileges: ["基础发帖", "基础回复", "上传头像"], badge: "🌾" },
  { level: 5, requiredExp: 1000, title: "崭露头角", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程"], badge: "🌺" },
  { level: 6, requiredExp: 1500, title: "声名鹊起", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程"], badge: "🌸" },
  { level: 7, requiredExp: 2100, title: "名声在外", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程"], badge: "🌼" },
  { level: 8, requiredExp: 2800, title: "颇有威望", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程"], badge: "🌻" },
  { level: 9, requiredExp: 3600, title: "德高望重", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程"], badge: "🌹" },
  { level: 10, requiredExp: 4500, title: "一代宗师", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程", "版主权限"], badge: "👑" },
  { level: 11, requiredExp: 5500, title: "传奇人物", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程", "版主权限"], badge: "💎" },
  { level: 12, requiredExp: 6600, title: "绝世高手", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程", "版主权限"], badge: "⭐" },
  { level: 13, requiredExp: 7800, title: "武林盟主", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程", "版主权限"], badge: "🏆" },
  { level: 14, requiredExp: 9100, title: "天下第一", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程", "版主权限"], badge: "🎖️" },
  { level: 15, requiredExp: 10500, title: "超凡入圣", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程", "版主权限", "管理权限"], badge: "🔥" },
  // 继续添加到50级...
  { level: 20, requiredExp: 20000, title: "魅力导师", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程", "版主权限", "管理权限"], badge: "💫" },
  { level: 25, requiredExp: 35000, title: "情感大师", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程", "版主权限", "管理权限"], badge: "🌟" },
  { level: 30, requiredExp: 55000, title: "人生导师", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程", "版主权限", "管理权限"], badge: "✨" },
  { level: 40, requiredExp: 100000, title: "至尊导师", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程", "版主权限", "管理权限"], badge: "🎭" },
  { level: 50, requiredExp: 200000, title: "传说中的男人", privileges: ["基础发帖", "基础回复", "上传头像", "创建课程", "版主权限", "管理权限"], badge: "👨‍🏫" }
];

// 积分获取规则配置
export const POINT_RULES: { [key: string]: PointRule } = {
  // 基础行为
  login: { type: 'login', points: 5, experience: 2, description: '每日登录', dailyLimit: 1 },
  post: { type: 'post', points: 10, experience: 15, description: '发布主题' },
  reply: { type: 'reply', points: 5, experience: 8, description: '发表回复' },
  
  // 互动行为
  like_received: { type: 'like_received', points: 3, experience: 5, description: '获得点赞' },
  favorite_received: { type: 'favorite_received', points: 5, experience: 8, description: '获得收藏' },
  give_like: { type: 'give_like', points: 1, experience: 2, description: '点赞他人', dailyLimit: 20 },
  give_favorite: { type: 'give_favorite', points: 2, experience: 3, description: '收藏他人', dailyLimit: 10 },
  
  // 课程相关
  create_course: { type: 'create_course', points: 50, experience: 100, description: '创建课程' },
  complete_lesson: { type: 'complete_lesson', points: 5, experience: 10, description: '完成课程小节' },
  complete_course: { type: 'complete_course', points: 30, experience: 50, description: '完成整个课程' },
  course_comment: { type: 'course_comment', points: 3, experience: 5, description: '课程评论' },
  
  // 特殊奖励
  first_post: { type: 'first_post', points: 20, experience: 30, description: '首次发帖奖励' },
  consecutive_login_7: { type: 'consecutive_login_7', points: 50, experience: 30, description: '连续登录7天' },
  consecutive_login_30: { type: 'consecutive_login_30', points: 200, experience: 100, description: '连续登录30天' },
  
  // 管理员操作
  admin_adjust: { type: 'admin_adjust', points: 0, experience: 0, description: '管理员调整' },
  
  // 消费类型
  consume: { type: 'consume', points: 0, experience: 0, description: '积分消费' }
};

/**
 * 根据经验值计算用户等级
 */
export function calculateLevel(experience: number): LevelConfig {
  for (let i = LEVEL_CONFIGS.length - 1; i >= 0; i--) {
    const config = LEVEL_CONFIGS[i];
    if (experience >= config.requiredExp) {
      return config;
    }
  }
  return LEVEL_CONFIGS[0]; // 默认返回1级
}

/**
 * 获取下一级所需经验值
 */
export function getNextLevelRequiredExp(currentLevel: number): number | null {
  const nextLevelConfig = LEVEL_CONFIGS.find(config => config.level === currentLevel + 1);
  return nextLevelConfig ? nextLevelConfig.requiredExp : null;
}

/**
 * 计算升级进度百分比
 */
export function getLevelProgress(experience: number, currentLevel: number): number {
  const currentLevelConfig = LEVEL_CONFIGS.find(config => config.level === currentLevel);
  const nextLevelConfig = LEVEL_CONFIGS.find(config => config.level === currentLevel + 1);
  
  if (!currentLevelConfig || !nextLevelConfig) {
    return 100; // 已达到最高等级
  }
  
  const currentLevelExp = currentLevelConfig.requiredExp;
  const nextLevelExp = nextLevelConfig.requiredExp;
  const expInCurrentLevel = experience - currentLevelExp;
  const expNeededForNextLevel = nextLevelExp - currentLevelExp;
  
  return Math.min(100, (expInCurrentLevel / expNeededForNextLevel) * 100);
}

/**
 * 获取等级标题和徽章
 */
export function getLevelInfo(level: number): { title: string; badge: string; privileges: string[] } {
  const config = LEVEL_CONFIGS.find(c => c.level === level) || LEVEL_CONFIGS[0];
  return {
    title: config.title,
    badge: config.badge || '🌱',
    privileges: config.privileges
  };
}

/**
 * 检查用户是否有特定权限
 */
export function hasPrivilege(level: number, privilege: string): boolean {
  const config = LEVEL_CONFIGS.find(c => c.level === level);
  return config ? config.privileges.includes(privilege) : false;
}

/**
 * 获取积分规则
 */
export function getPointRule(type: string): PointRule | null {
  return POINT_RULES[type] || null;
}

/**
 * 计算每日签到连续天数奖励
 */
export function calculateConsecutiveLoginBonus(days: number): { points: number; experience: number } {
  if (days >= 30) {
    return { points: 200, experience: 100 };
  } else if (days >= 7) {
    return { points: 50, experience: 30 };
  } else if (days >= 3) {
    return { points: 20, experience: 15 };
  }
  return { points: 0, experience: 0 };
}