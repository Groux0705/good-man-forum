import React, { useState, useEffect } from 'react';
import { History, Plus, Minus, Calendar, TrendingUp, MessageSquare, Heart, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { PointHistory as PointHistoryType } from '../types';
import LoadingSpinner from './ui/LoadingSpinner';

const PointHistory: React.FC = () => {
  const [history, setHistory] = useState<PointHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = async (pageNum: number = 1) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/points/history?page=${pageNum}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (pageNum === 1) {
          setHistory(result.data.history);
        } else {
          setHistory(prev => [...prev, ...result.data.history]);
        }
        setHasMore(result.data.pagination.page < result.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching point history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistory(nextPage);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'login': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'post': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'reply': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'like_received': return <Heart className="h-4 w-4 text-red-500" />;
      case 'favorite_received': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'level_up': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'first_post': return <Star className="h-4 w-4 text-gold-500" />;
      case 'consume': return <Minus className="h-4 w-4 text-red-500" />;
      default: return <Plus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return '今天';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && history.length === 0) {
    return (
      <Card className="card-glass">
        <CardContent className="p-6 flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2 text-muted-foreground">加载积分记录中...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>积分记录</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {history.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            暂无积分记录
          </div>
        ) : (
          <>
            <div className="space-y-0">
              {history.map((record, index) => (
                <div
                  key={record.id}
                  className={`flex items-center justify-between p-4 hover:bg-accent/50 transition-colors ${
                    index !== history.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(record.type)}
                    <div>
                      <div className="font-medium text-foreground text-sm">
                        {record.reason}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(record.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className={`font-medium ${getTypeColor(record.amount)}`}>
                    {record.amount > 0 ? '+' : ''}{record.amount}
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div className="p-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  className="w-full"
                  size="sm"
                >
                  加载更多
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PointHistory;