import express from 'express';
import { getTopics, getTopic, createTopic, updateTopic, deleteTopic, searchTopics } from '../controllers/topics';
import { authenticate, optionalAuth } from '../middleware/auth';
import { createContentLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.get('/', optionalAuth, getTopics);
router.get('/search', optionalAuth, searchTopics);
router.get('/:id', optionalAuth, getTopic);
router.post('/', authenticate, createContentLimiter, createTopic);
router.put('/:id', authenticate, updateTopic);
router.delete('/:id', authenticate, deleteTopic);

export default router;