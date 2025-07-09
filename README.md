# Good Man Forum

一个类似 V2EX 的现代化论坛系统

## 技术栈

### 后端
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite/PostgreSQL
- JWT 认证

### 前端
- React 18
- TypeScript
- Vite
- Tailwind CSS

## 项目结构

```
good-man-forum/
├── server/          # 后端服务
├── client/          # 前端应用
├── shared/          # 共享类型定义
└── docs/           # 文档
```

## 快速开始

1. 安装依赖
```bash
npm run install:all
```

2. 启动开发服务器
```bash
npm run dev
```

## 功能特性

- 用户注册登录
- 论坛节点管理
- 主题发布与回复
- 用户积分系统
- 消息通知
- 响应式设计