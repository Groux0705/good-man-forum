#!/bin/bash

echo "=== Good Man Forum 快速启动脚本 ==="

echo "1. 安装根目录依赖..."
npm install

echo "2. 安装服务端依赖..."
cd server && npm install

echo "3. 生成 Prisma 客户端..."
npm run db:generate

echo "4. 推送数据库模式..."
npm run db:push

echo "5. 添加初始数据..."
npm run db:seed

echo "6. 安装客户端依赖..."
cd ../client && npm install

echo "7. 返回根目录..."
cd ..

echo "=== 安装完成！==="
echo ""
echo "启动开发服务器："
echo "npm run dev"
echo ""
echo "或分别启动："
echo "服务端: cd server && npm run dev"
echo "客户端: cd client && npm run dev"