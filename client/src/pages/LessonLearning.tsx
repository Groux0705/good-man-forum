import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  Clock, 
  Eye, 
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Monitor,
  Edit3,
  HelpCircle,
  List,
  Target,
  X,
  Menu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Textarea';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageTransition from '../components/ui/PageTransition';
import { cachedFetch, invalidateCache } from '../utils/cache';

// 数据类型定义
interface LessonContent {
  videoUrl?: string;
  description?: string;
  keyPoints?: Array<{ time: number; title: string }>;
  markdown?: string;
  tableOfContents?: Array<{ title: string; anchor: string }>;
  instructions?: string;
  template?: string;
  solution?: string;
  language?: string;
  questions?: Array<{
    type: 'single' | 'multiple' | 'fill';
    question: string;
    options?: string[];
    correct: number | number[] | string;
    explanation: string;
  }>;
}

interface CourseLesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'practice' | 'quiz';
  order: number;
  duration: number;
  content: LessonContent;
  completed?: boolean;
}

interface CourseChapter {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: CourseLesson[];
}

interface CourseData {
  id: string;
  title: string;
  chapters: CourseChapter[];
}

interface QuizAnswer {
  [key: number]: string | number | number[];
}

const LessonLearning: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // 状态管理
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // 实操练习状态
  const [practiceCode, setPracticeCode] = useState('');
  const [showSolution, setShowSolution] = useState(false);

  // 测验状态
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // 视频播放状态
  const [videoProgress, setVideoProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    if (courseId && lessonId) {
      fetchCourseData();
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    if (courseData && lessonId) {
      findCurrentLesson();
    }
  }, [courseData, lessonId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await cachedFetch(`/api/courses/${courseId}`, {}, `course:${courseId}`, 300000);
      
      if (response.ok) {
        const data = await response.json();
        setCourseData(data.data);
        
        // 自动展开包含当前小节的章节
        if (lessonId) {
          const chapterWithLesson = data.data.chapters.find((chapter: CourseChapter) => 
            chapter.lessons.some(lesson => lesson.id === lessonId)
          );
          if (chapterWithLesson) {
            setExpandedChapters(new Set([chapterWithLesson.id]));
          }
        }
        
        // 获取用户进度
        if (user) {
          await fetchUserProgress();
        }
      } else {
        toast.error('加载课程数据失败');
      }
    } catch (error) {
      console.error('Failed to fetch course data:', error);
      toast.error('网络错误，请检查连接');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;
    
    try {
      const response = await cachedFetch(`/api/courses/${courseId}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }, `progress:${courseId}:${user.id}`, 60000);
      
      if (response.ok) {
        const data = await response.json();
        setCompletedLessons(new Set(data.data.completedLessonIds));
        setIsCompleted(data.data.completedLessonIds.includes(lessonId));
      }
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
    }
  };

  const findCurrentLesson = () => {
    if (!courseData || !lessonId) return;
    
    for (const chapter of courseData.chapters) {
      const lesson = chapter.lessons.find(l => l.id === lessonId);
      if (lesson) {
        // 创建课程副本并解析内容
        let parsedContent = lesson.content;
        if (typeof lesson.content === 'string') {
          try {
            parsedContent = JSON.parse(lesson.content);
          } catch (e) {
            console.error('Failed to parse lesson content:', e);
            parsedContent = {}; // 设置默认空对象
          }
        }
        
        // 确保 content 是对象
        if (!parsedContent || typeof parsedContent !== 'object') {
          parsedContent = {};
        }
        
        // 创建包含解析后内容的课程对象
        const lessonWithParsedContent = {
          ...lesson,
          content: parsedContent
        };
        
        setCurrentLesson(lessonWithParsedContent);
        
        // 初始化实操练习代码
        if (lesson.type === 'practice' && parsedContent.template) {
          setPracticeCode(parsedContent.template);
        }
        
        break;
      }
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

  const navigateToLesson = (lessonId: string) => {
    navigate(`/courses/${courseId}/lessons/${lessonId}`);
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
        if (!isCompleted) {
          setCompletedLessons(prev => new Set([...prev, lessonId!]));
        } else {
          setCompletedLessons(prev => {
            const newSet = new Set(prev);
            newSet.delete(lessonId!);
            return newSet;
          });
        }
        toast.success(isCompleted ? '已取消完成标记' : '已标记为完成');
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

  const getCurrentLessonIndex = () => {
    if (!courseData || !currentLesson) return -1;
    
    let index = 0;
    for (const chapter of courseData.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.id === currentLesson.id) {
          return index;
        }
        index++;
      }
    }
    return -1;
  };

  const getAllLessons = () => {
    if (!courseData) return [];
    
    const allLessons: CourseLesson[] = [];
    courseData.chapters.forEach(chapter => {
      allLessons.push(...chapter.lessons);
    });
    return allLessons;
  };

  const getNavigationLessons = () => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();
    
    return {
      previous: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
    };
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getIconForLessonType = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'practice': return <Edit3 className="h-4 w-4" />;
      case 'quiz': return <HelpCircle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'video': return '视频';
      case 'article': return '文章';
      case 'practice': return '实操练习';
      case 'quiz': return '测验';
      default: return '课程';
    }
  };

  const handleQuizAnswer = (questionIndex: number, answer: string | number | number[]) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const submitQuiz = () => {
    if (!currentLesson || !currentLesson.content?.questions) return;
    
    let correct = 0;
    const questions = currentLesson.content.questions;
    
    questions.forEach((question, index) => {
      const userAnswer = quizAnswers[index];
      const correctAnswer = question.correct;
      
      if (question.type === 'single' && userAnswer === correctAnswer) {
        correct++;
      } else if (question.type === 'multiple' && Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
        if (userAnswer.length === correctAnswer.length && 
            userAnswer.every(ans => correctAnswer.includes(ans))) {
          correct++;
        }
      } else if (question.type === 'fill' && userAnswer === correctAnswer) {
        correct++;
      }
    });
    
    setQuizScore(Math.round((correct / questions.length) * 100));
    setQuizSubmitted(true);
    
    // 如果通过测验，自动标记为完成
    if (correct / questions.length >= 0.6) {
      markLessonComplete();
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex h-screen">
          <div className="w-80 bg-muted/20 animate-pulse">
            <div className="p-4 space-y-4">
              <div className="h-8 bg-muted rounded"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 p-8 animate-pulse">
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded"></div>
              <div className="aspect-video bg-muted rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!courseData || !currentLesson) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">课程小节不存在</h1>
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

  const navigation = getNavigationLessons();

  return (
    <PageTransition>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* 左侧导航栏 */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:flex lg:flex-col`}>
          <div className="flex flex-col h-full">
            {/* 导航栏标题 */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-foreground line-clamp-1">{courseData.title}</h2>
                <p className="text-sm text-muted-foreground">课程章节</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="lg:hidden ml-2 flex-shrink-0"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* 章节列表 - 可滚动区域 */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <div className="space-y-3 pb-4">
                {courseData.chapters.map((chapter) => (
                  <div key={chapter.id} className="bg-background/50 border rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="w-full p-4 text-left hover:bg-muted/50 transition-all duration-200 flex items-center justify-between group"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{chapter.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{chapter.lessons.length} 小节</p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        {expandedChapters.has(chapter.id) ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </button>
                    
                    {expandedChapters.has(chapter.id) && (
                      <div className="border-t bg-muted/10">
                        {chapter.lessons.map((lesson, index) => (
                          <button
                            key={lesson.id}
                            onClick={() => navigateToLesson(lesson.id)}
                            className={`w-full p-4 text-left transition-all duration-200 flex items-center justify-between border-t first:border-t-0 group ${
                              lesson.id === currentLesson.id
                                ? 'bg-primary/10 border-primary/20 shadow-sm'
                                : 'hover:bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                lesson.id === currentLesson.id ? 'bg-primary/20' : 'bg-muted/50'
                              }`}>
                                <span className="text-xs font-medium">{index + 1}</span>
                              </div>
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <div className={`flex-shrink-0 ${
                                  lesson.id === currentLesson.id ? 'text-primary' : 'text-muted-foreground'
                                } group-hover:text-primary transition-colors`}>
                                  {getIconForLessonType(lesson.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium transition-colors line-clamp-1 ${
                                    lesson.id === currentLesson.id ? 'text-primary' : 'text-foreground group-hover:text-primary'
                                  }`}>
                                    {lesson.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {getTypeDisplayName(lesson.type)} · {formatDuration(lesson.duration)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                              {completedLessons.has(lesson.id) && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              {lesson.id === currentLesson.id && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* 返回按钮 - 固定在底部 */}
            <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
              <Button variant="outline" asChild className="w-full">
                <Link to={`/courses/${courseId}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回课程详情
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 flex flex-col h-full">
          {/* 顶部工具栏 - 固定 */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden flex-shrink-0"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-foreground line-clamp-1">{currentLesson.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {getTypeDisplayName(currentLesson.type)} · {formatDuration(currentLesson.duration)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                onClick={markLessonComplete}
                disabled={!user || markingComplete}
                variant={isCompleted ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
              >
                {markingComplete ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <CheckCircle className={`h-4 w-4 mr-2 ${isCompleted ? 'text-white' : 'text-green-500'}`} />
                )}
                {isCompleted ? '已完成' : '标记完成'}
              </Button>
            </div>
          </div>

          {/* 主内容区 - 可滚动，占据剩余空间 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-5xl mx-auto">
              {/* 视频类型内容 */}
              {currentLesson.type === 'video' && (
                <div className="space-y-6">
                  <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-white">
                        <PlayCircle className="h-20 w-20 mx-auto mb-4 opacity-60" />
                        <p className="text-xl font-medium mb-2">视频播放器</p>
                        <p className="text-sm opacity-75">模拟视频播放界面</p>
                        <div className="mt-6 flex items-center justify-center space-x-4">
                          <Button variant="secondary" size="sm">
                            <PlayCircle className="h-4 w-4 mr-2" />
                            播放
                          </Button>
                          <div className="text-xs opacity-60">
                            时长: {formatDuration(currentLesson.duration)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {currentLesson.content?.description && (
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="h-5 w-5" />
                          <span>视频简介</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">{currentLesson.content?.description}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {currentLesson.content?.keyPoints && (
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="h-5 w-5" />
                          <span>关键时间点</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {currentLesson.content?.keyPoints?.map((point, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                              <Badge variant="outline" className="font-mono">{formatDuration(point.time)}</Badge>
                              <span className="text-sm flex-1">{point.title}</span>
                              <Button variant="ghost" size="sm">
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* 文章类型内容 */}
              {currentLesson.type === 'article' && (
                <div className="space-y-6">
                  {currentLesson.content?.tableOfContents && (
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <List className="h-5 w-5" />
                          <span>目录</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2">
                          {currentLesson.content?.tableOfContents?.map((item, index) => (
                            <a
                              key={index}
                              href={`#${item.anchor}`}
                              className="flex items-center p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-all duration-200"
                            >
                              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium mr-3">
                                {index + 1}
                              </span>
                              {item.title}
                            </a>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card className="glass-card">
                    <CardContent className="p-8">
                      <div className="prose prose-lg dark:prose-invert max-w-none">
                        <ReactMarkdown>{currentLesson.content?.markdown || '暂无内容'}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 实操练习类型内容 */}
              {currentLesson.type === 'practice' && (
                <div className="space-y-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>练习说明</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{currentLesson.content?.instructions || '暂无练习说明'}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* 编辑器区域 */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Edit3 className="h-5 w-5" />
                            <span>代码编辑器</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSolution(!showSolution)}
                            className="text-xs"
                          >
                            {showSolution ? '隐藏答案' : '查看答案'}
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-muted/30 px-3 py-2 border-b text-xs font-mono text-muted-foreground">
                            JavaScript
                          </div>
                          <Textarea
                            value={showSolution ? (currentLesson.content?.solution || '暂无答案') : practiceCode}
                            onChange={(e) => setPracticeCode(e.target.value)}
                            placeholder="在这里编写你的代码..."
                            className="min-h-[400px] font-mono text-sm border-0 rounded-none resize-none"
                            disabled={showSolution}
                          />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            {showSolution ? '参考答案' : '按 Ctrl+/ 添加注释'}
                          </div>
                          <Button size="sm" disabled={showSolution}>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            运行代码
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* 结果展示区域 */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Monitor className="h-5 w-5" />
                          <span>运行结果</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="min-h-[400px] bg-gray-900 rounded-lg p-4 font-mono text-sm">
                          <div className="text-center text-green-400 h-full flex flex-col items-center justify-center">
                            <Monitor className="h-16 w-16 mb-4 opacity-50" />
                            <p className="mb-2">控制台输出</p>
                            <p className="text-xs opacity-60">点击运行代码查看结果</p>
                            <div className="mt-6 space-y-1 text-xs opacity-40">
                              <div>$ Ready to execute...</div>
                              <div className="animate-pulse">▊</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* 测验类型内容 */}
              {currentLesson.type === 'quiz' && (
                <div className="space-y-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <HelpCircle className="h-5 w-5" />
                          <span>测验题目</span>
                        </div>
                        {!quizSubmitted && (
                          <Badge variant="outline">
                            {currentLesson.content?.questions?.length || 0} 题
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        {currentLesson.content?.questions?.map((question, index) => (
                          <div key={index} className="bg-background/50 border rounded-xl p-6">
                            <div className="flex items-start space-x-3 mb-4">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground mb-4 leading-relaxed">
                                  {question.question}
                                </h4>
                                
                                {question.type === 'single' && (
                                  <div className="space-y-3">
                                    {question.options?.map((option, optIndex) => (
                                      <label key={optIndex} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`question-${index}`}
                                          value={optIndex}
                                          checked={quizAnswers[index] === optIndex}
                                          onChange={(e) => handleQuizAnswer(index, parseInt(e.target.value))}
                                          disabled={quizSubmitted}
                                          className="w-4 h-4"
                                        />
                                        <span className="flex-1">{option}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                                
                                {question.type === 'multiple' && (
                                  <div className="space-y-3">
                                    {question.options?.map((option, optIndex) => (
                                      <label key={optIndex} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={Array.isArray(quizAnswers[index]) && (quizAnswers[index] as number[]).includes(optIndex)}
                                          onChange={(e) => {
                                            const currentAnswers = (quizAnswers[index] as number[]) || [];
                                            if (e.target.checked) {
                                              handleQuizAnswer(index, [...currentAnswers, optIndex]);
                                            } else {
                                              handleQuizAnswer(index, currentAnswers.filter(ans => ans !== optIndex));
                                            }
                                          }}
                                          disabled={quizSubmitted}
                                          className="w-4 h-4"
                                        />
                                        <span className="flex-1">{option}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                                
                                {question.type === 'fill' && (
                                  <input
                                    type="text"
                                    value={quizAnswers[index] || ''}
                                    onChange={(e) => handleQuizAnswer(index, e.target.value)}
                                    placeholder="请输入答案..."
                                    className="w-full p-3 border rounded-lg bg-background"
                                    disabled={quizSubmitted}
                                  />
                                )}
                                
                                {quizSubmitted && (
                                  <div className="mt-4 p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
                                    <p className="text-sm text-muted-foreground">
                                      <strong>解析：</strong>{question.explanation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-8 flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                        <div>
                          {quizSubmitted && (
                            <div className="space-y-1">
                              <div className="font-medium text-lg">
                                得分: <span className={`${quizScore >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                                  {quizScore}%
                                </span>
                              </div>
                              <div className={`text-sm ${quizScore >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                                {quizScore >= 60 ? '🎉 恭喜通过！' : '💪 继续努力！'}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-x-3">
                          {quizSubmitted && (
                            <Button variant="outline" onClick={resetQuiz}>
                              重新答题
                            </Button>
                          )}
                          <Button
                            onClick={submitQuiz}
                            disabled={quizSubmitted || Object.keys(quizAnswers).length === 0}
                            size="lg"
                          >
                            {quizSubmitted ? '已提交' : '提交答案'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* 底部导航 - 固定在底部 */}
          <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4 flex-shrink-0">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <Button
                variant="outline"
                onClick={() => navigation.previous && navigateToLesson(navigation.previous.id)}
                disabled={!navigation.previous}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">上一节</span>
                <span className="sm:hidden">上一节</span>
              </Button>
              
              <div className="text-center px-4">
                <p className="text-sm text-muted-foreground">
                  第 {getCurrentLessonIndex() + 1} 节 / 共 {getAllLessons().length} 节
                </p>
                <div className="w-32 bg-muted rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((getCurrentLessonIndex() + 1) / getAllLessons().length) * 100}%` }}
                  />
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => navigation.next && navigateToLesson(navigation.next.id)}
                disabled={!navigation.next}
                className="flex items-center space-x-2"
              >
                <span className="hidden sm:inline">下一节</span>
                <span className="sm:hidden">下一节</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 遮罩层 - 移动端侧边栏打开时 */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default LessonLearning;