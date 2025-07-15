import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

const AnimationDemo: React.FC = () => {
  const [showGlass, setShowGlass] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const demoCards = [
    { id: 1, title: '液态磨砂玻璃卡片', description: '这是一个带有磨砂玻璃效果的卡片' },
    { id: 2, title: '悬浮动画效果', description: '鼠标悬停时会有丝滑的动画效果' },
    { id: 3, title: '渐变背景', description: '支持自定义渐变背景和透明度' },
    { id: 4, title: '响应式设计', description: '在不同设备上都有良好的表现' },
  ];

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            液态磨砂玻璃动画效果演示
          </h1>
          <p className="text-gray-600 text-lg">
            体验丝滑流畅的UI动画和现代玻璃效果
          </p>
        </div>

        {/* 控制面板 */}
        <Card className="mb-8 card-glass">
          <CardHeader>
            <CardTitle>动画控制面板</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Button 
                onClick={() => setShowGlass(!showGlass)}
                className="button-glass"
              >
                {showGlass ? '关闭' : '开启'}玻璃效果
              </Button>
              <Input 
                placeholder="测试玻璃输入框..."
                className="glass-input"
              />
              <Badge className="badge-glass">
                演示标签
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 演示卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {demoCards.map((card, index) => (
            <Card
              key={card.id}
              className={`stagger-item cursor-pointer ${showGlass ? 'card-glass' : ''}`}
              hover={true}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{card.description}</p>
                <div className="flex justify-between items-center">
                  <Badge className={hoveredCard === card.id ? 'badge-glass' : ''}>
                    效果 {card.id}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {hoveredCard === card.id ? '悬停中' : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 动画效果展示 */}
        <div className="space-y-6">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle>页面切换动画</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="page-enter-active p-4 bg-white/20 rounded-lg">
                  <h3 className="font-semibold mb-2">淡入动画</h3>
                  <p className="text-sm text-gray-600">页面加载时的淡入效果</p>
                </div>
                <div className="slide-enter-active p-4 bg-white/20 rounded-lg">
                  <h3 className="font-semibold mb-2">滑入动画</h3>
                  <p className="text-sm text-gray-600">从侧边滑入的效果</p>
                </div>
                <div className="elastic-enter-active p-4 bg-white/20 rounded-lg">
                  <h3 className="font-semibold mb-2">弹性动画</h3>
                  <p className="text-sm text-gray-600">带有弹性效果的动画</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="modal-glass">
            <CardHeader>
              <CardTitle>交互式效果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Button className="button-glass w-full hover-glow">
                    发光按钮效果
                  </Button>
                  <Button className="button-glass w-full hover-lift">
                    悬浮按钮效果
                  </Button>
                  <Button className="button-glass w-full ripple-effect">
                    波纹按钮效果
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="float-gentle p-4 bg-white/20 rounded-lg">
                    <h4 className="font-semibold">浮动效果</h4>
                    <p className="text-sm text-gray-600">这个元素会轻轻地浮动</p>
                  </div>
                  <div className="liquid-loading p-4 bg-white/20 rounded-lg">
                    <h4 className="font-semibold">液态加载效果</h4>
                    <p className="text-sm text-gray-600">带有液态光效的加载动画</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnimationDemo;