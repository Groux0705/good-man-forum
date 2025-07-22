import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { topicService } from '../services/topic';
import { Topic } from '../types';
import TopicList from '../components/TopicList';
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import PageTransition from '../components/ui/PageTransition';
import { cachedFetch } from '../utils/cache';

const Home: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchTopics = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await topicService.getTopics(pageNum);
      setTopics(data.topics);
      setPagination(data.pagination);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="animate-pulse theme-card">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="w-12 h-12 theme-surface rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="h-5 theme-surface rounded w-16"></div>
                  <div className="h-4 theme-surface rounded w-20"></div>
                </div>
                <div className="h-6 theme-surface rounded w-3/4"></div>
                <div className="flex space-x-4">
                  <div className="h-4 theme-surface rounded w-12"></div>
                  <div className="h-4 theme-surface rounded w-16"></div>
                  <div className="h-4 theme-surface rounded w-20"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <PageTransition>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* 主内容区域 - 移动端优化 */}
          <main className="flex-1 min-w-0">
            {/* 头部卡片 - 移动端优化 */}
            <div className="mb-6 sm:mb-8">
              <Card className="border-0 theme-card" style={{ background: 'linear-gradient(to right, var(--color-primary-100), var(--color-primary-50))' }}>
                <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <Flame className="h-5 w-5 sm:h-6 sm:w-6 theme-primary" />
                    <span className="theme-text">最新主题</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <p className="theme-text-secondary text-sm sm:text-base">
                    发现社区中最新的讨论话题，参与有趣的对话
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-3 sm:mt-4">
                    <Badge variant="secondary" className="flex items-center space-x-1 text-xs sm:text-sm">
                      <TrendingUp className="h-3 w-3" />
                      <span>共 {pagination.total} 个主题</span>
                    </Badge>
                    <Badge variant="outline" className="text-xs sm:text-sm">
                      活跃社区
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <TopicList topics={topics} />
                
                {/* 分页组件 - 移动端优化 */}
                {pagination.pages > 1 && (
                  <div className="mt-6 sm:mt-8 flex justify-center px-2">
                    <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchTopics(page - 1)}
                        disabled={page <= 1}
                        className="flex-shrink-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 touch-manipulation"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline ml-1">上一页</span>
                      </Button>
                      
                      {/* 页码按钮 - 移动端优化 */}
                      <div className="flex items-center space-x-1 min-w-0">
                        {[...Array(Math.min(window.innerWidth < 640 ? 3 : 5, pagination.pages))].map((_, i) => {
                          const pageNum = Math.max(1, page - (window.innerWidth < 640 ? 1 : 2)) + i;
                          if (pageNum > pagination.pages) return null;
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => fetchTopics(pageNum)}
                              className="min-w-[32px] sm:min-w-[40px] h-8 sm:h-9 text-xs sm:text-sm touch-manipulation flex-shrink-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchTopics(page + 1)}
                        disabled={page >= pagination.pages}
                        className="flex-shrink-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 touch-manipulation"
                      >
                        <span className="hidden sm:inline mr-1">下一页</span>
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>

          {/* 侧边栏 - 移动端优化 */}
          <div className="lg:w-80 lg:flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Home;