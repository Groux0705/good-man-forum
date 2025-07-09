import express from 'express';
import { 
  getProfile, 
  getUserById, 
  updateProfile, 
  updatePassword, 
  getUserTopics, 
  getUserReplies,
  updateProfileValidation 
} from '../controllers/users';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);
router.put('/password', authenticate, updatePassword);
router.get('/:id', getUserById);
router.get('/:id/topics', getUserTopics);
router.get('/:id/replies', getUserReplies);

export default router;