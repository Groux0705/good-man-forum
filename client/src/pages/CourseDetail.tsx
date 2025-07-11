import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Play, 
  Eye, 
  Heart, 
  MessageSquare, 
  Clock, 
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
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.resolve().then(() => {
        fetchCourse();
      });
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data.data);
        
        // 检查用户是否已报名
        if (user && data.data.enrollmentList) {
          const userEnrollment = data.data.enrollmentList.find(
            (enrollment: CourseEnrollment) => enrollment.userId === user.id
          );
          setIsEnrolled(!!userEnrollment);
        }
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
                      {course.chapters.map((chapter, index) => (
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
                              <span className="text-sm text-muted-foreground">
                                {chapter.lessons.length} 小节
                              </span>
                              {expandedChapters.has(chapter.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          </button>
                          
                          {expandedChapters.has(chapter.id) && (
                            <div className="border-t bg-muted/20">
                              {chapter.lessons.map((lesson, lessonIndex) => (
                                <button
                                  key={lesson.id}
                                  onClick={() => handleLessonClick(course.id, lesson.id)}
                                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between border-t first:border-t-0"
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
                                    </div>
                                  </div>
                                  {lesson.duration && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatDuration(lesson.duration)}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
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
                    <Button onClick={handleLike} variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      {course.likes}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      分享
                    </Button>
                  </div>
                </CardContent>
              </Card>

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