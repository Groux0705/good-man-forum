import express from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// 获取视频列表
const getVideos = async (req: express.Request, res: express.Response) => {
  try {
    const { page = 1, limit = 12, category, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let where: any = { published: true };
    
    if (category && category !== 'all') {
      where.category = String(category);
    }
    
    if (search) {
      const searchTerm = String(search);
      where.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { tags: { contains: searchTerm } }
      ];
    }

    const videos = await prisma.video.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        _count: {
          select: { comments: true }
        }
      }
    });

    const total = await prisma.video.count({ where });

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取单个视频详情
const getVideo = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, level: true }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, username: true, avatar: true, level: true }
            }
          }
        }
      }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    // 增加观看次数
    await prisma.video.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 创建视频
const createVideo = async (req: AuthRequest, res: express.Response) => {
  try {
    const { title, description, thumbnail, videoUrl, platform, category, tags, duration } = req.body;
    const userId = req.user!.id;

    if (!title || !videoUrl || !platform || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, video URL, platform, and category are required'
      });
    }

    // 验证平台类型
    const validPlatforms = ['youtube', 'bilibili', 'local'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform'
      });
    }

    // 验证分类
    const validCategories = ['relationship', 'communication', 'self-improvement', 'dating', 'psychology'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        thumbnail: thumbnail || '',
        videoUrl,
        platform,
        category,
        tags,
        duration: duration ? Number(duration) : null,
        userId,
        published: true
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 添加视频评论
const addVideoComment = async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    // 验证视频是否存在
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    const comment = await prisma.videoComment.create({
      data: {
        content: content.trim(),
        userId,
        videoId: id
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, level: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Add video comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 点赞视频
const likeVideo = async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    const updatedVideo = await prisma.video.update({
      where: { id },
      data: { likes: { increment: 1 } }
    });

    res.json({
      success: true,
      data: { likes: updatedVideo.likes }
    });
  } catch (error) {
    console.error('Like video error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 路由定义
router.get('/', getVideos);
router.get('/:id', getVideo);
router.post('/', authenticate, createVideo);
router.post('/:id/comments', authenticate, addVideoComment);
router.post('/:id/like', authenticate, likeVideo);

export default router;