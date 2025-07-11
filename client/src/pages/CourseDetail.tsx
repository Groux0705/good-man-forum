import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  User, 
  ArrowLeft, 
  Share2, 
  BookOpen, 
  ChevronDown,
  ChevronRight,
  Users,
  Target,
  CheckCircle,
  PlayCircle,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Textarea';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { CourseDetailSkeleton } from '../components/ui/Skeleton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageTransition from '../components/ui/PageTransition';
import { cachedFetch, invalidateCache } from '../utils/cache';

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

interface CourseLesson {
  id: string;
  title: string;
  type: string;
  duration: number | null;
  order: number;
}

interface CourseChapter {
  id: string;
  title: string;
  description: string | null;
  order: number;
  duration: number | null;
  lessons: CourseLesson[];
}

interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  completedLessonIds: string[];
}

interface CourseEnrollment {
  id: string;
  userId: string;
  enrolledAt: string;
  progress: number;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  category: string;
  tags: string | null;
  difficulty: string;
  views: number;
  likes: number;
  enrollments: number;
  requirements: string | null;
  objectives: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
    level: number;
  };
  chapters: CourseChapter[];
  comments: CourseComment[];
  enrollmentList: CourseEnrollment[];
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.resolve().then(() => {
        fetchCourse();
      });
    }
  }, [id]);

  // 自动展开第一个章节
  useEffect(() => {
    if (course && course.chapters.length > 0) {
      setExpandedChapters(new Set([course.chapters[0].id]));
    }
  }, [course]);

  // 获取学习进度
  useEffect(() => {
    if (course && user && isEnrolled) {
      fetchCourseProgress();
    }
  }, [course, user, isEnrolled]);

  const fetchCourseProgress = async () => {
    if (!user || !course) return;
    
    try {
      const response = await cachedFetch(`/api/courses/${course.id}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }, `progress:${course.id}:${user.id}`, 60000); // 1分钟缓存
      
      if (response.ok) {
        const data = await response.json();
        setCourseProgress(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch course progress:', error);
    }
  };

  const fetchCourse = async () => {
    try {
      setError(null);
      const response = await cachedFetch(`/api/courses/${id}`, {}, `course:${id}`, 300000); // 5分钟缓存
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('课程不存在或已被删除');
        } else {
          setError('加载课程失败，请稍后重试');
        }
        return;
      }
      
      const data = await response.json();
      if (!data.success) {
        setError(data.error || '加载课程失败');
        return;
      }
      
      setCourse(data.data);
      
      // 检查用户是否已报名
      if (user && data.data.enrollmentList) {
        const userEnrollment = data.data.enrollmentList.find(
          (enrollment: CourseEnrollment) => enrollment.userId === user.id
        );
        setIsEnrolled(!!userEnrollment);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      setError('网络错误，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsEnrolled(true);
        setCourse(prev => prev ? { ...prev, enrollments: prev.enrollments + 1 } : null);
        toast.success('报名成功！');
        // 清除相关缓存
        invalidateCache(`course:${id}`);
        invalidateCache(`progress:${id}`);
      } else {
        const data = await response.json();
        toast.error(data.error || '报名失败');
      }
    } catch (error) {
      console.error('Enroll course error:', error);
      toast.error('报名失败');
    } finally {
      setEnrolling(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (liking) return;

    setLiking(true);
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
        setIsLiked(true);
        toast.success('点赞成功');
        // 清除课程缓存
        invalidateCache(`course:${id}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || '点赞失败');
      }
    } catch (error) {
      console.error('Like course error:', error);
      toast.error('网络错误，请稍后重试');
    } finally {
      setLiking(false);
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
        // 清除课程缓存
        invalidateCache(`course:${id}`);
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

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const handleLessonClick = (courseId: string, lessonId: string) => {
    // 检查是否已报名
    if (!isEnrolled) {
      toast.error('请先报名课程');
      return;
    }
    // 导航到课程小节页面
    window.location.href = `/courses/${courseId}/lessons/${lessonId}`;
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

  // 当loading时，完全显示骨架屏
  if (loading) {
    return <CourseDetailSkeleton />;
  }

  // 错误状态处理
  if (error) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">加载失败</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => window.location.reload()} variant="outline">
                重新加载
              </Button>
              <Button asChild>
                <Link to="/courses">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回课程列表
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!course) {
    return (
      <PageTransition>
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
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 返回按钮 */}
          <div className="mb-6 animate-slide-up">
            <Button variant="ghost" asChild>
              <Link to="/courses" className="flex items-center space-x-2 transition-all duration-200 hover:scale-105">
                <ArrowLeft className="h-4 w-4" />
                <span>返回课程列表</span>
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧主要内容 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 课程标题和基本信息 */}
              <div className="animate-slide-up">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  {course.title}
                </h1>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{formatViews(course.views)} 学习</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{course.likes} 点赞</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.enrollments} 已报名</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mb-6">
                  <Badge variant="outline">{getCategoryName(course.category)}</Badge>
                  <Badge className={`text-white ${getDifficultyColor(course.difficulty)}`}>
                    {getDifficultyName(course.difficulty)}
                  </Badge>
                </div>
              </div>

              {/* 发布人信息 */}
              <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
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
                      <p className="text-sm text-muted-foreground">讲师 • Lv.{course.user.level}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 课程介绍 */}
              {course.description && (
                <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <CardHeader>
                    <CardTitle>课程介绍</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {course.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* 课程章节 */}
              <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>课程章节</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {course.chapters.length > 0 ? (
                    <div className="space-y-4">
                      {course.chapters.map((chapter, index) => {
                        const isExpanded = expandedChapters.has(chapter.id);
                        const totalDuration = chapter.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
                        
                        return (
                          <div key={chapter.id} className="border rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleChapter(chapter.id)}
                              className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground">{chapter.title}</h4>
                                  {chapter.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {chapter.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <div className="text-sm text-muted-foreground">
                                    {chapter.lessons.length} 小节
                                  </div>
                                  {totalDuration > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      {formatDuration(totalDuration)}
                                    </div>
                                  )}
                                </div>
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </div>
                            </button>
                            
                            {isExpanded && (
                              <div className="border-t bg-muted/20">
                                {chapter.lessons.map((lesson, lessonIndex) => (
                                  <button
                                    key={lesson.id}
                                    onClick={() => handleLessonClick(course.id, lesson.id)}
                                    className={`w-full p-4 text-left transition-colors flex items-center justify-between border-t first:border-t-0 ${
                                      isEnrolled 
                                        ? 'hover:bg-muted/50 cursor-pointer' 
                                        : 'opacity-60 cursor-not-allowed'
                                    }`}
                                    disabled={!isEnrolled}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                        {lessonIndex + 1}
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {lesson.type === 'video' ? (
                                          <PlayCircle className="h-4 w-4 text-primary" />
                                        ) : (
                                          <FileText className="h-4 w-4 text-primary" />
                                        )}
                                        <span className="text-sm font-medium">{lesson.title}</span>
                                        {!isEnrolled && (
                                          <span className="text-xs text-muted-foreground ml-2">（需报名）</span>
                                        )}
                                        {isEnrolled && courseProgress && courseProgress.completedLessonIds.includes(lesson.id) && (
                                          <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {lesson.duration && (
                                        <span className="text-xs text-muted-foreground">
                                          {formatDuration(lesson.duration)}
                                        </span>
                                      )}
                                      {!isEnrolled && (
                                        <span className="text-xs text-muted-foreground">🔒</span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">暂无课程章节</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 讲师信息 */}
              <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle>讲师信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {course.user.avatar ? (
                        <img 
                          src={course.user.avatar} 
                          alt={course.user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{course.user.username}</h3>
                      <p className="text-muted-foreground">资深讲师 • Lv.{course.user.level}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧边栏 */}
            <div className="space-y-6">
              {/* 课程封面 */}
              <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">课程封面</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 已报名学员 */}
              <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>已报名学员</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-bold text-primary">{course.enrollments}</span>
                    <span className="text-muted-foreground">人已报名</span>
                  </div>
                  {course.enrollmentList.length > 0 && (
                    <div className="flex -space-x-2">
                      {course.enrollmentList.slice(0, 5).map((enrollment, index) => (
                        <div key={enrollment.id} className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium border-2 border-background">
                          {index + 1}
                        </div>
                      ))}
                      {course.enrollmentList.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                          +{course.enrollmentList.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 报名按钮 */}
              <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <CardContent className="p-6">
                  <Button 
                    onClick={handleEnroll}
                    disabled={isEnrolled || enrolling || !user}
                    className="w-full text-lg py-6 transition-all duration-200 hover:scale-105"
                  >
                    {enrolling ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        报名中...
                      </>
                    ) : isEnrolled ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        已报名
                      </>
                    ) : !user ? (
                      '请先登录'
                    ) : (
                      '立即报名'
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-between mt-4">
                    <Button 
                      onClick={handleLike} 
                      variant="outline" 
                      size="sm"
                      disabled={liking}
                      className={`transition-all duration-200 ${isLiked ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
                    >
                      {liking ? (
                        <LoadingSpinner size="sm" className="mr-1" />
                      ) : (
                        <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                      )}
                      {course.likes}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      分享
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 学习进度 */}
              {isEnrolled && courseProgress && (
                <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.25s' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>学习进度</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">完成进度</span>
                        <span className="text-sm font-medium">
                          {courseProgress.completedLessons} / {courseProgress.totalLessons} 小节
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${courseProgress.progressPercentage}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-bold text-primary">{courseProgress.progressPercentage}%</span>
                        <p className="text-sm text-muted-foreground mt-1">已完成</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 课程要求 */}
              {course.requirements && (
                <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>课程要求</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{course.requirements}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 学习目标 */}
              {course.objectives && (
                <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.5s' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>学习目标</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{course.objectives}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* 评论区 */}
          <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
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
                      className="transition-all duration-200 hover:scale-105"
                    >
                      {submittingComment ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          发表中...
                        </>
                      ) : (
                        '发表评论'
                      )}
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
        </div>
      </div>
    </PageTransition>
  );
};

export default CourseDetail;