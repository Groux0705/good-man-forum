import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, BarChart3, Users, MessageSquare } from 'lucide-react';
import { Node } from '../types';
import { nodeService } from '../services/node';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';

const Sidebar: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const data = await nodeService.getNodes();
        setNodes(data);
      } catch (error) {
        console.error('Failed to fetch nodes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, []);

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center justify-between animate-pulse">
          <div className="h-4 theme-surface rounded w-2/3"></div>
          <div className="h-4 theme-surface rounded w-8"></div>
        </div>
      ))}
    </div>
  );

  return (
    <aside className="w-full lg:w-80 space-y-4 sm:space-y-6">
      {/* 热门节点卡片 - 移动端优化 */}
      <Card className="theme-card">
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Layers className="h-4 w-4 sm:h-5 sm:w-5 theme-primary" />
            <span className="theme-text">热门节点</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="space-y-1 sm:space-y-2">
              {nodes.slice(0, window.innerWidth < 640 ? 6 : 10).map((node) => (
                <Link
                  key={node.id}
                  to={`/node/${node.name}`}
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg theme-hover transition-colors duration-200 group touch-manipulation"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-primary-100)' }}>
                      <span className="theme-primary font-medium text-xs sm:text-sm">
                        {node.title.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium theme-text group-hover:text-primary transition-colors truncate">
                        {node.title}
                      </p>
                      <p className="text-xs theme-text-secondary truncate hidden sm:block">
                        {node.name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                    {node.topics}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 社区统计卡片 - 移动端优化 */}
      <Card className="theme-card">
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 theme-primary" />
            <span className="theme-text">社区统计</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg theme-surface">
              <div className="flex items-center space-x-2">
                <Layers className="h-3 w-3 sm:h-4 sm:w-4 theme-primary" />
                <span className="text-xs sm:text-sm theme-text">节点数</span>
              </div>
              <Badge variant="outline" className="text-xs">{nodes.length}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg theme-surface">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 theme-primary" />
                <span className="text-xs sm:text-sm theme-text">主题数</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {nodes.reduce((sum, node) => sum + node.topics, 0)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg theme-surface">
              <div className="flex items-center space-x-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 theme-primary" />
                <span className="text-xs sm:text-sm theme-text">活跃用户</span>
              </div>
              <Badge variant="outline" className="text-xs">∞</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 欢迎卡片 - 移动端优化 */}
      <Card className="theme-card" style={{ background: 'linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))' }}>
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="theme-primary text-base sm:text-lg">欢迎加入</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <p className="text-xs sm:text-sm theme-text-secondary mb-3 sm:mb-4">
            Good Man Forum 是一个开放、友好的技术社区，欢迎所有人参与讨论。
          </p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Badge variant="secondary" className="text-xs">
              开源
            </Badge>
            <Badge variant="secondary" className="text-xs">
              友好
            </Badge>
            <Badge variant="secondary" className="text-xs">
              技术
            </Badge>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default Sidebar;