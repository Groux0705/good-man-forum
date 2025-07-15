import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Topic, Node } from '../types';
import TopicList from '../components/TopicList';
import PageTransition from '../components/ui/PageTransition';
import { useAuth } from '../contexts/AuthContext';
import { cachedFetch } from '../utils/cache';

const NodeDetail: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [node, setNode] = useState<Node | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchNodeAndTopics = useCallback(async (pageNum = 1) => {
    if (!name) return;
    
    try {
      setError(null);
      if (pageNum === 1) {
        setLoading(true);
      }
      
      console.log(`Fetching data for node: ${name}`);
      
      // 并行获取节点信息和主题列表
      const [nodeResponse, topicsResponse] = await Promise.all([
        fetch(`/api/nodes/${name}`).then(res => {
          console.log(`Node API response status: ${res.status}`);
          return res;
        }),
        fetch(`/api/topics?page=${pageNum}&limit=20&node=${name}`).then(res => {
          console.log(`Topics API response status: ${res.status}`);
          return res;
        })
      ]);

      // 处理节点数据
      let nodeData = null;
      if (nodeResponse.ok) {
        const nodeResult = await nodeResponse.json();
        console.log('Node API result:', nodeResult);
        if (nodeResult.success) {
          nodeData = nodeResult.data;
        }
      }

      // 如果直接获取节点失败，尝试从节点列表中查找
      if (!nodeData) {
        console.log('Trying fallback method to find node');
        try {
          const allNodesResponse = await cachedFetch('/api/nodes', {}, 'nodes', 300000);
          if (allNodesResponse.ok) {
            const allNodesResult = await allNodesResponse.json();
            if (allNodesResult.success && allNodesResult.data) {
              nodeData = allNodesResult.data.find((n: Node) => n.name === name);
              console.log('Found node via fallback:', nodeData);
            }
          }
        } catch (fallbackError) {
          console.error('Fallback node fetch failed:', fallbackError);
        }
      }

      // 处理主题数据
      let topicsData = { topics: [], pagination: { page: pageNum, limit: 20, total: 0, pages: 0 } };
      if (topicsResponse.ok) {
        const topicsResult = await topicsResponse.json();
        console.log('Topics API result:', topicsResult);
        if (topicsResult.success) {
          topicsData = topicsResult.data;
        }
      }

      // 更新状态
      setNode(nodeData);
      setTopics(topicsData.topics || []);
      setPagination(topicsData.pagination);
      setPage(pageNum);

      console.log('Final state:', {
        node: nodeData,
        topicsCount: topicsData.topics?.length || 0,
        total: topicsData.pagination.total
      });

      // 如果找到了节点但没有主题，这是正常的
      if (nodeData && (!topicsData.topics || topicsData.topics.length === 0)) {
        console.log(`Node ${name} exists but has no topics yet`);
      }

    } catch (error) {
      console.error('Failed to fetch node and topics:', error);
      setError('加载节点信息失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    if (name) {
      fetchNodeAndTopics(1);
    }
  }, [name, fetchNodeAndTopics]);

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* 节点信息骨架屏 */}
            <div className="mb-8">
              <div className="card-glass rounded-lg p-6 skeleton-card">
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
                <div key={i} className="card-glass rounded-lg p-6 skeleton-card">
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

  if (error) {
    return (
      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="card-glass rounded-lg p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">加载失败</h1>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button 
                onClick={() => fetchNodeAndTopics(1)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mr-2"
              >
                重新加载
              </button>
              <button 
                onClick={() => window.history.back()}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                返回上一页
              </button>
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
          <div className="text-center py-12">
            <div className="card-glass rounded-lg p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">节点不存在</h1>
              <p className="text-muted-foreground mb-4">
                节点 "{name}" 可能已被删除或不存在
              </p>
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
          <div className="card-glass rounded-lg shadow-lg p-6 hover-lift">
            <div className="flex items-center space-x-4">
              {node.avatar ? (
                <img
                  src={node.avatar}
                  alt={node.title}
                  className="w-16 h-16 rounded-lg object-cover"
                  loading="lazy"
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
                  <span>{node.topics || 0} 个主题</span>
                  <span>节点名称: {node.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主题列表标题 */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">
            最新主题 {pagination.total > 0 && `(${pagination.total})`}
          </h2>
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
            <div className="card-glass rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">该节点暂时还没有主题</h3>
              <p className="text-sm text-muted-foreground mb-4">成为第一个在这里发表主题的用户吧！</p>
              <button 
                onClick={() => {
                  if (user) {
                    navigate(`/create?node=${name}`);
                  } else {
                    navigate('/login');
                  }
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                发表主题
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default NodeDetail;