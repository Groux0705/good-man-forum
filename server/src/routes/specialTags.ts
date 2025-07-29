import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserSpecialTags,
  getAllSpecialTags,
  checkConditionalTags,
  getSpecialTagDetail,
  getTagStats
} from '../controllers/specialTags';

const router = Router();

// 获取用户的专属标识
router.get('/user', authenticate, getUserSpecialTags);

// 获取所有可用的专属标识
router.get('/all', authenticate, getAllSpecialTags);

// 检查并授予条件标识
router.post('/check', authenticate, checkConditionalTags);

// 获取专属标识详情
router.get('/:id', authenticate, getSpecialTagDetail);

// 获取标识统计信息
router.get('/:id/stats', authenticate, getTagStats);

export default router;