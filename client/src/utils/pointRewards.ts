// 积分奖励配置
export const POINT_REWARDS = {
  POST_TOPIC: { points: 10, experience: 10, reason: '发布主题' },
  REPLY: { points: 5, experience: 5, reason: '发表回复' },
  GIVE_LIKE: { points: 2, experience: 2, reason: '点赞主题' },
  GIVE_FAVORITE: { points: 3, experience: 3, reason: '收藏主题' },
  RECEIVE_LIKE: { points: 5, experience: 5, reason: '获得点赞' },
  RECEIVE_FAVORITE: { points: 8, experience: 8, reason: '获得收藏' },
  DAILY_CHECKIN: { points: 5, experience: 5, reason: '每日签到' }
} as const;

export type RewardType = keyof typeof POINT_REWARDS;

export const getReward = (type: RewardType) => POINT_REWARDS[type];