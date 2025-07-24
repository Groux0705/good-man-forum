import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface NotificationData {
  topicId?: string;
  replyId?: string;
  courseId?: string;
  commentId?: string;
  voteType?: string;
  fromUserId?: string;
  fromUsername?: string;
}

export interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  content: string;
  data?: NotificationData;
  actionUrl?: string;
}

class NotificationService {
  async createNotification(params: CreateNotificationParams) {
    const { userId, type, title, content, data, actionUrl } = params;
    
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          content,
          data: data ? JSON.stringify(data) : null,
          actionUrl,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            }
          }
        }
      });

      // TODO: 这里可以添加实时推送逻辑 (WebSocket/SSE)
      this.sendRealtimeNotification(notification);

      return notification;
    } catch (error) {
      console.error('创建通知失败:', error);
      throw error;
    }
  }

  async getNotifications(userId: string, options: { page?: number; limit?: number; unreadOnly?: boolean } = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const skip = (page - 1) * limit;

    try {
      const where = unreadOnly ? { userId, read: false } : { userId };
      
      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where })
      ]);

      return {
        notifications: notifications.map(notification => ({
          ...notification,
          data: notification.data ? JSON.parse(notification.data) : null
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('获取通知列表失败:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          read: false
        }
      });
      return count;
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId // 确保用户只能标记自己的通知
        },
        data: {
          read: true
        }
      });

      return notification;
    } catch (error) {
      console.error('标记通知为已读失败:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          read: false
        },
        data: {
          read: true
        }
      });

      return result;
    } catch (error) {
      console.error('标记所有通知为已读失败:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.delete({
        where: {
          id: notificationId,
          userId
        }
      });

      return notification;
    } catch (error) {
      console.error('删除通知失败:', error);
      throw error;
    }
  }

  // 业务通知创建方法
  async createTopicReplyNotification(topicAuthorId: string, replyAuthorId: string, topicId: string, replyId: string, topicTitle: string, replyAuthorUsername: string) {
    if (topicAuthorId === replyAuthorId) return; // 不给自己发通知

    return this.createNotification({
      userId: topicAuthorId,
      type: 'topic_reply',
      title: '有人回复了你的主题',
      content: `${replyAuthorUsername} 回复了你的主题《${topicTitle}》`,
      data: {
        topicId,
        replyId,
        fromUserId: replyAuthorId,
        fromUsername: replyAuthorUsername
      },
      actionUrl: `/topic/${topicId}#reply-${replyId}`
    });
  }

  async createCommentReplyNotification(commentAuthorId: string, replyAuthorId: string, topicId: string, replyId: string, parentReplyId: string, replyAuthorUsername: string) {
    if (commentAuthorId === replyAuthorId) return; // 不给自己发通知

    return this.createNotification({
      userId: commentAuthorId,
      type: 'comment_reply',
      title: '有人回复了你的评论',
      content: `${replyAuthorUsername} 回复了你的评论`,
      data: {
        topicId,
        replyId,
        fromUserId: replyAuthorId,
        fromUsername: replyAuthorUsername
      },
      actionUrl: `/topic/${topicId}#reply-${replyId}`
    });
  }

  async createTopicVoteNotification(topicAuthorId: string, voterId: string, topicId: string, voteType: string, topicTitle: string, voterUsername: string) {
    if (topicAuthorId === voterId) return; // 不给自己发通知

    const action = voteType === 'up' ? '点赞' : '踩';
    
    return this.createNotification({
      userId: topicAuthorId,
      type: 'topic_vote',
      title: `有人${action}了你的主题`,
      content: `${voterUsername} ${action}了你的主题《${topicTitle}》`,
      data: {
        topicId,
        voteType,
        fromUserId: voterId,
        fromUsername: voterUsername
      },
      actionUrl: `/topic/${topicId}`
    });
  }

  async createCourseCommentNotification(courseAuthorId: string, commentAuthorId: string, courseId: string, commentId: string, courseTitle: string, commentAuthorUsername: string) {
    if (courseAuthorId === commentAuthorId) return; // 不给自己发通知

    return this.createNotification({
      userId: courseAuthorId,
      type: 'course_comment',
      title: '有人评论了你的课程',
      content: `${commentAuthorUsername} 评论了你的课程《${courseTitle}》`,
      data: {
        courseId,
        commentId,
        fromUserId: commentAuthorId,
        fromUsername: commentAuthorUsername
      },
      actionUrl: `/course/${courseId}#comment-${commentId}`
    });
  }

  async createCourseEnrollmentNotification(courseAuthorId: string, studentId: string, courseId: string, courseTitle: string, studentUsername: string) {
    if (courseAuthorId === studentId) return; // 不给自己发通知

    return this.createNotification({
      userId: courseAuthorId,
      type: 'course_enrollment',
      title: '有人报名了你的课程',
      content: `${studentUsername} 报名了你的课程《${courseTitle}》`,
      data: {
        courseId,
        fromUserId: studentId,
        fromUsername: studentUsername
      },
      actionUrl: `/course/${courseId}`
    });
  }

  async createTopicLikeNotification(topicAuthorId: string, likeUserId: string, topicId: string, topicTitle: string, likeUsername: string) {
    if (topicAuthorId === likeUserId) return; // 不给自己发通知

    return this.createNotification({
      userId: topicAuthorId,
      type: 'topic_like',
      title: '有人点赞了你的主题',
      content: `${likeUsername} 点赞了你的主题《${topicTitle}》`,
      data: {
        topicId,
        fromUserId: likeUserId,
        fromUsername: likeUsername
      },
      actionUrl: `/topic/${topicId}`
    });
  }

  async createTopicFavoriteNotification(topicAuthorId: string, favoriteUserId: string, topicId: string, topicTitle: string, favoriteUsername: string) {
    if (topicAuthorId === favoriteUserId) return; // 不给自己发通知

    return this.createNotification({
      userId: topicAuthorId,
      type: 'topic_favorite',
      title: '有人收藏了你的主题',
      content: `${favoriteUsername} 收藏了你的主题《${topicTitle}》`,
      data: {
        topicId,
        fromUserId: favoriteUserId,
        fromUsername: favoriteUsername
      },
      actionUrl: `/topic/${topicId}`
    });
  }

  // 实时推送通知 (后续可以扩展为WebSocket/SSE)
  private sendRealtimeNotification(notification: any) {
    // TODO: 实现WebSocket推送
    console.log('实时通知推送:', notification);
  }
}

export const notificationService = new NotificationService();
export default notificationService;