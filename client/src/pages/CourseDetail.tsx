import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Eye, Heart, MessageSquare, Clock, User, ArrowLeft, Share2, ThumbsUp, BookOpen, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Textarea';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

interface CourseComment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
    level: number;
  };
}

interface CourseDetail {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  type: string;
  content: string | null;
  videoUrl: string | null;
  platform: string | null;
  category: string;
  tags: string | null;
  duration: number | null;
  difficulty: string;
  views: number;
  likes: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
    level: number;
  };
  comments: CourseComment[];
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data.data);
      } else {
        toast.error('课程不存在或已被删除');
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      toast.error('加载课程失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    try {
      const response = await fetch(`/api/courses/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(prev => prev ? { ...prev, likes: data.data.likes } : null);
        toast.success('点赞成功');
      } else {
        toast.error('点赞失败');
      }
    } catch (error) {
      console.error('Like course error:', error);
      toast.error('点赞失败');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (!comment.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    setSubmittingComment(true);

    try {
      const response = await fetch(`/api/courses/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(prev => prev ? {
          ...prev,
          comments: [data.data, ...prev.comments]
        } : null);
        setComment('');
        toast.success('评论发表成功');
      } else {
        toast.error('评论发表失败');
      }
    } catch (error) {
      console.error('Submit comment error:', error);
      toast.error('评论发表失败');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const getCategoryName = (category: string) => {
    const categories = {
      'relationship': '恋爱关系',
      'communication': '沟通技巧',
      'self-improvement': '自我提升',
      'dating': '约会技巧',
      'psychology': '心理学'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getDifficultyName = (difficulty: string) => {
    const difficulties = {
      'beginner': '初级',
      'intermediate': '中级',
      'advanced': '高级'
    };
    return difficulties[difficulty as keyof typeof difficulties] || difficulty;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCourseTypeIcon = () => {
    return course?.type === 'video' ? Play : BookOpen;
  };

  const getEmbedUrl = (videoUrl: string, platform: string) => {
    if (platform === 'youtube') {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (platform === 'bilibili') {
      // Bilibili 嵌入处理（需要根据实际URL格式调整）
      const bvid = videoUrl.match(/BV[A-Za-z0-9]+/)?.[0];
      return `https://player.bilibili.com/player.html?bvid=${bvid}`;
    }
    return videoUrl;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-6"></div>
            <div className="aspect-video bg-muted rounded-lg mb-6"></div>
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">课程不存在</h1>
          <p className="text-muted-foreground mb-6">您要查看的课程可能已被删除或不存在。</p>
          <Button asChild>
            <Link to="/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回课程列表
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const TypeIcon = getCourseTypeIcon();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/courses" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>返回课程列表</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2">
            {/* 课程媒体内容 */}
            <Card className="glass-card mb-6">
              <CardContent className="p-0">
                {course.type === 'video' && course.videoUrl ? (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={getEmbedUrl(course.videoUrl, course.platform || 'youtube')}
                      title={course.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">文字课程</h3>
                      <p className="text-muted-foreground">请向下滚动查看课程内容</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 课程信息 */}
            <Card className="glass-card mb-6">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                      {course.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{formatViews(course.views)} 学习</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                      </div>
                      {course.duration && (
                        <div className="flex items-center space-x-1">
                          <TypeIcon className="h-4 w-4" />
                          <span>{formatDuration(course.duration)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center space-x-3 mb-6">
                  <Button onClick={handleLike} className="flex items-center space-x-2">
                    <Heart className="h-4 w-4" />
                    <span>{course.likes}</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Share2 className="h-4 w-4" />
                    <span>分享</span>
                  </Button>
                </div>

                {/* 课程描述 */}
                {course.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">课程简介</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                )}

                {/* 标签 */}
                {course.tags && (
                  <div className="flex flex-wrap gap-2">
                    {course.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 文字课程内容 */}
            {course.type === 'text' && course.content && (
              <Card className="glass-card mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>课程内容</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <ReactMarkdown>{course.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 评论区 */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>评论 ({course.comments.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* 发表评论 */}
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={user ? "写下你的想法..." : "请先登录后再评论"}
                    disabled={!user || submittingComment}
                    className="mb-3"
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={!user || !comment.trim() || submittingComment}
                    >
                      {submittingComment ? '发表中...' : '发表评论'}
                    </Button>
                  </div>
                </form>

                {/* 评论列表 */}
                <div className="space-y-4">
                  {course.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {comment.user.avatar ? (
                          <img 
                            src={comment.user.avatar} 
                            alt={comment.user.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-foreground">{comment.user.username}</span>
                          <Badge variant="outline" className="text-xs">
                            Lv.{comment.user.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {course.comments.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">还没有评论，来发表第一个评论吧！</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            {/* 创作者信息 */}
            <Card className="glass-card mb-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {course.user.avatar ? (
                      <img 
                        src={course.user.avatar} 
                        alt={course.user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{course.user.username}</h3>
                    <p className="text-sm text-muted-foreground">Lv.{course.user.level} 讲师</p>
                  </div>
                </div>
                <Button className="w-full">关注讲师</Button>
              </CardContent>
            </Card>

            {/* 课程信息 */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">课程信息</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">类型</span>
                    <Badge variant="outline">
                      {course.type === 'video' ? '视频课程' : '文字课程'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">分类</span>
                    <Badge variant="outline">{getCategoryName(course.category)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">难度</span>
                    <Badge className={`text-white ${getDifficultyColor(course.difficulty)}`}>
                      {getDifficultyName(course.difficulty)}
                    </Badge>
                  </div>
                  {course.type === 'video' && course.platform && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">平台</span>
                      <Badge variant="secondary">
                        {course.platform === 'youtube' ? 'YouTube' : 
                         course.platform === 'bilibili' ? 'Bilibili' : 
                         '本地视频'}
                      </Badge>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">学习人数</span>
                    <span className="font-medium">{formatViews(course.views)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">点赞数</span>
                    <span className="font-medium">{course.likes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">评论数</span>
                    <span className="font-medium">{course.comments.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;