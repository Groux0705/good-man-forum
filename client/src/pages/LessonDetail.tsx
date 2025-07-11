import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  Clock, 
  Eye, 
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageTransition from '../components/ui/PageTransition';
import { cachedFetch, invalidateCache } from '../utils/cache';

interface LessonNavigation {
  previousLesson: { id: string; title: string; chapterId: string } | null;
  nextLesson: { id: string; title: string; chapterId: string } | null;
  currentChapter: { id: string; title: string; order: number };
  allLessons: { id: string; title: string; order: number; chapterId: string }[];
}

interface LessonDetail {
  id: string;
  title: string;
  description: string | null;
  type: string;
  content: string | null;
  videoUrl: string | null;
  platform: string | null;
  duration: number | null;
  views: number;
  order: number;
  chapter: {
    id: string;
    title: string;
    order: number;
    course: {
      id: string;
      title: string;
      userId: string;
    };
  };
}

const LessonDetail: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [navigation, setNavigation] = useState<LessonNavigation | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    if (courseId && lessonId) {
      fetchLesson();
    }
  }, [courseId, lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await cachedFetch(`/api/courses/${courseId}/lessons/${lessonId}`, {}, `lesson:${courseId}:${lessonId}`, 300000); // 5分钟缓存
      if (response.ok) {
        const data = await response.json();
        setLesson(data.data);
        
        // 获取导航信息
        await fetchNavigation(data.data);
        
        // 检查是否已完成（需要登录用户）
        if (user) {
          await checkLessonCompletion();
        }
      } else {
        toast.error('课程小节不存在或已被删除');
      }
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
      toast.error('加载课程小节失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchNavigation = async (currentLesson: LessonDetail) => {
    try {
      const response = await cachedFetch(`/api/courses/${courseId}`, {}, `course:${courseId}`, 300000); // 5分钟缓存
      if (response.ok) {
        const data = await response.json();
        const course = data.data;
        
        // 获取所有小节按顺序排列
        const allLessons: any[] = [];
        course.chapters.forEach((chapter: any) => {
          chapter.lessons.forEach((lesson: any) => {
            allLessons.push({
              ...lesson,
              chapterId: chapter.id,
              chapterTitle: chapter.title,
              chapterOrder: chapter.order
            });
          });
        });
        
        // 找到当前小节的索引
        const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
        
        setNavigation({
          previousLesson: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
          nextLesson: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
          currentChapter: currentLesson.chapter,
          allLessons
        });
      }
    } catch (error) {
      console.error('Failed to fetch navigation:', error);
    }
  };

  const checkLessonCompletion = async () => {
    if (!user) return;
    
    try {
      const response = await cachedFetch(`/api/courses/${courseId}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }, `progress:${courseId}:${user.id}`, 60000); // 1分钟缓存
      
      if (response.ok) {
        const data = await response.json();
        setIsCompleted(data.data.completedLessonIds.includes(lessonId));
      }
    } catch (error) {
      console.error('Failed to check lesson completion:', error);
    }
  };

  const markLessonComplete = async () => {
    if (!user || markingComplete) return;
    
    setMarkingComplete(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: !isCompleted })
      });
      
      if (response.ok) {
        setIsCompleted(!isCompleted);
        toast.success(isCompleted ? '已取消完成标记' : '已标记为完成');
        // 清除进度缓存
        invalidateCache(`progress:${courseId}`);
      } else {
        toast.error('操作失败');
      }
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
      toast.error('操作失败');
    } finally {
      setMarkingComplete(false);
    }
  };

  const navigateToLesson = (lessonId: string) => {
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

  const getEmbedUrl = (videoUrl: string, platform: string) => {
    if (platform === 'youtube') {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (platform === 'bilibili') {
      const bvid = videoUrl.match(/BV[A-Za-z0-9]+/)?.[0];
      return `https://player.bilibili.com/player.html?bvid=${bvid}`;
    }
    return videoUrl;
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-6"></div>
              <div className="aspect-video bg-muted rounded-lg mb-6"></div>
              <div className="h-6 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!lesson) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">课程小节不存在</h1>
            <p className="text-muted-foreground mb-6">您要查看的课程小节可能已被删除或不存在。</p>
            <Button asChild>
              <Link to={`/courses/${courseId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回课程详情
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
        <div className="max-w-4xl mx-auto">
          {/* 面包屑导航 */}
          <div className="mb-6 animate-slide-up">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link 
                to="/courses" 
                className="hover:text-foreground transition-colors"
              >
                课程
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link 
                to={`/courses/${courseId}`} 
                className="hover:text-foreground transition-colors"
              >
                {lesson.chapter.course.title}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{lesson.title}</span>
            </nav>
          </div>

          {/* 返回按钮 */}
          <div className="mb-6 animate-slide-up">
            <Button variant="ghost" asChild>
              <Link to={`/courses/${courseId}`} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>返回课程详情</span>
              </Link>
            </Button>
          </div>

          {/* 课程小节内容 */}
          <div className="space-y-6">
            {/* 视频/内容区域 */}
            <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-0">
                {lesson.type === 'video' && lesson.videoUrl ? (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={getEmbedUrl(lesson.videoUrl, lesson.platform || 'youtube')}
                      title={lesson.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">文字课程</h3>
                      <p className="text-muted-foreground">请向下滚动查看课程内容</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 课程信息 */}
            <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                      {lesson.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{formatViews(lesson.views)} 观看</span>
                      </div>
                      {lesson.duration && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(lesson.duration)}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        {lesson.type === 'video' ? (
                          <PlayCircle className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        <span>{lesson.type === 'video' ? '视频课程' : '文字课程'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 章节信息 */}
                <div className="mb-4">
                  <Badge variant="outline" className="mb-2">
                    第{lesson.chapter.order}章 - {lesson.chapter.title}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    第{lesson.order}节
                  </div>
                </div>

                {/* 课程描述 */}
                {lesson.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">课程简介</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 文字课程内容 */}
            {lesson.type === 'text' && lesson.content && (
              <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>课程内容</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <ReactMarkdown>{lesson.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 导航按钮 */}
            <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => navigation?.previousLesson && navigateToLesson(navigation.previousLesson.id)}
                    disabled={!navigation?.previousLesson}
                    className="flex items-center space-x-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>上一节</span>
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={markLessonComplete}
                      disabled={!user || markingComplete}
                      variant={isCompleted ? "default" : "outline"}
                      className="flex items-center space-x-2"
                    >
                      {markingComplete ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <CheckCircle className={`h-5 w-5 ${isCompleted ? 'text-white' : 'text-green-500'}`} />
                      )}
                      <span>{isCompleted ? '已完成' : '标记为完成'}</span>
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigation?.nextLesson && navigateToLesson(navigation.nextLesson.id)}
                    disabled={!navigation?.nextLesson}
                    className="flex items-center space-x-2"
                  >
                    <span>下一节</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* 进度提示 */}
                {navigation && (
                  <div className="mt-4 text-center">
                    <div className="text-sm text-muted-foreground">
                      第{navigation.currentChapter.order}章 - {navigation.currentChapter.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      小节 {navigation.allLessons.findIndex(l => l.id === lesson?.id) + 1} / {navigation.allLessons.length}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 返回课程详情 */}
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <Button asChild variant="outline" size="lg">
                <Link to={`/courses/${courseId}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回课程详情
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LessonDetail;