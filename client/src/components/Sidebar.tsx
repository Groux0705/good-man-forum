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
    <aside className="w-80 space-y-6">
      <Card className="theme-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layers className="h-5 w-5 theme-primary" />
            <span className="theme-text">热门节点</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="space-y-2">
              {nodes.slice(0, 10).map((node) => (
                <Link
                  key={node.id}
                  to={`/node/${node.name}`}
                  className="flex items-center justify-between p-3 rounded-lg theme-hover transition-colors duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-100)' }}>
                      <span className="theme-primary font-medium text-sm">
                        {node.title.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium theme-text group-hover:text-primary transition-colors">
                        {node.title}
                      </p>
                      <p className="text-xs theme-text-secondary">
                        {node.name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {node.topics}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="theme-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 theme-primary" />
            <span className="theme-text">社区统计</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg theme-surface">
              <div className="flex items-center space-x-2">
                <Layers className="h-4 w-4 theme-primary" />
                <span className="text-sm theme-text">节点数</span>
              </div>
              <Badge variant="outline">{nodes.length}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg theme-surface">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 theme-primary" />
                <span className="text-sm theme-text">主题数</span>
              </div>
              <Badge variant="outline">
                {nodes.reduce((sum, node) => sum + node.topics, 0)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg theme-surface">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 theme-primary" />
                <span className="text-sm theme-text">活跃用户</span>
              </div>
              <Badge variant="outline">∞</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="theme-card" style={{ background: 'linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))' }}>
        <CardHeader>
          <CardTitle className="theme-primary">欢迎加入</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm theme-text-secondary mb-4">
            Good Man Forum 是一个开放、友好的技术社区，欢迎所有人参与讨论。
          </p>
          <div className="flex space-x-2">
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