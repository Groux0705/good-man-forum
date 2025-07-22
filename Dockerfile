# 多阶段构建 - 基础镜像
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 安装依赖阶段 - 服务器
FROM base AS server-deps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 安装依赖阶段 - 客户端
FROM base AS client-deps
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci && npm cache clean --force

# 构建阶段 - 服务器
FROM server-deps AS server-build
WORKDIR /app/server
COPY server/ ./
RUN npm run build

# 构建阶段 - 客户端
FROM client-deps AS client-build
WORKDIR /app/client
COPY client/ ./
RUN npm run build

# 生产阶段
FROM base AS production
WORKDIR /app

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 复制服务器文件
COPY --from=server-build --chown=nextjs:nodejs /app/server/dist ./server/dist
COPY --from=server-build --chown=nextjs:nodejs /app/server/node_modules ./server/node_modules
COPY --from=server-build --chown=nextjs:nodejs /app/server/package.json ./server/
COPY --from=server-build --chown=nextjs:nodejs /app/server/prisma ./server/prisma

# 复制客户端构建文件
COPY --from=client-build --chown=nextjs:nodejs /app/client/dist ./client/dist

# 创建必要的目录
RUN mkdir -p uploads/avatars && chown -R nextjs:nodejs uploads

# 切换到非root用户
USER nextjs

EXPOSE 3001

WORKDIR /app/server

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["npm", "start"]