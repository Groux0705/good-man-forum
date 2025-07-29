import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';

interface BadgeInfo {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  points: number;
  experience: number;
  earned: boolean;
  earnedAt?: string;
  conditionText?: string;
}

interface BadgeDisplayProps {
  userId?: string;
  compact?: boolean;
  limit?: number;
  showAll?: boolean;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ 
  userId, 
  compact = false, 
  limit, 
  showAll = false 
}) => {
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'available'>('all');

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/badges/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setBadges(result.data || []);
      }
    } catch (error) {
      console.error('获取勋章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
      case 'rare': return 'text-blue-500 bg-blue-100 dark:bg-blue-900';
      case 'epic': return 'text-purple-500 bg-purple-100 dark:bg-purple-900';
      case 'legendary': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'activity': return <Zap className="h-4 w-4" />;
      case 'achievement': return <Trophy className="h-4 w-4" />;
      case 'time': return <Clock className="h-4 w-4" />;
      case 'special': return <Star className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const filteredBadges = badges.filter(badge => {
    if (filter === 'earned') return badge.earned;
    if (filter === 'available') return !badge.earned;
    return true;
  });

  const displayBadges = limit ? filteredBadges.slice(0, limit) : filteredBadges;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2 text-muted-foreground">加载勋章中...</span>
      </div>
    );
  }

  if (compact) {
    const earnedBadges = badges.filter(b => b.earned);
    return (
      <div className="flex flex-wrap gap-1">
        {earnedBadges.slice(0, limit || 6).map(badge => (
          <div
            key={badge.id}
            title={`${badge.title} - ${badge.description}`}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getRarityColor(badge.rarity)}`}
          >
            <span className="mr-1">{badge.icon}</span>
            <span className="hidden sm:inline">{badge.title}</span>
          </div>
        ))}
        {earnedBadges.length > (limit || 6) && (
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
            +{earnedBadges.length - (limit || 6)}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="card-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>勋章收藏 ({badges.filter(b => b.earned).length}/{badges.length})</span>
          </CardTitle>
          {showAll && (
            <div className="flex space-x-1 bg-muted/20 p-1 rounded-lg">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className="text-xs"
              >
                全部
              </Button>
              <Button
                variant={filter === 'earned' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('earned')}
                className="text-xs"
              >
                已获得
              </Button>
              <Button
                variant={filter === 'available' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('available')}
                className="text-xs"
              >
                未获得
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayBadges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>暂无勋章</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayBadges.map(badge => (
              <div
                key={badge.id}
                className={`relative p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${
                  badge.earned 
                    ? 'bg-gradient-to-br from-background to-accent/20 border-primary/30' 
                    : 'bg-muted/20 border-muted opacity-60 hover:opacity-80'
                }`}
              >
                {badge.earned && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <div className={`text-2xl p-2 rounded-full ${getRarityColor(badge.rarity)}`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getCategoryIcon(badge.category)}
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {badge.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {badge.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {badge.rarity}
                      </Badge>
                      {badge.earned && badge.earnedAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {badge.points > 0 && (
                      <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                        <span>🎯 +{badge.points}</span>
                        <span>⚡ +{badge.experience}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BadgeDisplay;