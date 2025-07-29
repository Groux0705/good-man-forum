import express from 'express';
import { createReply, updateReply, deleteReply } from '../controllers/replies';
import { authenticate } from '../middleware/auth';
import { createContentLimiter } from '../middleware/rateLimiter';
import { checkBanStatus, checkMuteStatus } from '../middleware/punishmentCheck';

const router = express.Router();

router.post('/', authenticate, checkBanStatus, checkMuteStatus, createContentLimiter, createReply);
router.put('/:id', authenticate, checkBanStatus, checkMuteStatus, updateReply);
router.delete('/:id', authenticate, checkBanStatus, deleteReply);

export default router;