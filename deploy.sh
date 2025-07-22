#!/bin/bash

# 部署脚本
set -e

echo "🚀 开始部署 Good Man Forum..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p uploads/avatars
mkdir -p logs
mkdir -p ssl

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "⚠️  未找到.env文件，正在从env.example复制..."
    cp env.example .env
    echo "📝 请编辑.env文件并配置必要的环境变量"
    exit 1
fi

# 加载环境变量
source .env

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 拉取最新镜像
echo "📥 拉取最新镜像..."
docker-compose pull

# 启动服务
echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 运行数据库迁移
echo "🗄️  运行数据库迁移..."
docker-compose exec app npm run db:push

# 检查健康状态
echo "🏥 检查健康状态..."
for i in {1..10}; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo "✅ 服务健康检查通过"
        break
    else
        echo "⏳ 等待服务就绪... ($i/10)"
        sleep 10
    fi
done

# 清理未使用的镜像
echo "🧹 清理未使用的镜像..."
docker system prune -f

echo "🎉 部署完成！"
echo "📊 服务地址: http://localhost"
echo "🔧 管理面板: http://localhost:8080 (如果配置了Portainer)" 