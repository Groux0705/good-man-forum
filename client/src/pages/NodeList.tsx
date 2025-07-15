import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { nodeService } from '../services/node';
import { Node } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import PageTransition from '../components/ui/PageTransition';

const NodeList: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await nodeService.getNodes();
        setNodes(data);
      } catch (error) {
        console.error('Failed to fetch nodes:', error);
        setError('加载节点失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, []);

  const memoizedNodes = useMemo(() => nodes, [nodes]);

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="h-8 bg-muted rounded w-32 mb-2 skeleton"></div>
            <div className="h-5 bg-muted rounded w-48 skeleton"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="skeleton-card">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-muted rounded skeleton"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded skeleton"></div>
                      <div className="h-4 bg-muted rounded w-2/3 skeleton"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-muted rounded mb-3 skeleton"></div>
                  <div className="h-4 bg-muted rounded w-3/4 skeleton"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">加载失败</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold theme-text mb-2">节点导航</h1>
          <p className="theme-text-secondary">浏览所有讨论节点</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memoizedNodes.map((node, index) => (
            <Link
              key={node.id}
              to={`/node/${node.name}`}
              className={`stagger-item card-glass hover-lift rounded-lg p-6 block transition-all duration-300 will-change-transform`}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="flex items-center space-x-3 mb-3">
                {node.avatar ? (
                  <img
                    src={node.avatar}
                    alt={node.title}
                    className="w-10 h-10 rounded object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {node.title.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium theme-text">{node.title}</h3>
                  <p className="text-sm theme-text-secondary">{node.name}</p>
                </div>
              </div>
              
              {node.description && (
                <p className="theme-text-secondary text-sm mb-3 line-clamp-2">
                  {node.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm theme-text-secondary">
                <span>{node.topics} 个主题</span>
                <span className="theme-primary hover:opacity-80 transition-opacity">
                  进入节点 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default NodeList;