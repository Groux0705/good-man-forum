import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserBadges,
  getAllBadges,
  checkBadges,
  getBadgeDetail
} from '../controllers/badges';

const router = Router();

// 获取用户勋章列表
router.get('/user', authenticate, getUserBadges);

// 获取所有可用勋章
router.get('/all', authenticate, getAllBadges);

// 手动检查并授予勋章
router.post('/check', authenticate, checkBadges);

// 获取勋章详情
router.get('/:id', authenticate, getBadgeDetail);

export default router;