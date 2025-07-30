import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken, validateEmail, validateUsername } from '../utils/auth';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const registerValidation = [
  body('username').custom(value => {
    if (!validateUsername(value)) {
      throw new Error('Username must be 3-20 characters and contain only letters, numbers, and underscores');
    }
    return true;
  }),
  body('email').custom(value => {
    if (!validateEmail(value)) {
      throw new Error('Please provide a valid email');
    }
    return true;
  }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: errors.array()[0].msg 
      });
    }

    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email, provider: 'local' }  // 只检查本地注册的用户
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.username === username ? 'Username already exists' : 'Email already exists'
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        provider: 'local'
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        balance: true,
        level: true,
        createdAt: true
      }
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      },
      include: {
        punishments: {
          where: {
            status: 'active'
          },
          orderBy: {
            severity: 'desc'
          },
          take: 1
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // OAuth用户没有密码，不能通过传统方式登录
    if (user.provider !== 'local') {
      return res.status(401).json({
        success: false,
        error: `Please login with ${user.provider}`
      });
    }

    if (!(await comparePassword(password, user.password!))) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = generateToken(user.id);
    const { password: _, punishments, ...userWithoutPassword } = user;

    const activePunishment = punishments && punishments.length > 0 ? punishments[0] : null;

    res.json({
      success: true,
      data: { 
        user: userWithoutPassword, 
        token,
        punishment: activePunishment ? {
          id: activePunishment.id,
          type: activePunishment.type,
          reason: activePunishment.reason,
          severity: activePunishment.severity,
          startTime: activePunishment.startTime,
          endTime: activePunishment.endTime,
          details: activePunishment.details
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 发送密码重置邮件
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱地址'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的邮箱地址'
      });
    }

    // 查找用户（只查找本地注册用户的密码重置）
    const user = await prisma.user.findFirst({
      where: { 
        email,
        provider: 'local'
      }
    });

    if (!user) {
      // 为了安全，即使用户不存在也返回成功消息
      return res.json({
        success: true,
        message: '如果邮箱存在，重置链接已发送到您的邮箱'
      });
    }

    // 生成重置令牌
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30分钟后过期

    // 删除旧的重置令牌
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    // 创建新的重置令牌
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // TODO: 发送邮件 - 这里暂时只返回令牌用于测试
    console.log(`密码重置令牌: ${token}`);
    console.log(`用户: ${user.email}`);
    console.log(`过期时间: ${expiresAt}`);

    res.json({
      success: true,
      message: '如果邮箱存在，重置链接已发送到您的邮箱',
      // 仅在开发环境下返回令牌
      ...(process.env.NODE_ENV === 'development' && { token })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: '内部服务器错误'
    });
  }
};

// 重置密码
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: '令牌和新密码都是必需的'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: '密码长度至少需要6个字符'
      });
    }

    // 查找重置令牌
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        error: '无效的重置令牌'
      });
    }

    if (resetToken.used) {
      return res.status(400).json({
        success: false,
        error: '重置令牌已使用'
      });
    }

    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({
        success: false,
        error: '重置令牌已过期'
      });
    }

    // 更新密码
    const hashedPassword = await hashPassword(password);
    
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    });

    // 标记令牌为已使用
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true }
    });

    res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: '内部服务器错误'
    });
  }
};