import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserDailyTasks,
  getUserTaskStats,
  updateTaskProgress,
  getAllDailyTasks
} from '../controllers/dailyTasks';

const router = Router();

// 获取用户今日任务
router.get('/user', authenticate, getUserDailyTasks);

// 获取用户任务完成历史统计
router.get('/user/stats', authenticate, getUserTaskStats);

// 手动更新任务进度（用于测试）
router.post('/progress', authenticate, updateTaskProgress);

// 获取所有可用的每日任务模板
router.get('/all', authenticate, getAllDailyTasks);

export default router;