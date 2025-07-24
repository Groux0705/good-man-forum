import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// 点赞主题
export const likeTopic = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // 检查主题是否存在
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true }
        }
      }
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    // 检查是否已经点赞
    const existingLike = await prisma.topicLike.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId: id
        }
      }
    });

    let result;
    if (existingLike) {
      // 如果已点赞，则取消点赞
      await prisma.topicLike.delete({
        where: {
          userId_topicId: {
            userId,
            topicId: id
          }
        }
      });

      // 更新主题点赞数
      await prisma.topic.update({
        where: { id },
        data: { likes: { decrement: 1 } }
      });

      result = { action: 'unliked', liked: false };
    } else {
      // 创建点赞记录
      await prisma.topicLike.create({
        data: {
          userId,
          topicId: id
        }
      });

      // 更新主题点赞数
      await prisma.topic.update({
        where: { id },
        data: { likes: { increment: 1 } }
      });

      result = { action: 'liked', liked: true };

      // 发送通知给主题作者（如果不是给自己点赞）
      if (topic.userId !== userId) {
        try {
          const { notificationService } = await import('../services/notificationService');
          const liker = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true }
          });

          await notificationService.createTopicLikeNotification(
            topic.userId,
            userId,
            id,
            topic.title,
            liker?.username || '匿名用户'
          );
        } catch (notificationError) {
          console.error('发送点赞通知失败:', notificationError);
          // 不影响点赞操作的成功
        }
      }
    }

    // 获取最新的点赞数
    const updatedTopic = await prisma.topic.findUnique({
      where: { id },
      select: { likes: true }
    });

    res.json({
      success: true,
      data: {
        ...result,
        likes: updatedTopic?.likes || 0
      }
    });
  } catch (error) {
    console.error('Like topic error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 收藏主题
export const favoriteTopic = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // 检查主题是否存在
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true }
        }
      }
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    // 检查是否已经收藏
    const existingFavorite = await prisma.topicFavorite.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId: id
        }
      }
    });

    let result;
    if (existingFavorite) {
      // 如果已收藏，则取消收藏
      await prisma.topicFavorite.delete({
        where: {
          userId_topicId: {
            userId,
            topicId: id
          }
        }
      });

      // 更新主题收藏数
      await prisma.topic.update({
        where: { id },
        data: { favorites: { decrement: 1 } }
      });

      result = { action: 'unfavorited', favorited: false };
    } else {
      // 创建收藏记录
      await prisma.topicFavorite.create({
        data: {
          userId,
          topicId: id
        }
      });

      // 更新主题收藏数
      await prisma.topic.update({
        where: { id },
        data: { favorites: { increment: 1 } }
      });

      result = { action: 'favorited', favorited: true };

      // 发送通知给主题作者（如果不是给自己收藏）
      if (topic.userId !== userId) {
        try {
          const { notificationService } = await import('../services/notificationService');
          const favoriter = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true }
          });

          await notificationService.createTopicFavoriteNotification(
            topic.userId,
            userId,
            id,
            topic.title,
            favoriter?.username || '匿名用户'
          );
        } catch (notificationError) {
          console.error('发送收藏通知失败:', notificationError);
          // 不影响收藏操作的成功
        }
      }
    }

    // 获取最新的收藏数
    const updatedTopic = await prisma.topic.findUnique({
      where: { id },
      select: { favorites: true }
    });

    res.json({
      success: true,
      data: {
        ...result,
        favorites: updatedTopic?.favorites || 0
      }
    });
  } catch (error) {
    console.error('Favorite topic error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取用户点赞的主题列表
export const getUserLikedTopics = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user!.id;
    const skip = (Number(page) - 1) * Number(limit);

    const likedTopics = await prisma.topicLike.findMany({
      where: { userId },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        topic: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true }
            },
            node: {
              select: { id: true, name: true, title: true }
            }
          }
        }
      }
    });

    const total = await prisma.topicLike.count({
      where: { userId }
    });

    res.json({
      success: true,
      data: {
        topics: likedTopics.map(like => like.topic),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get user liked topics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取用户收藏的主题列表
export const getUserFavoriteTopics = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user!.id;
    const skip = (Number(page) - 1) * Number(limit);

    const favoriteTopics = await prisma.topicFavorite.findMany({
      where: { userId },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        topic: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true }
            },
            node: {
              select: { id: true, name: true, title: true }
            }
          }
        }
      }
    });

    const total = await prisma.topicFavorite.count({
      where: { userId }
    });

    res.json({
      success: true,
      data: {
        topics: favoriteTopics.map(favorite => favorite.topic),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get user favorite topics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取主题的点赞和收藏状态（用于前端显示状态）
export const getTopicInteractions = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [liked, favorited, topic] = await Promise.all([
      prisma.topicLike.findUnique({
        where: {
          userId_topicId: { userId, topicId: id }
        }
      }),
      prisma.topicFavorite.findUnique({
        where: {
          userId_topicId: { userId, topicId: id }
        }
      }),
      prisma.topic.findUnique({
        where: { id },
        select: { likes: true, favorites: true }
      })
    ]);

    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    res.json({
      success: true,
      data: {
        liked: !!liked,
        favorited: !!favorited,
        likes: topic.likes,
        favorites: topic.favorites
      }
    });
  } catch (error) {
    console.error('Get topic interactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};