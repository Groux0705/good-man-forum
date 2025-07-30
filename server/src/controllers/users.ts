import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { hashPassword, comparePassword, validateEmail } from '../utils/auth';

const prisma = new PrismaClient();

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        balance: true,
        level: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            topics: true,
            replies: true
          }
        },
        punishments: {
          where: {
            status: 'active'
          },
          orderBy: {
            severity: 'desc'
          },
          select: {
            id: true,
            type: true,
            reason: true,
            severity: true,
            startTime: true,
            endTime: true,
            details: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...user,
        topicsCount: user._count.topics,
        repliesCount: user._count.replies
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { username, email, bio, avatar } = req.body;
    const userId = req.user!.id;

    // 检查用户名是否被占用
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Username already exists'
        });
      }
    }

    // 检查邮箱是否被占用
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar })
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        balance: true,
        level: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password || '');
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        level: true,
        balance: true,
        status: true,
        createdAt: true,
        topics: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            node: {
              select: { name: true, title: true }
            }
          }
        },
        replies: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            topic: {
              select: { id: true, title: true }
            }
          }
        },
        _count: {
          select: {
            topics: true,
            replies: true
          }
        },
        punishments: {
          where: {
            status: 'active'
          },
          orderBy: {
            severity: 'desc'
          },
          select: {
            id: true,
            type: true,
            reason: true,
            severity: true,
            startTime: true,
            endTime: true,
            details: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...user,
        topicsCount: user._count.topics,
        repliesCount: user._count.replies
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getUserTopics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const topics = await prisma.topic.findMany({
      where: { userId: id },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        node: {
          select: { id: true, name: true, title: true }
        }
      }
    });

    const total = await prisma.topic.count({ where: { userId: id } });

    res.json({
      success: true,
      data: {
        topics,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get user topics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getUserReplies = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const replies = await prisma.reply.findMany({
      where: { userId: id },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        topic: {
          select: { id: true, title: true }
        }
      }
    });

    const total = await prisma.reply.count({ where: { userId: id } });

    res.json({
      success: true,
      data: {
        replies,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get user replies error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateProfileValidation = [
  body('username').optional().custom(value => {
    if (value && (value.length < 3 || value.length > 20 || !/^[a-zA-Z0-9_]+$/.test(value))) {
      throw new Error('Username must be 3-20 characters and contain only letters, numbers, and underscores');
    }
    return true;
  }),
  body('email').optional().custom(value => {
    if (value && !validateEmail(value)) {
      throw new Error('Please provide a valid email');
    }
    return true;
  }),
  body('bio').optional().isLength({ max: 200 }).withMessage('Bio must be less than 200 characters'),
  body('avatar').optional().custom(value => {
    if (value) {
      // 允许空值
      if (value.trim() === '') {
        return true;
      }
      // 检查是否是有效的URL格式（包括localhost）
      try {
        new URL(value);
        return true;
      } catch (error) {
        throw new Error('Avatar must be a valid URL');
      }
    }
    return true;
  })
];