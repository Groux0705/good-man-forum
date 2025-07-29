import express from 'express';
import { getTopics, getTopic, createTopic, updateTopic, deleteTopic, searchTopics, voteTopic, getTopicVotes } from '../controllers/topics';
import { authenticate, optionalAuth } from '../middleware/auth';
import { createContentLimiter } from '../middleware/rateLimiter';
import { checkBanStatus, checkMuteStatus } from '../middleware/punishmentCheck';

const router = express.Router();

router.get('/', optionalAuth, getTopics);
router.get('/search', optionalAuth, searchTopics);
router.get('/:id', optionalAuth, getTopic);
router.get('/:id/votes', optionalAuth, getTopicVotes);
router.post('/', authenticate, checkBanStatus, checkMuteStatus, createContentLimiter, createTopic);
router.post('/:id/vote', authenticate, checkBanStatus, voteTopic);
router.put('/:id', authenticate, checkBanStatus, checkMuteStatus, updateTopic);
router.delete('/:id', authenticate, checkBanStatus, deleteTopic);

export default router;