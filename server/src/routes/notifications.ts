import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notificationService';

const router = express.Router();

// 获取通知列表
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { page = '1', limit = '20', unreadOnly = 'false' } = req.query;
    const userId = req.user!.id;

    const result = await notificationService.getNotifications(userId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      unreadOnly: unreadOnly === 'true'
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取通知列表失败:', error);
    res.status(500).json({ 
      success: false,
      error: '获取通知列表失败' 
    });
  }
});

// 获取未读通知数量
router.get('/unread-count', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    res.status(500).json({ success: false, error: '获取未读通知数量失败' });
  }
});

// 标记单个通知为已读
router.put('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const notification = await notificationService.markAsRead(id, userId);
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('标记通知为已读失败:', error);
    res.status(500).json({ success: false, error: '标记通知为已读失败' });
  }
});

// 标记所有通知为已读
router.put('/mark-all-read', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const result = await notificationService.markAllAsRead(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('标记所有通知为已读失败:', error);
    res.status(500).json({ success: false, error: '标记所有通知为已读失败' });
  }
});

// 删除通知
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await notificationService.deleteNotification(id, userId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('删除通知失败:', error);
    res.status(500).json({ success: false, error: '删除通知失败' });
  }
});

export default router;