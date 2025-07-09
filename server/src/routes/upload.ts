import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 用于磁盘存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // 只允许图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

// 头像上传路由 - 使用本地存储
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    console.log('Avatar upload request received');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '没有选择文件'
      });
    }

    console.log('File saved:', req.file.filename);

    // 返回完整的URL路径
    const avatarUrl = `http://localhost:3001/uploads/avatars/${req.file.filename}`;
    
    console.log('Avatar URL generated:', avatarUrl);

    res.json({
      success: true,
      url: avatarUrl,
      message: '头像上传成功'
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      error: '头像上传失败'
    });
  }
});

// 错误处理中间件
router.use((error: any, req: any, res: any, next: any) => {
  console.error('Upload middleware error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: '文件大小不能超过5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: '只能上传一个文件'
      });
    }
  }
  
  if (error.message === '只允许上传图片文件') {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  res.status(500).json({
    success: false,
    error: '文件上传失败'
  });
});

export default router;