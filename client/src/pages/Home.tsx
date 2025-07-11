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
      <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <main className="flex-1">
          <div className="mb-8">
            <Card className="border-0 theme-card" style={{ background: 'linear-gradient(to right, var(--color-primary-100), var(--color-primary-50))' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Flame className="h-6 w-6 theme-primary" />
                  <span className="theme-text">最新主题</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="theme-text-secondary">
                  发现社区中最新的讨论话题，参与有趣的对话
                </p>
                <div className="flex items-center space-x-4 mt-4">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>共 {pagination.total} 个主题</span>
                  </Badge>
                  <Badge variant="outline">
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
              
              {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchTopics(page - 1)}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      上一页
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                        const pageNum = Math.max(1, page - 2) + i;
                        if (pageNum > pagination.pages) return null;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => fetchTopics(pageNum)}
                            className="min-w-[40px]"
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
                    >
                      下一页
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        <Sidebar />
      </div>
    </div>
    </PageTransition>
  );
};

export default Home;