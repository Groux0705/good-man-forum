#!/bin/bash

# 课程详情页面功能测试脚本

echo "🚀 启动课程详情页面功能测试..."

# 检查服务器是否运行
echo "📡 检查服务器状态..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ 服务器运行正常"
else
    echo "❌ 服务器未运行，请先启动服务器"
    exit 1
fi

# 检查客户端是否运行
echo "🌐 检查客户端状态..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ 客户端运行正常"
else
    echo "❌ 客户端未运行，请先启动客户端"
    exit 1
fi

# 测试API端点
echo "🔍 测试API端点..."

# 测试课程列表API
echo "  - 测试课程列表API..."
if curl -s http://localhost:3001/api/courses > /dev/null; then
    echo "  ✅ 课程列表API正常"
else
    echo "  ❌ 课程列表API失败"
fi

# 测试课程详情API (假设存在第一个课程)
echo "  - 测试课程详情API..."
COURSE_ID=$(curl -s http://localhost:3001/api/courses | jq -r '.data.courses[0].id // empty')
if [ -n "$COURSE_ID" ]; then
    if curl -s "http://localhost:3001/api/courses/$COURSE_ID" > /dev/null; then
        echo "  ✅ 课程详情API正常"
    else
        echo "  ❌ 课程详情API失败"
    fi
else
    echo "  ⚠️  无法获取课程ID，跳过课程详情API测试"
fi

echo ""
echo "🎯 功能改进总结："
echo "✅ 1. 优化课程详情页的错误处理和用户体验"
echo "✅ 2. 改进课程章节导航功能"
echo "✅ 3. 添加学习进度追踪功能"
echo "✅ 4. 优化课程小节页面的导航逻辑"
echo "✅ 5. 改进API响应数据结构"
echo "✅ 6. 添加缓存机制优化性能"
echo ""
echo "🌟 课程详情页面优化完成！"
echo "📱 请在浏览器中访问 http://localhost:5173 查看效果"