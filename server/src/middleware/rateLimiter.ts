import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

// 通用限制器 - 开发环境更宽松
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: isDev ? 10000 : 200, // 开发环境10000次，生产环境200次
  message: {
    success: false,
    error: 'Too many requests from this IP'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 认证相关限制器
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: isDev ? 1000 : 20, // 开发环境1000次，生产环境20次
  message: {
    success: false,
    error: 'Too many authentication attempts'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 创建内容限制器
export const createContentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分钟
  max: isDev ? 500 : 10, // 开发环境500次，生产环境10次
  message: {
    success: false,
    error: 'Too many content creation requests'
  },
  standardHeaders: true,
  legacyHeaders: false,
});