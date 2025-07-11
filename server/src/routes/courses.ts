import express from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// 获取课程列表
const getCourses = async (req: express.Request, res: express.Response) => {
  try {
    const { page = 1, limit = 12, category, search, sort = 'latest', type } = req.query;
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

    // 处理排序
    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'popular':
        orderBy = { likes: 'desc' };
        break;
      case 'views':
        orderBy = { views: 'desc' };
        break;
      case 'likes':
        orderBy = { likes: 'desc' };
        break;
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const courses = await prisma.course.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy,
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        _count: {
          select: { comments: true, chapters: true, enrollmentList: true }
        }
      }
    });

    const total = await prisma.course.count({ where });

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取单个课程详情
const getCourse = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, level: true }
        },
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: { id: true, title: true, type: true, duration: true, order: true }
            }
          }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, username: true, avatar: true, level: true }
            }
          }
        },
        enrollmentList: {
          select: { id: true, userId: true, enrolledAt: true, progress: true }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // 增加观看次数
    await prisma.course.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 创建课程
const createCourse = async (req: AuthRequest, res: express.Response) => {
  try {
    const { 
      title, 
      description, 
      thumbnail, 
      category, 
      tags, 
      difficulty = 'beginner',
      requirements,
      objectives,
      chapters = []
    } = req.body;
    const userId = req.user!.id;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title and category are required'
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

    // 验证难度等级
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid difficulty level'
      });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnail,
        category,
        tags,
        difficulty,
        requirements,
        objectives,
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
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 添加课程评论
const addCourseComment = async (req: AuthRequest, res: express.Response) => {
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

    // 验证课程是否存在
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const comment = await prisma.courseComment.create({
      data: {
        content: content.trim(),
        userId,
        courseId: id
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
    console.error('Add course comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 点赞课程
const likeCourse = async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: { likes: { increment: 1 } }
    });

    res.json({
      success: true,
      data: { likes: updatedCourse.likes }
    });
  } catch (error) {
    console.error('Like course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 报名课程
const enrollCourse = async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // 检查是否已报名
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: id }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'Already enrolled in this course'
      });
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId,
        courseId: id
      }
    });

    // 更新课程报名人数
    await prisma.course.update({
      where: { id },
      data: { enrollments: { increment: 1 } }
    });

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取课程小节详情
const getLesson = async (req: express.Request, res: express.Response) => {
  try {
    const { courseId, lessonId } = req.params;

    const lesson = await prisma.courseLesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            course: {
              select: { id: true, title: true, userId: true }
            }
          }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    // 验证课程ID匹配
    if (lesson.chapter.course.id !== courseId) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found in this course'
      });
    }

    // 增加观看次数
    await prisma.courseLesson.update({
      where: { id: lessonId },
      data: { views: { increment: 1 } }
    });

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 路由定义
router.get('/', getCourses);
router.get('/:id', getCourse);
router.get('/:courseId/lessons/:lessonId', getLesson);
router.post('/', authenticate, createCourse);
router.post('/:id/comments', authenticate, addCourseComment);
router.post('/:id/like', authenticate, likeCourse);
router.post('/:id/enroll', authenticate, enrollCourse);

export default router;