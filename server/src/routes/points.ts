import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserPointsInfo,
  getPointHistory,
  dailyCheckIn,
  adminAdjustPoints,
  getPointsLeaderboard,
  consumePoints
} from '../controllers/points';

const router = express.Router();

// 获取用户积分和等级信息
router.get('/info', authenticate, getUserPointsInfo);

// 获取积分历史记录
router.get('/history', authenticate, getPointHistory);

// 每日签到
router.post('/checkin', authenticate, dailyCheckIn);

// 消费积分
router.post('/consume', authenticate, consumePoints);

// 获取积分排行榜
router.get('/leaderboard', getPointsLeaderboard);

// 管理员调整用户积分
router.post('/admin/adjust', authenticate, adminAdjustPoints);

export default router;