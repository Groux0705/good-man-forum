import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Play, Eye, Heart, MessageSquare, Filter, Clock, User, Search, Grid, List, Star, Calendar, TrendingUp, BookOpen, Video } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

interface Course {
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
  };
  _count: {
    comments: number;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const categories = [
    { id: 'all', name: '全部', color: 'bg-muted-foreground', icon: Grid },
    { id: 'relationship', name: '恋爱关系', color: 'bg-pink-500', icon: Heart },
    { id: 'communication', name: '沟通技巧', color: 'bg-blue-500', icon: MessageSquare },
    { id: 'self-improvement', name: '自我提升', color: 'bg-green-500', icon: TrendingUp },
    { id: 'dating', name: '约会技巧', color: 'bg-purple-500', icon: Star },
    { id: 'psychology', name: '心理学', color: 'bg-orange-500', icon: User }
  ];

  const typeOptions = [
    { id: 'all', name: '全部类型', icon: Grid },
    { id: 'video', name: '视频课程', icon: Video },
    { id: 'text', name: '文字课程', icon: BookOpen }
  ];

  const sortOptions = [
    { id: 'latest', name: '最新发布', icon: Calendar },
    { id: 'popular', name: '最受欢迎', icon: TrendingUp },
    { id: 'views', name: '播放量', icon: Eye },
    { id: 'likes', name: '点赞数', icon: Heart }
  ];

  const fetchCourses = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(category !== 'all' && { category }),
        ...(type !== 'all' && { type }),
        ...(sortBy && { sort: sortBy }),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`/api/courses?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.data.courses);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(1);
  }, [category, type, sortBy, searchTerm]);

  const handleCategoryChange = (newCategory: string) => {
    setSearchParams(newCategory === 'all' ? { 
      ...(type !== 'all' && { type }),
      ...(sortBy !== 'latest' && { sort: sortBy }) 
    } : { 
      category: newCategory,
      ...(type !== 'all' && { type }),
      ...(sortBy !== 'latest' && { sort: sortBy }) 
    });
  };

  const handleTypeChange = (newType: string) => {
    setSearchParams({
      ...(category !== 'all' && { category }),
      ...(newType !== 'all' && { type: newType }),
      ...(sortBy !== 'latest' && { sort: sortBy })
    });
  };

  const handleSortChange = (newSort: string) => {
    setSearchParams({
      ...(category !== 'all' && { category }),
      ...(type !== 'all' && { type }),
      ...(newSort !== 'latest' && { sort: newSort })
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses(1);
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

  const getCourseThumbnail = (course: Course) => {
    if (course.thumbnail) return course.thumbnail;
    
    // 为不同类型生成默认缩略图
    if (course.type === 'video' && course.videoUrl && course.videoUrl.includes('youtube.com')) {
      const videoId = course.videoUrl.split('v=')[1]?.split('&')[0];
      if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    
    // 默认缩略图
    if (course.type === 'video') {
      return 'https://via.placeholder.com/320x180?text=Video+Course';
    } else {
      return 'https://via.placeholder.com/320x180?text=Text+Course';
    }
  };

  const getCourseTypeIcon = (course: Course) => {
    return course.type === 'video' ? Play : BookOpen;
  };

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="flex space-x-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded w-20"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-lg mb-3"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题和搜索 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-4xl font-bold text-foreground mb-3">课程中心</h1>
            <p className="text-lg text-muted-foreground">
              专业的男性情感成长课程内容，涵盖视频和文字多种形式，助你提升魅力和沟通技巧
            </p>
            <div className="flex items-center space-x-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                {pagination.total || 0} 个课程
              </span>
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                累计学习 {courses.reduce((acc, c) => acc + c.views, 0).toLocaleString()}
              </span>
            </div>
          </div>
          
          {/* 搜索和视图切换 */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="搜索课程..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-background border-border"
                />
              </div>
              <Button type="submit" variant="outline" size="sm" className="ml-2">
                搜索
              </Button>
            </form>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 筛选和排序 */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            {/* 分类筛选 */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-2 py-2">分类:</span>
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <Button
                    key={cat.id}
                    variant={category === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange(cat.id)}
                    className="flex items-center space-x-2"
                  >
                    <IconComponent className="h-3 w-3" />
                    <span>{cat.name}</span>
                  </Button>
                );
              })}
            </div>
            
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
                      className="flex items-center space-x-1"
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
                      className="flex items-center space-x-1"
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

        {/* 课程网格/列表 */}
        {courses.length > 0 ? (
          <>
            <div className={`${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
            } mb-8`}>
              {courses.map((course) => {
                const TypeIcon = getCourseTypeIcon(course);
                return (
                  <Link key={course.id} to={`/course/${course.id}`}>
                    {viewMode === 'grid' ? (
                      <Card className="glass-card group cursor-pointer hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-0">
                          {/* 课程缩略图 */}
                          <div className="relative aspect-video rounded-t-lg overflow-hidden">
                            <img
                              src={getCourseThumbnail(course)}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                  <TypeIcon className="h-5 w-5 text-gray-900 ml-1" />
                                </div>
                              </div>
                            </div>
                            
                            {/* 时长标签 */}
                            {course.duration && (
                              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                {formatDuration(course.duration)}
                              </div>
                            )}
                            
                            {/* 课程类型标签 */}
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="text-xs">
                                {course.type === 'video' 
                                  ? (course.platform === 'youtube' ? 'YouTube' : 
                                     course.platform === 'bilibili' ? 'Bilibili' : 
                                     '视频课程')
                                  : '文字课程'}
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
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* 标签 */}
                            {course.tags && (
                              <div className="flex flex-wrap gap-1">
                                {course.tags.split(',').slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
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
                      <Card className="glass-card group cursor-pointer hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex space-x-4">
                            {/* 缩略图 */}
                            <div className="relative w-48 h-28 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={getCourseThumbnail(course)}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                    <TypeIcon className="h-4 w-4 text-gray-900 ml-1" />
                                  </div>
                                </div>
                              </div>
                              
                              {/* 时长标签 */}
                              {course.duration && (
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                  {formatDuration(course.duration)}
                                </div>
                              )}
                              
                              {/* 课程类型标签 */}
                              <div className="absolute top-2 left-2">
                                <Badge variant="secondary" className="text-xs">
                                  {course.type === 'video' 
                                    ? (course.platform === 'youtube' ? 'YouTube' : 
                                       course.platform === 'bilibili' ? 'Bilibili' : 
                                       '视频课程')
                                    : '文字课程'}
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
                                  {course.tags.split(',').slice(0, 4).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
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
                  </Link>
                );
              })}
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
                      onClick={() => fetchCourses(i + 1)}
                      className="min-w-[40px]"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">暂无课程内容</h3>
            <p className="text-muted-foreground">
              {category === 'all' && type === 'all' ? '还没有任何课程内容' : 
               type === 'video' ? '该筛选条件下暂无视频课程' :
               type === 'text' ? '该筛选条件下暂无文字课程' :
               '该分类下暂无课程内容'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;