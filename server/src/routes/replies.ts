import express from 'express';
import { createReply, updateReply, deleteReply } from '../controllers/replies';
import { authenticate } from '../middleware/auth';
import { createContentLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post('/', authenticate, createContentLimiter, createReply);
router.put('/:id', authenticate, updateReply);
router.delete('/:id', authenticate, deleteReply);

export default router;