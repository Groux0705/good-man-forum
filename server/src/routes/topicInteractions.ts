import express from 'express';
import { likeTopic, favoriteTopic, getUserLikedTopics, getUserFavoriteTopics, getTopicInteractions } from '../controllers/topicInteractions';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 点赞和收藏操作
router.post('/:id/like', authenticate, likeTopic);
router.post('/:id/favorite', authenticate, favoriteTopic);

// 获取用户的点赞和收藏列表
router.get('/liked', authenticate, getUserLikedTopics);
router.get('/favorited', authenticate, getUserFavoriteTopics);

// 获取主题的交互状态
router.get('/:id/interactions', authenticate, getTopicInteractions);

export default router;