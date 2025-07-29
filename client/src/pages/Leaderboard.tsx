import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, Coins, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import PointDisplay from '../components/ui/PointDisplay';
import LevelProgress from '../components/ui/LevelProgress';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageTransition from '../components/ui/PageTransition';
import { LevelInfo } from '../types';

interface LeaderboardUser {
  rank: number;
  user: {
    id: string;
    username: string;
    avatar: string | null;
    balance: number;
    level: number;
    experience: number;
    createdAt: string;
  };
  levelInfo: {
    title: string;
    badge: string;
  };
}

interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'balance' | 'level'>('balance');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  const fetchLeaderboard = async (pageNum: number = 1, leaderboardType: 'balance' | 'level' = type) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/points/leaderboard?page=${pageNum}&limit=50&type=${leaderboardType}`);
      
      if (response.ok) {
        const result: { success: boolean; data: LeaderboardResponse } = await response.json();
        if (pageNum === 1) {
          setLeaderboard(result.data.leaderboard);
        } else {
          setLeaderboard(prev => [...prev, ...result.data.leaderboard]);
        }
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(1, type);
    setPage(1);
  }, [type]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLeaderboard(nextPage, type);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{rank}</div>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && leaderboard.length === 0) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
              <span className="ml-2 text-muted-foreground">加载排行榜中...</span>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 flex items-center justify-center space-x-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <span>积分排行榜</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              展示社区中最活跃的用户排名
            </p>
          </div>

          {/* 排行榜类型切换 */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex space-x-1 bg-muted/20 p-1 rounded-lg border">
              <Button
                variant={type === 'balance' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setType('balance')}
                className="flex items-center space-x-2"
              >
                <Coins className="h-4 w-4" />
                <span>积分排行</span>
              </Button>
              <Button
                variant={type === 'level' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setType('level')}
                className="flex items-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>等级排行</span>
              </Button>
            </div>
          </div>

          {/* 排行榜列表 */}
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>{type === 'balance' ? '积分' : '等级'}排行榜</span>
                <span className="text-sm text-muted-foreground">({pagination.total} 位用户)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>暂无排行数据</p>
                </div>
              ) : (
                <>
                  <div className="space-y-0">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.user.id}
                        className={`flex items-center justify-between p-4 hover:bg-accent/50 transition-colors ${
                          index !== leaderboard.length - 1 ? 'border-b border-border' : ''
                        } ${entry.rank <= 3 ? 'bg-accent/20' : ''}`}
                      >
                        <div className="flex items-center space-x-4">
                          {/* 排名 */}
                          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getRankBadgeColor(entry.rank)}`}>
                            {getRankIcon(entry.rank)}
                          </div>
                          
                          {/* 用户信息 */}
                          <div className="flex items-center space-x-3">
                            <Avatar
                              src={entry.user.avatar}
                              alt={entry.user.username}
                              fallback={entry.user.username.charAt(0).toUpperCase()}
                              size="md"
                              className="w-10 h-10"
                            />
                            <div>
                              <div className="font-semibold text-foreground flex items-center space-x-2">
                                <span>{entry.user.username}</span>
                                <span className="text-lg">{entry.levelInfo.badge}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {entry.levelInfo.title} · 加入于 {formatDate(entry.user.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 积分/等级信息 */}
                        <div className="text-right">
                          {type === 'balance' ? (
                            <div>
                              <div className="text-2xl font-bold text-foreground flex items-center justify-end space-x-1">
                                <Coins className="h-5 w-5 text-yellow-500" />
                                <span>{entry.user.balance.toLocaleString()}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Lv.{entry.user.level}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-2xl font-bold text-foreground flex items-center justify-end space-x-1">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                                <span>Lv.{entry.user.level}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {entry.user.experience.toLocaleString()} EXP
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 加载更多 */}
                  {pagination.page < pagination.pages && (
                    <div className="p-4 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <LoadingSpinner />
                            <span className="ml-2">加载中...</span>
                          </>
                        ) : (
                          '加载更多'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default Leaderboard;