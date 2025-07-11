import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Topic, Node } from '../types';
import TopicList from '../components/TopicList';
import PageTransition from '../components/ui/PageTransition';
import { cachedFetch } from '../utils/cache';

const NodeDetail: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [node, setNode] = useState<Node | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchNodeAndTopics = async (pageNum = 1) => {
    if (!name) return;
    
    try {
      // 只在初次加载时显示loading
      if (pageNum === 1 && initialLoad) {
        setLoading(true);
      }
      
      const [nodeData, topicsData] = await Promise.all([
        // 使用缓存获取节点数据
        cachedFetch('/api/nodes', {}, 'nodes', 300000).then(async response => {
          const data = await response.json();
          return data.success ? data.data.find((n: Node) => n.name === name) : null;
        }),
        // 使用缓存获取主题数据  
        cachedFetch(`/api/topics?page=${pageNum}&limit=20&node=${name}`, {}, `topics:${name}:${pageNum}`, 60000).then(response => response.json())
      ]);
      
      if (nodeData) {
        setNode(nodeData);
        if (topicsData.success) {
          setTopics(topicsData.data.topics);
          setPagination(topicsData.data.pagination);
          setPage(pageNum);
        }
      }
    } catch (error) {
      console.error('Failed to fetch node and topics:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchNodeAndTopics();
  }, [name]);

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* 节点信息骨架屏 */}
            <div className="mb-8">
              <div className="glass-card rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-lg skeleton"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-8 bg-muted rounded-lg w-1/3 skeleton"></div>
                    <div className="h-4 bg-muted rounded-lg w-2/3 skeleton"></div>
                    <div className="flex space-x-4 mt-2">
                      <div className="h-3 bg-muted rounded w-20 skeleton"></div>
                      <div className="h-3 bg-muted rounded w-24 skeleton"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 主题列表标题骨架屏 */}
            <div className="mb-6">
              <div className="h-6 bg-muted rounded w-32 skeleton"></div>
            </div>
            
            {/* 主题列表骨架屏 */}
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="glass-card rounded-lg p-6 skeleton-card">
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-5 bg-muted rounded w-2/3 skeleton"></div>
                    <div className="h-4 bg-muted rounded w-16 skeleton"></div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="h-3 bg-muted rounded w-20 skeleton"></div>
                    <div className="h-3 bg-muted rounded w-24 skeleton"></div>
                    <div className="h-3 bg-muted rounded w-28 skeleton"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!node) {
    return (
      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="glass-card rounded-lg p-8 max-w-md mx-auto">
              <h1 className="text-2xl font-bold text-foreground mb-2">节点不存在</h1>
              <p className="text-muted-foreground mb-4">该节点可能已被删除或不存在</p>
              <button 
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                返回上一页
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 节点信息卡片 */}
        <div className="mb-8">
          <div className="glass-card rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-4">
              {node.avatar ? (
                <img
                  src={node.avatar}
                  alt={node.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">
                    {node.title.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{node.title}</h1>
                <p className="text-muted-foreground mt-1">{node.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  <span>{node.topics} 个主题</span>
                  <span>节点名称: {node.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主题列表标题 */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">最新主题</h2>
        </div>

        {/* 主题列表 */}
        <div>
          {topics.length > 0 ? (
            <>
              <TopicList topics={topics} />
              
              {pagination.pages > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex space-x-2">
                    {page > 1 && (
                      <button
                        onClick={() => fetchNodeAndTopics(page - 1)}
                        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted/50 transition-all duration-200 hover:scale-105"
                      >
                        上一页
                      </button>
                    )}
                    
                    <span className="px-4 py-2 text-sm text-muted-foreground">
                      第 {page} 页，共 {pagination.pages} 页
                    </span>
                    
                    {page < pagination.pages && (
                      <button
                        onClick={() => fetchNodeAndTopics(page + 1)}
                        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted/50 transition-all duration-200 hover:scale-105"
                      >
                        下一页
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-muted-foreground">该节点暂时还没有主题</p>
              <p className="text-sm text-muted-foreground mt-2">成为第一个在这里发表主题的用户吧！</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default NodeDetail;