import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

import { generalLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import nodeRoutes from './routes/nodes';
import topicRoutes from './routes/topics';
import replyRoutes from './routes/replies';
import uploadRoutes from './routes/upload';
import courseRoutes from './routes/courses';
import notificationRoutes from './routes/notifications';
import topicInteractionRoutes from './routes/topicInteractions';
import pointRoutes from './routes/points';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 配置 CORS 头
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/topic-interactions', topicInteractionRoutes);
app.use('/api/points', pointRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;