import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Calendar, MessageSquare, FileText, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Topic, Reply } from '../types';

interface UserProfile {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  level: number;
  balance: number;
  createdAt: string;
  topics: Topic[];
  replies: Reply[];
  topicsCount: number;
  repliesCount: number;
}

interface UserContentResponse {
  topics?: Topic[];
  replies?: Reply[];
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
  const [activeTab, setActiveTab] = useState<'topics' | 'replies'>('topics');
  const [content, setContent] = useState<UserContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
      fetchUserContent('topics');
    }
  }, [id]);

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

  const fetchUserContent = async (type: 'topics' | 'replies', page = 1) => {
    try {
      setContentLoading(true);
      const response = await fetch(`/api/users/${id}/${type}?page=${page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setContent(data.data);
      }
    } catch (error) {
      console.error(`Failed to fetch user ${type}:`, error);
    } finally {
      setContentLoading(false);
    }
  };

  const handleTabChange = (tab: 'topics' | 'replies') => {
    setActiveTab(tab);
    fetchUserContent(tab);
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

                {/* 统计信息 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/20 rounded-lg border">
                    <div className="text-2xl font-bold text-primary">{user.level}</div>
                    <div className="text-sm text-muted-foreground">等级</div>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg border">
                    <div className="text-2xl font-bold text-primary">{user.balance}</div>
                    <div className="text-sm text-muted-foreground">余额</div>
                  </div>
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
        <div className="flex space-x-1 bg-muted/20 p-1 rounded-lg border">
          <button
            onClick={() => handleTabChange('topics')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200 ${
              activeTab === 'topics'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>主题 ({user.topicsCount})</span>
          </button>
          <button
            onClick={() => handleTabChange('replies')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200 ${
              activeTab === 'replies'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>回复 ({user.repliesCount})</span>
          </button>
        </div>

        {/* 内容列表 */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              {activeTab === 'topics' ? (
                <>
                  <FileText className="h-5 w-5" />
                  <span>用户主题</span>
                </>
              ) : (
                <>
                  <MessageSquare className="h-5 w-5" />
                  <span>用户回复</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contentLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : content && (activeTab === 'topics' ? content.topics : content.replies)?.length ? (
              <div className="space-y-4">
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
                          to={`/topic/${reply.topic?.id}`}
                          className="ml-1 text-foreground hover:text-primary transition-colors font-medium"
                        >
                          {reply.topic?.title}
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
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  {activeTab === 'topics' ? (
                    <>
                      <FileText className="h-12 w-12 mx-auto mb-4" />
                      <p>该用户还没有发布过主题</p>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                      <p>该用户还没有发表过回复</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;