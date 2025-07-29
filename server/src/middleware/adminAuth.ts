import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

// 验证用户是否为管理员
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '需要管理员权限'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        role: true,
        status: true
      }
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
    }

    if (!['admin', 'moderator'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足，需要管理员权限'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({
      success: false,
      message: '身份验证失败'
    });
  }
};

// 验证用户是否为超级管理员
export const requireSuperAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '需要超级管理员权限'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        role: true,
        status: true
      }
    });

    if (!user || user.status !== 'active' || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，需要超级管理员权限'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Super admin auth error:', error);
    return res.status(401).json({
      success: false,
      message: '身份验证失败'
    });
  }
};

// 记录管理员操作日志
export const logAdminAction = async (
  adminId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  req?: Request
) => {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        resource,
        resourceId,
        details: details ? JSON.stringify(details) : null,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('User-Agent')
      }
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};