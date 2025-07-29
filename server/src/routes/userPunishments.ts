import express from 'express';
import { 
  getCurrentUserPunishments, 
  getAppealablePunishments, 
  submitAppeal, 
  getUserAppeals 
} from '../controllers/userPunishments';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 获取当前用户的处罚状态
router.get('/my-punishments', authenticate, getCurrentUserPunishments);

// 获取可申诉的处罚
router.get('/appealable', authenticate, getAppealablePunishments);

// 提交申诉
router.post('/appeals', authenticate, submitAppeal);

// 获取用户的申诉记录
router.get('/appeals', authenticate, getUserAppeals);

export default router;