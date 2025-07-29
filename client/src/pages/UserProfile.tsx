import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import { User, Calendar, MessageSquare, FileText, MapPin, Heart, Bookmark, Trophy, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Topic, Reply, LevelInfo } from '../types';
import { topicInteractionService } from '../services/topicInteractions';
import LevelProgress from '../components/ui/LevelProgress';
import PointDisplay from '../components/ui/PointDisplay';
import DailyCheckIn from '../components/DailyCheckIn';
import PointHistory from '../components/PointHistory';
import BadgeDisplay from '../components/BadgeDisplay';
import SpecialTagDisplay from '../components/SpecialTagDisplay';

interface UserProfile {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  level: number;
  balance: number;
  experience?: number;
  createdAt: string;
  topics: Topic[];
  replies: Reply[];
  topicsCount: number;
  repliesCount: number;
  levelInfo?: LevelInfo;
}

interface UserContentResponse {
  topics?: Topic[];
  replies?: Reply[];
  likedTopics?: Topic[];
  favoriteTopics?: Topic[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'topics' | 'replies' | 'liked' | 'favorites' | 'points' | 'badges' | 'tags'>('topics');
  const [content, setContent] = useState<UserContentResponse | null>(null);
  const [likedCount, setLikedCount] = useState<number>(0);
  const [favoritedCount, setFavoritedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
      fetchUserContent('topics');
      fetchUserContent('liked');
      fetchUserContent('favorites');
      fetchUserLevelInfo();
    }
  }, [id]);

  const getCurrentUserId = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      return currentUser.id;
    } catch {
      return null;
    }
  };

  const fetchUserLevelInfo = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      // 只有查看自己的资料时才获取详细等级信息
      if (currentUser.id === id) {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/points/info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          setLevelInfo(result.data.levelInfo);
          // 更新用户信息中的经验值
          if (user) {
            setUser({
              ...user,
              experience: result.data.user.experience
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching level info:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContent = async (type: 'topics' | 'replies' | 'liked' | 'favorites', page = 1) => {
    try {
      setContentLoading(true);
      let response;
      
      if (type === 'liked') {
        const data = await topicInteractionService.getUserLikedTopics(page, 10);
        setContent({ likedTopics: data.topics, pagination: data.pagination });
        if (page === 1) setLikedCount(data.pagination.total);
      } else if (type === 'favorites') {
        const data = await topicInteractionService.getUserFavoriteTopics(page, 10);
        setContent({ favoriteTopics: data.topics, pagination: data.pagination });
        if (page === 1) setFavoritedCount(data.pagination.total);
      } else {
        response = await fetch(`/api/users/${id}/${type}?page=${page}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setContent(data.data);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch user ${type}:`, error);
    } finally {
      setContentLoading(false);
    }
  };

  const handleTabChange = (tab: 'topics' | 'replies' | 'liked' | 'favorites' | 'badges' | 'tags' | 'points') => {
    // 添加淡出效果
    setContentLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      // 只对需要网络请求的标签调用fetchUserContent
      if (['topics', 'replies', 'liked', 'favorites'].includes(tab)) {
        fetchUserContent(tab);
      } else {
        setContentLoading(false);
      }
    }, 150); // 等待淡出动画完成
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">用户不存在</h2>
          <p className="text-muted-foreground mb-6">
            抱歉，找不到该用户的信息
          </p>
          <Button asChild>
            <Link to="/">返回首页</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 用户信息卡片 */}
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* 头像 */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-muted border-4 border-background shadow-lg overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                      <User className="h-16 w-16 text-primary" />
                    </div>
                  )}
                </div>
              </div>

              {/* 用户信息 */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {user.username}
                  </h1>
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>加入于 {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                {user.bio && (
                  <p className="text-foreground leading-relaxed max-w-2xl">
                    {user.bio}
                  </p>
                )}

                {/* 等级和积分信息 */}
                {levelInfo && (
                  <div className="mb-6">
                    <LevelProgress 
                      level={user.level} 
                      levelInfo={levelInfo}
                      className="mb-4"
                    />
                    <PointDisplay 
                      balance={user.balance}
                      experience={user.experience}
                      showExperience={true}
                      size="lg"
                      className="justify-center"
                    />
                  </div>
                )}

                {/* 统计信息 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {!levelInfo && (
                    <>
                      <div className="text-center p-3 bg-muted/20 rounded-lg border">
                        <div className="text-2xl font-bold text-primary">{user.level}</div>
                        <div className="text-sm text-muted-foreground">等级</div>
                      </div>
                      <div className="text-center p-3 bg-muted/20 rounded-lg border">
                        <div className="text-2xl font-bold text-primary">{user.balance}</div>
                        <div className="text-sm text-muted-foreground">积分</div>
                      </div>
                    </>
                  )}
                  <div className="text-center p-3 bg-muted/20 rounded-lg border">
                    <div className="text-2xl font-bold text-primary">{user.topicsCount}</div>
                    <div className="text-sm text-muted-foreground">主题</div>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg border">
                    <div className="text-2xl font-bold text-primary">{user.repliesCount}</div>
                    <div className="text-sm text-muted-foreground">回复</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 内容选项卡 */}
        <div className={`grid ${getCurrentUserId() === id ? 'grid-cols-3 md:grid-cols-7' : 'grid-cols-2 md:grid-cols-6'} gap-1 bg-muted/20 p-1 rounded-lg border`}>
          <button
            onClick={() => handleTabChange('topics')}
            className={`flex items-center justify-center space-x-2 py-3 px-2 rounded-md transition-all duration-200 ${
              activeTab === 'topics'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">主题</span>
            <span className="text-xs">({user.topicsCount})</span>
          </button>
          <button
            onClick={() => handleTabChange('replies')}
            className={`flex items-center justify-center space-x-2 py-3 px-2 rounded-md transition-all duration-200 ${
              activeTab === 'replies'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">回复</span>
            <span className="text-xs">({user.repliesCount})</span>
          </button>
          <button
            onClick={() => handleTabChange('liked')}
            className={`flex items-center justify-center space-x-2 py-3 px-2 rounded-md transition-all duration-200 ${
              activeTab === 'liked'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">点赞</span>
            <span className="text-xs">({likedCount})</span>
          </button>
          <button
            onClick={() => handleTabChange('favorites')}
            className={`flex items-center justify-center space-x-2 py-3 px-2 rounded-md transition-all duration-200 ${
              activeTab === 'favorites'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">收藏</span>
            <span className="text-xs">({favoritedCount})</span>
          </button>
          <button
            onClick={() => handleTabChange('badges')}
            className={`flex items-center justify-center space-x-2 py-3 px-2 rounded-md transition-all duration-200 ${
              activeTab === 'badges'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">勋章</span>
          </button>
          <button
            onClick={() => handleTabChange('tags')}
            className={`flex items-center justify-center space-x-2 py-3 px-2 rounded-md transition-all duration-200 ${
              activeTab === 'tags'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline">标识</span>
          </button>
          {getCurrentUserId() === id && (
            <button
              onClick={() => handleTabChange('points')}
              className={`flex items-center justify-center space-x-2 py-3 px-2 rounded-md transition-all duration-200 ${
                activeTab === 'points'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="h-4 w-4 text-yellow-500">💰</div>
              <span className="hidden sm:inline">积分</span>
            </button>
          )}
        </div>

        {/* 内容列表 */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              {activeTab === 'topics' ? (
                <>
                  <FileText className="h-5 w-5" />
                  <span>用户主题 ({user.topicsCount})</span>
                </>
              ) : activeTab === 'replies' ? (
                <>
                  <MessageSquare className="h-5 w-5" />
                  <span>用户回复 ({user.repliesCount})</span>
                </>
              ) : activeTab === 'liked' ? (
                <>
                  <Heart className="h-5 w-5" />
                  <span>点赞主题 ({likedCount})</span>
                </>
              ) : activeTab === 'favorites' ? (
                <>
                  <Bookmark className="h-5 w-5" />
                  <span>收藏主题 ({favoritedCount})</span>
                </>
              ) : activeTab === 'badges' ? (
                <>
                  <Trophy className="h-5 w-5" />
                  <span>用户勋章</span>
                </>
              ) : activeTab === 'tags' ? (
                <>
                  <Crown className="h-5 w-5" />
                  <span>专属标识</span>
                </>
              ) : (
                <>
                  <div className="h-5 w-5 text-yellow-500">💰</div>
                  <span>积分记录</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contentLoading ? (
              <div className="space-y-4 opacity-0 animate-fadeOut">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <CSSTransition
                in={!contentLoading}
                timeout={300}
                classNames="tab-content"
                unmountOnExit
              >
                <div>
                  {activeTab === 'points' ? (
                    <PointHistory />
                  ) : activeTab === 'badges' ? (
                    <BadgeDisplay userId={id} showAll={true} />
                  ) : activeTab === 'tags' ? (
                    <SpecialTagDisplay userId={id} />
                  ) : content && (
                    (activeTab === 'topics' && content.topics?.length) ||
                    (activeTab === 'replies' && content.replies?.length) ||
                    (activeTab === 'liked' && content.likedTopics?.length) ||
                    (activeTab === 'favorites' && content.favoriteTopics?.length)
                  ) ? (
                    <div className="space-y-4 animate-fadeIn">
                {activeTab === 'topics' && content.topics?.map((topic) => (
                  <div key={topic.id} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/topic/${topic.id}`}
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors overflow-hidden h-14 leading-7 block"
                        >
                          {topic.title}
                        </Link>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <Link
                              to={`/node/${topic.node?.name}`}
                              className="hover:text-foreground transition-colors"
                            >
                              {topic.node?.title}
                            </Link>
                          </div>
                          <span>{formatDate(topic.createdAt)}</span>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{topic.replies} 回复</span>
                          </div>
                          {(topic.likes > 0 || topic.favorites > 0) && (
                            <div className="flex items-center space-x-2">
                              {topic.likes > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{topic.likes}</span>
                                </div>
                              )}
                              {topic.favorites > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Bookmark className="h-3 w-3" />
                                  <span>{topic.favorites}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {activeTab === 'replies' && content.replies?.map((reply) => (
                  <div key={reply.id} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        回复了主题：
                        <Link
                          to={`/topic/${reply.topicId}`}
                          className="ml-1 text-foreground hover:text-primary transition-colors font-medium"
                        >
                          {reply.topicId}
                        </Link>
                      </div>
                      <div className="text-foreground leading-relaxed">
                        {reply.content}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(reply.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}

                {(activeTab === 'liked' || activeTab === 'favorites') && (
                  activeTab === 'liked' ? content.likedTopics : content.favoriteTopics
                )?.map((topic) => (
                  <div key={topic.id} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/topic/${topic.id}`}
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors overflow-hidden h-14 leading-7 block"
                        >
                          {topic.title}
                        </Link>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <Link
                              to={`/node/${topic.node?.name}`}
                              className="hover:text-foreground transition-colors"
                            >
                              {topic.node?.title}
                            </Link>
                          </div>
                          <span>{formatDate(topic.createdAt)}</span>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{topic.replies} 回复</span>
                          </div>
                          {(topic.likes > 0 || topic.favorites > 0) && (
                            <div className="flex items-center space-x-2">
                              {topic.likes > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{topic.likes}</span>
                                </div>
                              )}
                              {topic.favorites > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Bookmark className="h-3 w-3" />
                                  <span>{topic.favorites}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 分页 */}
                {content.pagination.pages > 1 && (
                  <div className="flex justify-center pt-6">
                    <div className="flex items-center space-x-2">
                      {[...Array(content.pagination.pages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          variant={content.pagination.page === i + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => fetchUserContent(activeTab, i + 1)}
                          className="min-w-[40px]"
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
                  ) : (
                    <div className="text-center py-12 animate-fadeIn">
                      <div className="text-muted-foreground mb-4">
                        {activeTab === 'topics' ? (
                          <>
                            <FileText className="h-12 w-12 mx-auto mb-4 transition-all duration-300" />
                            <p className="transition-all duration-300">该用户还没有发布过主题</p>
                          </>
                        ) : activeTab === 'replies' ? (
                          <>
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 transition-all duration-300" />
                            <p className="transition-all duration-300">该用户还没有发表过回复</p>
                          </>
                        ) : activeTab === 'liked' ? (
                          <>
                            <Heart className="h-12 w-12 mx-auto mb-4 transition-all duration-300" />
                            <p className="transition-all duration-300">该用户还没有点赞过主题</p>
                          </>
                        ) : activeTab === 'favorites' ? (
                          <>
                            <Bookmark className="h-12 w-12 mx-auto mb-4 transition-all duration-300" />
                            <p className="transition-all duration-300">该用户还没有收藏过主题</p>
                          </>
                        ) : activeTab === 'badges' ? (
                          <>
                            <Trophy className="h-12 w-12 mx-auto mb-4 transition-all duration-300" />
                            <p className="transition-all duration-300">该用户还没有获得任何勋章</p>
                          </>
                        ) : activeTab === 'tags' ? (
                          <>
                            <Crown className="h-12 w-12 mx-auto mb-4 transition-all duration-300" />
                            <p className="transition-all duration-300">该用户还没有专属标识</p>
                          </>
                        ) : (
                          <>
                            <div className="h-12 w-12 mx-auto mb-4 transition-all duration-300 text-yellow-500 text-4xl">💰</div>
                            <p className="transition-all duration-300">暂无积分记录</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CSSTransition>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;