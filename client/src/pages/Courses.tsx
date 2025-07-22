import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Play, Eye, Heart, MessageSquare, Filter, Clock, User, Search, Grid, List, Star, Calendar, TrendingUp, BookOpen, Video } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { CourseCardSkeleton } from '../components/ui/Skeleton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageTransition from '../components/ui/PageTransition';

interface Course {
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
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
  _count: {
    comments: number;
    chapters: number;
    enrollmentList: number;
  };
}

interface CoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const Courses: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const sortBy = searchParams.get('sort') || 'latest';
  const type = searchParams.get('type') || 'all';
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const categories = useMemo(() => [
    { id: 'all', name: '全部', color: 'bg-muted-foreground', icon: Grid },
    { id: 'relationship', name: '恋爱关系', color: 'bg-pink-500', icon: Heart },
    { id: 'communication', name: '沟通技巧', color: 'bg-blue-500', icon: MessageSquare },
    { id: 'self-improvement', name: '自我提升', color: 'bg-green-500', icon: TrendingUp },
    { id: 'dating', name: '约会技巧', color: 'bg-purple-500', icon: Star },
    { id: 'psychology', name: '心理学', color: 'bg-orange-500', icon: User }
  ], []);

  const typeOptions = useMemo(() => [
    { id: 'all', name: '全部类型', icon: Grid },
    { id: 'featured', name: '推荐课程', icon: Star },
    { id: 'enrolled', name: '已报名', icon: BookOpen }
  ], []);

  const sortOptions = useMemo(() => [
    { id: 'latest', name: '最新发布', icon: Calendar },
    { id: 'popular', name: '最受欢迎', icon: TrendingUp },
    { id: 'views', name: '播放量', icon: Eye },
    { id: 'likes', name: '点赞数', icon: Heart }
  ], []);

  const fetchCourses = useCallback(async (page = 1, showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsFiltering(true);
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(category !== 'all' && { category }),
        ...(sortBy && { sort: sortBy }),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`/api/courses?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // 平滑过渡：先设置数据，再移除加载状态
        setCourses(data.data.courses || []);
        setPagination(data.data.pagination);
        
        // 使用 setTimeout 确保数据渲染完成后再移除加载状态
        setTimeout(() => {
          setLoading(false);
          setIsFiltering(false);
        }, 100);
      } else {
        setCourses([]);
        setPagination({ page: 1, limit: 12, total: 0, pages: 0 });
        setLoading(false);
        setIsFiltering(false);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
      setPagination({ page: 1, limit: 12, total: 0, pages: 0 });
      setLoading(false);
      setIsFiltering(false);
    }
  }, [category, sortBy, searchTerm]);

  useEffect(() => {
    fetchCourses(1, true);
  }, [fetchCourses]);

  const handleCategoryChange = useCallback((newCategory: string) => {
    setSearchParams(newCategory === 'all' ? { 
      ...(type !== 'all' && { type }),
      ...(sortBy !== 'latest' && { sort: sortBy }) 
    } : { 
      category: newCategory,
      ...(type !== 'all' && { type }),
      ...(sortBy !== 'latest' && { sort: sortBy }) 
    });
  }, [type, sortBy, setSearchParams]);

  const handleTypeChange = useCallback((newType: string) => {
    setSearchParams({
      ...(category !== 'all' && { category }),
      ...(newType !== 'all' && { type: newType }),
      ...(sortBy !== 'latest' && { sort: sortBy })
    });
  }, [category, sortBy, setSearchParams]);

  const handleSortChange = useCallback((newSort: string) => {
    setSearchParams({
      ...(category !== 'all' && { category }),
      ...(type !== 'all' && { type }),
      ...(newSort !== 'latest' && { sort: newSort })
    });
  }, [category, type, setSearchParams]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses(1, false);
  }, [fetchCourses]);

  const formatViews = useCallback((views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  }, []);

  const getCourseThumbnail = useCallback((course: Course) => {
    if (course.thumbnail) return course.thumbnail;
    return 'https://via.placeholder.com/320x180?text=Course';
  }, []);

  const getDifficultyBadgeColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }, []);

  const memoizedCourses = useMemo(() => courses, [courses]);

  // 初始加载时的骨架屏
  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* 页面标题骨架 */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
              <div className="mb-6 lg:mb-0">
                <div className="h-10 bg-muted rounded w-48 mb-3 skeleton"></div>
                <div className="h-5 bg-muted rounded w-96 mb-4 skeleton"></div>
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-muted rounded w-16 skeleton"></div>
                  <div className="h-4 bg-muted rounded w-20 skeleton"></div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-10 bg-muted rounded w-64 skeleton"></div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-muted rounded skeleton"></div>
                  <div className="h-8 w-8 bg-muted rounded skeleton"></div>
                </div>
              </div>
            </div>

            {/* 筛选工具栏骨架 */}
            <div className="mb-8">
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="h-4 bg-muted rounded w-8 skeleton"></div>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-8 bg-muted rounded w-20 skeleton"></div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-muted rounded w-8 skeleton"></div>
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-8 bg-muted rounded w-24 skeleton"></div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-muted rounded w-8 skeleton"></div>
                  <div className="flex space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-8 bg-muted rounded w-20 skeleton"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 课程卡片骨架 - 移动端优化 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(12)].map((_, i) => (
                <CourseCardSkeleton key={i} viewMode="grid" />
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题和搜索 - 移动端优化 */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6 lg:mb-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">课程中心</h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-3 sm:mb-4">
                专业的男性情感成长课程内容，涵盖视频和文字多种形式，助你提升魅力和沟通技巧
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {pagination.total || 0} 个课程
                </span>
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  累计学习 {memoizedCourses.reduce((acc, c) => acc + c.views, 0).toLocaleString()}
                </span>
              </div>
            </div>
            
            {/* 搜索和视图切换 - 移动端优化 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="搜索课程..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-64 glass-input text-sm sm:text-base"
                  />
                </div>
                <Button type="submit" variant="outline" size="sm" className="ml-2 button-glass touch-manipulation">
                  搜索
                </Button>
              </form>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="button-glass transition-all duration-200"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="button-glass transition-all duration-200"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

        {/* 筛选和排序 */}
        <div className="mb-8">
          {/* 分类筛选 - 单独一行 */}
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-2">分类:</span>
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <Button
                    key={cat.id}
                    variant={category === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange(cat.id)}
                    className="flex items-center space-x-2 button-glass transition-all duration-200 hover:scale-105"
                    disabled={isFiltering}
                  >
                    <IconComponent className="h-3 w-3" />
                    <span>{cat.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* 类型和排序 - 同一行 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* 类型筛选 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">类型:</span>
              <div className="flex space-x-1">
                {typeOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <Button
                      key={option.id}
                      variant={type === option.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTypeChange(option.id)}
                      className="flex items-center space-x-1 button-glass transition-all duration-200 hover:scale-105"
                      disabled={isFiltering}
                    >
                      <IconComponent className="h-3 w-3" />
                      <span>{option.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* 排序选项 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">排序:</span>
              <div className="flex space-x-1">
                {sortOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <Button
                      key={option.id}
                      variant={sortBy === option.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSortChange(option.id)}
                      className="flex items-center space-x-1 button-glass transition-all duration-200 hover:scale-105"
                      disabled={isFiltering}
                    >
                      <IconComponent className="h-3 w-3" />
                      <span>{option.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 过滤状态指示器 */}
        {isFiltering && (
          <div className="mb-4 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <LoadingSpinner />
              <span>正在筛选课程...</span>
            </div>
          </div>
        )}

        {/* 课程网格/列表 */}
        <div className={`transition-opacity duration-300 ${isFiltering ? 'opacity-50' : 'opacity-100'}`}>
          {memoizedCourses.length > 0 ? (
            <div>
              <div className={`${viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
                : 'space-y-3 sm:space-y-4'
              } mb-6 sm:mb-8`}>
                {memoizedCourses.map((course, index) => (
                  <Link key={course.id} to={`/course/${course.id}`}>
                    <div className="stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
                      {viewMode === 'grid' ? (
                        <Card className="card-glass group cursor-pointer hover-lift transition-all duration-300 will-change-transform">
                        <CardContent className="p-0">
                          {/* 课程缩略图 */}
                          <div className="relative aspect-video rounded-t-lg overflow-hidden">
                            <img
                              src={getCourseThumbnail(course)}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                  <BookOpen className="h-5 w-5 text-gray-900 ml-1" />
                                </div>
                              </div>
                            </div>
                            
                            {/* 课程类型标签 */}
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="text-xs badge-glass">
                                课程
                              </Badge>
                            </div>
                            
                            {/* 难度标签 */}
                            <div className="absolute top-2 right-2">
                              <Badge className={`text-xs text-white ${getDifficultyBadgeColor(course.difficulty)}`}>
                                {course.difficulty === 'beginner' ? '初级' :
                                 course.difficulty === 'intermediate' ? '中级' : '高级'}
                              </Badge>
                            </div>
                          </div>

                          {/* 课程信息 */}
                          <div className="p-4">
                            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                              {course.title}
                            </h3>
                            
                            {/* 用户信息 */}
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
                                {course.user.avatar ? (
                                  <img src={course.user.avatar} alt={course.user.username} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                    <User className="h-3 w-3 text-primary" />
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">{course.user.username}</span>
                            </div>

                            {/* 统计信息 */}
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{formatViews(course.views)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{course.likes}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MessageSquare className="h-3 w-3" />
                                  <span>{course._count.comments}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <BookOpen className="h-3 w-3" />
                                  <span>{course._count.chapters || 0}章节</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* 标签 */}
                            {course.tags && (
                              <div className="flex flex-wrap gap-1">
                                {course.tags.split(',').slice(0, 3).map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs badge-glass">
                                    {tag.trim()}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      /* 列表视图 */
                      <Card className="card-glass group cursor-pointer hover-lift transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex space-x-4">
                            {/* 缩略图 */}
                            <div className="relative w-48 h-28 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={getCourseThumbnail(course)}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                    <BookOpen className="h-4 w-4 text-gray-900 ml-1" />
                                  </div>
                                </div>
                              </div>
                              
                              {/* 课程类型和难度标签 */}
                              <div className="absolute top-2 left-2">
                                <Badge variant="secondary" className="text-xs badge-glass">
                                  课程
                                </Badge>
                              </div>
                              <div className="absolute top-2 right-2">
                                <Badge className={`text-xs text-white ${getDifficultyBadgeColor(course.difficulty)}`}>
                                  {course.difficulty === 'beginner' ? '初级' :
                                   course.difficulty === 'intermediate' ? '中级' : '高级'}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* 课程信息 */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 text-lg">
                                {course.title}
                              </h3>
                              
                              {course.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {course.description}
                                </p>
                              )}
                              
                              {/* 用户和统计信息 */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
                                      {course.user.avatar ? (
                                        <img src={course.user.avatar} alt={course.user.username} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                          <User className="h-3 w-3 text-primary" />
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-sm text-muted-foreground">{course.user.username}</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Eye className="h-3 w-3" />
                                      <span>{formatViews(course.views)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Heart className="h-3 w-3" />
                                      <span>{course.likes}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <MessageSquare className="h-3 w-3" />
                                      <span>{course._count.comments}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              {/* 标签 */}
                              {course.tags && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {course.tags.split(',').slice(0, 4).map((tag, tagIndex) => (
                                    <Badge key={tagIndex} variant="outline" className="text-xs badge-glass">
                                      {tag.trim()}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* 分页 */}
              {pagination.pages > 1 && (
                <div className="flex justify-center">
                  <div className="flex items-center space-x-2">
                    {[...Array(pagination.pages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={pagination.page === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => fetchCourses(i + 1, false)}
                        className="min-w-[40px] button-glass transition-all duration-200 hover:scale-105"
                        disabled={isFiltering}
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
              <div className="card-glass rounded-lg p-8 max-w-md mx-auto">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">暂无课程内容</h3>
                <p className="text-muted-foreground">
                  {category === 'all' && type === 'all' ? '还没有任何课程内容' : 
                   type === 'video' ? '该筛选条件下暂无视频课程' :
                   type === 'text' ? '该筛选条件下暂无文字课程' :
                   '该分类下暂无课程内容'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </PageTransition>
  );
};

export default Courses;