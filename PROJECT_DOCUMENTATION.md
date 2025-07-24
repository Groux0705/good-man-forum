# Good Man Forum 项目文档

## 项目概述

Good Man Forum 是一个现代化的论坛系统，灵感来源于 V2EX。该项目主要面向男性用户群体，提供一个交流平台，讨论话题涵盖恋爱关系、沟通技巧、自我提升等。项目采用前后端分离架构，包含完整的用户系统、论坛功能、课程系统和消息通知机制。

## 技术栈

### 后端技术栈

- **Node.js + Express**: 服务器端运行环境和框架
- **TypeScript**: 提供类型安全的 JavaScript 开发体验
- **Prisma ORM**: 数据库对象关系映射工具
- **SQLite/PostgreSQL**: 数据库管理系统
- **JWT 认证**: 用户身份验证机制
- **RESTful API**: 提供标准的 API 接口

### 前端技术栈

- **React 18**: 前端用户界面库
- **TypeScript**: 提供类型安全的 JavaScript 开发体验
- **Vite**: 快速的构建工具
- **Tailwind CSS**: 实用优先的 CSS 框架
- **React Router**: 客户端路由管理
- **React Query**: 数据获取和状态管理

## 项目架构

```
good-man-forum/
├── server/          # 后端服务
├── client/          # 前端应用
├── shared/          # 共享类型定义
└── docs/           # 文档
```

### 后端架构 (server/)

```
server/
├── src/
│   ├── controllers/    # 控制器层，处理请求逻辑
│   ├── middleware/     # 中间件，如认证、限流等
│   ├── models/         # 数据模型定义
│   ├── routes/         # 路由定义
│   ├── services/       # 业务逻辑层
│   └── utils/          # 工具函数
├── prisma/             # Prisma 数据库相关文件
└── uploads/            # 用户上传的文件（如头像）
```

### 前端架构 (client/)

```
client/
├── src/
│   ├── components/     # 可复用的 UI 组件
│   ├── contexts/       # React Context 状态管理
│   ├── pages/          # 页面组件
│   ├── services/       # API 服务封装
│   ├── styles/         # 全局样式
│   ├── types/          # TypeScript 类型定义
│   └── utils/          # 工具函数
```

## 功能特性

### 核心功能

1. **用户系统**
   - 用户注册与登录
   - 用户资料管理
   - 头像上传
   - 积分等级系统

2. **论坛功能**
   - 节点管理（分类讨论区）
   - 主题发布与回复
   - 嵌套回复支持
   - 点赞与收藏功能
   - 主题浏览量统计

3. **课程系统**
   - 课程分类浏览
   - 课程详情展示
   - 章节与小节结构
   - 多种课程类型支持（视频、文章、实操练习、测验）
   - 学习进度跟踪
   - 课程评论系统

4. **消息通知**
   - 实时通知推送
   - 多种通知类型（回复、点赞、收藏等）
   - 通知标记已读

5. **其他功能**
   - 响应式设计，适配移动端
   - 搜索功能
   - 主题配色切换

### 课程系统详解

课程系统是该项目的一个重要特色功能，包含以下特性：

1. **课程类型**
   - 视频课程：支持视频播放和关键时间点导航
   - 文章课程：支持 Markdown 格式内容和目录导航
   - 实操练习：提供代码编辑器和运行环境
   - 测验课程：支持单选、多选和填空题

2. **学习进度跟踪**
   - 每个小节的完成状态
   - 整体课程进度百分比
   - 已完成小节数量统计

3. **课程互动**
   - 课程评论系统
   - 课程点赞功能
   - 课程分享功能

## 安装指南

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn 包管理器

### 安装步骤

1. 克隆项目仓库：
   ```bash
   git clone <repository-url>
   cd good-man-forum
   ```

2. 安装所有依赖：
   ```bash
   npm run install:all
   ```

3. 配置环境变量：
   ```bash
   cp env.example .env
   # 编辑 .env 文件，填入必要的配置项
   ```

4. 数据库初始化：
   ```bash
   cd server
   npm run db:generate
   npm run db:push
   npm run db:seed  # 可选，填充示例数据
   ```

## 使用说明

### 开发环境

启动开发服务器：
```bash
npm run dev
```
这将同时启动前端和后端服务。

### 生产构建

构建生产版本：
```bash
npm run build
```

启动生产服务器：
```bash
npm start
```

### 项目脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发环境 |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm run install:all` | 安装所有依赖 |

### API 接口

后端 API 接口遵循 RESTful 规范，主要接口包括：

- 认证相关：`/api/auth`
- 用户相关：`/api/users`
- 节点相关：`/api/nodes`
- 主题相关：`/api/topics`
- 回复相关：`/api/replies`
- 上传相关：`/api/upload`
- 课程相关：`/api/courses`
- 通知相关：`/api/notifications`

详细接口文档建议使用 Swagger 或类似工具生成。

## 部署说明

项目支持 Docker 部署，包含以下配置文件：

- `Dockerfile`: 应用镜像构建文件
- `docker-compose.yml`: 开发环境编排文件
- `docker-compose.prod.yml`: 生产环境编排文件

构建和部署步骤：
```bash
# 构建镜像
docker build -t good-man-forum .

# 启动服务
docker-compose up -d
```

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

### 开发规范

1. 遵循现有的代码风格
2. 添加必要的注释
3. 编写测试用例（如果适用）
4. 更新相关文档

## 许可证

本项目采用 MIT 许可证，详情请查看 LICENSE 文件。