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
        courses: courses.map(course => ({
          ...course,
          enrollments: course._count.enrollmentList, // 统一使用实际的报名数量
          chaptersCount: course._count.chapters,
          commentsCount: course._count.comments
        })),
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

    // 计算课程总时长
    const totalDuration = course.chapters.reduce((sum, chapter) => {
      return sum + chapter.lessons.reduce((chapterSum, lesson) => {
        return chapterSum + (lesson.duration || 0);
      }, 0);
    }, 0);

    res.json({
      success: true,
      data: {
        ...course,
        totalDuration,
        chaptersCount: course.chapters.length,
        lessonsCount: course.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0),
        enrollments: course.enrollmentList.length, // 使用实际的报名数量
        commentsCount: course.comments.length
      }
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

    // 获取章节中的所有课程以便导航
    const chapterLessons = await prisma.courseLesson.findMany({
      where: { chapterId: lesson.chapterId },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, order: true }
    });

    // 获取课程的所有章节和课程信息
    const allChapters = await prisma.courseChapter.findMany({
      where: { courseId: lesson.chapter.course.id },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, order: true }
        }
      }
    });

    res.json({
      success: true,
      data: {
        ...lesson,
        chapterLessons,
        allChapters,
        navigation: {
          courseId: lesson.chapter.course.id,
          courseTitle: lesson.chapter.course.title,
          chapterId: lesson.chapterId,
          chapterTitle: lesson.chapter.title,
          chapterOrder: lesson.chapter.order
        }
      }
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取用户课程进度
const getCourseProgress = async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // 检查用户是否已报名
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: id }
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Not enrolled in this course'
      });
    }

    // 获取课程的所有小节
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: { id: true }
            }
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // 获取用户的学习进度
    const userProgress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lesson: {
          chapter: {
            courseId: id
          }
        }
      },
      include: {
        lesson: {
          select: { id: true, chapterId: true }
        }
      }
    });

    // 计算总体进度
    const totalLessons = course.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
    const completedLessons = userProgress.filter(p => p.completed).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // 更新报名记录中的进度
    await prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: { progress: progressPercentage }
    });

    res.json({
      success: true,
      data: {
        totalLessons,
        completedLessons,
        progressPercentage,
        completedLessonIds: userProgress.filter(p => p.completed).map(p => p.lesson.id)
      }
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 更新小节完成状态
const updateLessonProgress = async (req: AuthRequest, res: express.Response) => {
  try {
    const { courseId, lessonId } = req.params;
    const { completed = true } = req.body;
    const userId = req.user!.id;

    // 验证用户是否已报名课程
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: 'Not enrolled in this course'
      });
    }

    // 验证小节是否属于该课程
    const lesson = await prisma.courseLesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          select: { courseId: true }
        }
      }
    });

    if (!lesson || lesson.chapter.courseId !== courseId) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found in this course'
      });
    }

    // 更新或创建学习进度记录
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId }
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null
      },
      create: {
        userId,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null
      }
    });

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Update lesson progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 路由定义
router.get('/', getCourses);
router.get('/:id', getCourse);
router.get('/:id/progress', authenticate, getCourseProgress);
router.get('/:courseId/lessons/:lessonId', getLesson);
router.post('/', authenticate, createCourse);
router.post('/:id/comments', authenticate, addCourseComment);
router.post('/:id/like', authenticate, likeCourse);
router.post('/:id/enroll', authenticate, enrollCourse);
router.post('/:courseId/lessons/:lessonId/progress', authenticate, updateLessonProgress);

export default router;