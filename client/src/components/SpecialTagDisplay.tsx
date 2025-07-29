import React, { useState, useEffect } from 'react';
import { Crown, Shield, Star, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import LoadingSpinner from './ui/LoadingSpinner';

interface SpecialTag {
  id: string;
  tag: {
    id: string;
    name: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    category: string;
    privileges?: string[];
  };
  grantedAt: string;
  expiresAt?: string;
  isExpiring: boolean;
}

interface SpecialTagDisplayProps {
  userId?: string;
  compact?: boolean;
  limit?: number;
  inline?: boolean;  // 用于在用户名旁边显示
}

const SpecialTagDisplay: React.FC<SpecialTagDisplayProps> = ({ 
  userId, 
  compact = false, 
  limit, 
  inline = false 
}) => {
  const [tags, setTags] = useState<SpecialTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecialTags();
  }, [userId]);

  const fetchSpecialTags = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/special-tags/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setTags(result.data || []);
      }
    } catch (error) {
      console.error('获取专属标识失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'admin': return <Crown className="h-3 w-3" />;
      case 'vip': return <Star className="h-3 w-3" />;
      case 'achievement': return <Shield className="h-3 w-3" />;
      case 'special': return <Star className="h-3 w-3" />;
      default: return <Shield className="h-3 w-3" />;
    }
  };

  const formatTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return '已过期';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}天后过期`;
    if (hours > 0) return `${hours}小时后过期`;
    return '即将过期';
  };

  if (loading && !inline) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner />
        <span className="ml-2 text-muted-foreground">加载标识中...</span>
      </div>
    );
  }

  const displayTags = limit ? tags.slice(0, limit) : tags;

  // 内联显示（用于用户名旁边）
  if (inline) {
    return (
      <div className="inline-flex items-center space-x-1">
        {displayTags.map(userTag => (
          <div
            key={userTag.id}
            title={`${userTag.tag.title} - ${userTag.tag.description}`}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
            style={{ 
              backgroundColor: `${userTag.tag.color}20`,
              color: userTag.tag.color,
              border: `1px solid ${userTag.tag.color}40`
            }}
          >
            <span className="mr-1">{userTag.tag.icon}</span>
            <span>{userTag.tag.title}</span>
          </div>
        ))}
      </div>
    );
  }

  // 紧凑显示
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {displayTags.map(userTag => (
          <div
            key={userTag.id}
            title={`${userTag.tag.title} - ${userTag.tag.description}`}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${userTag.tag.color}20`,
              color: userTag.tag.color,
              border: `1px solid ${userTag.tag.color}40`
            }}
          >
            <span className="mr-1">{userTag.tag.icon}</span>
            <span>{userTag.tag.title}</span>
            {userTag.isExpiring && (
              <AlertCircle className="h-3 w-3 ml-1 text-orange-500" />
            )}
          </div>
        ))}
      </div>
    );
  }

  // 完整显示
  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <span>专属标识 ({tags.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayTags.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Crown className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>暂无专属标识</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayTags.map(userTag => (
              <div
                key={userTag.id}
                className="p-4 rounded-lg border transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: `${userTag.tag.color}10`,
                  borderColor: `${userTag.tag.color}30`
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div 
                      className="text-2xl p-2 rounded-full"
                      style={{ 
                        backgroundColor: `${userTag.tag.color}20`,
                        color: userTag.tag.color
                      }}
                    >
                      {userTag.tag.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getCategoryIcon(userTag.tag.category)}
                        <h3 className="font-semibold text-foreground">
                          {userTag.tag.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {userTag.tag.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {userTag.tag.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            获得于 {new Date(userTag.grantedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {userTag.expiresAt && (
                          <div className={`flex items-center space-x-1 ${
                            userTag.isExpiring ? 'text-orange-500' : ''
                          }`}>
                            <AlertCircle className="h-3 w-3" />
                            <span>{formatTimeRemaining(userTag.expiresAt)}</span>
                          </div>
                        )}
                      </div>
                      {userTag.tag.privileges && userTag.tag.privileges.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-muted-foreground mb-1">特权：</div>
                          <div className="flex flex-wrap gap-1">
                            {userTag.tag.privileges.map((privilege, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {privilege}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {userTag.isExpiring && (
                    <div className="flex items-center space-x-1 text-orange-500 text-xs">
                      <AlertCircle className="h-4 w-4" />
                      <span>即将过期</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpecialTagDisplay;