import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchService } from '../services/search';
import { Topic } from '../types';
import TopicList from '../components/TopicList';
import MobileSearch from '../components/MobileSearch';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchResults = async (searchQuery: string, pageNum = 1) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const data = await searchService.searchTopics(searchQuery, pageNum);
      setResults(data.topics);
      setPagination(data.pagination);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch search results:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = (newQuery: string) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  useEffect(() => {
    if (query) {
      fetchResults(query, 1);
    }
  }, [query]);

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="h-5 bg-muted rounded w-16"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-muted rounded w-12"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">搜索主题</h1>
            <p className="text-muted-foreground mb-6">
              使用下方搜索框查找您感兴趣的话题和讨论
            </p>
          </div>
          
          <MobileSearch 
            onSearch={handleNewSearch}
            className="max-w-md mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Search className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">搜索结果</h1>
          </div>
          
          <div className="block md:hidden mb-6">
            <MobileSearch 
              initialQuery={query}
              onSearch={handleNewSearch}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-muted-foreground">搜索:</span>
              <Badge variant="secondary" className="text-base px-3 py-1">
                "{query}"
              </Badge>
              {!loading && (
                <span className="text-sm text-muted-foreground">
                  找到 {pagination.total} 个结果
                </span>
              )}
            </div>
            
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">筛选</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : results.length > 0 ? (
          <>
            <TopicList topics={results} />
            
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchResults(query, page - 1)}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">上一页</span>
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
                          onClick={() => fetchResults(query, pageNum)}
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
                    onClick={() => fetchResults(query, page + 1)}
                    disabled={page >= pagination.pages}
                  >
                    <span className="hidden sm:inline">下一页</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                没有找到相关结果
              </h3>
              <p className="text-muted-foreground mb-6">
                尝试使用不同的关键词或检查拼写
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>搜索建议:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>使用更简单或更通用的关键词</li>
                  <li>检查关键词的拼写</li>
                  <li>尝试同义词或相关词语</li>
                  <li>减少搜索关键词的数量</li>
                </ul>
              </div>
              <div className="mt-8 space-y-4">
                <MobileSearch 
                  onSearch={handleNewSearch}
                  className="max-w-md mx-auto"
                />
                <Button asChild variant="outline">
                  <Link to="/">
                    返回首页
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchResults;