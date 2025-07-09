import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Play, Eye, Heart, MessageSquare, Filter, Clock, User } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface Video {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string;
  videoUrl: string;
  platform: string;
  category: string;
  tags: string | null;
  duration: number | null;
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

interface VideosResponse {
  videos: Video[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const Videos: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const categories = [
    { id: 'all', name: '全部', color: 'bg-muted-foreground' },
    { id: 'relationship', name: '恋爱关系', color: 'bg-pink-500 dark:bg-pink-600' },
    { id: 'communication', name: '沟通技巧', color: 'bg-blue-500 dark:bg-blue-600' },
    { id: 'self-improvement', name: '自我提升', color: 'bg-green-500 dark:bg-green-600' },
    { id: 'dating', name: '约会技巧', color: 'bg-purple-500 dark:bg-purple-600' },
    { id: 'psychology', name: '心理学', color: 'bg-orange-500 dark:bg-orange-600' }
  ];

  const fetchVideos = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(category !== 'all' && { category })
      });
      
      const response = await fetch(`/api/videos?${params}`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data.data.videos);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(1);
  }, [category]);

  const handleCategoryChange = (newCategory: string) => {
    setSearchParams(newCategory === 'all' ? {} : { category: newCategory });
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

  const getVideoThumbnail = (video: Video) => {
    if (video.thumbnail) return video.thumbnail;
    
    // 为不同平台生成默认缩略图
    if (video.platform === 'youtube' && video.videoUrl.includes('youtube.com')) {
      const videoId = video.videoUrl.split('v=')[1]?.split('&')[0];
      if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    
    // 默认缩略图
    return 'https://via.placeholder.com/320x180?text=Video';
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
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">视频课程</h1>
            <p className="text-muted-foreground">
              专业的男性情感成长视频内容，助你提升魅力和沟通技巧
            </p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>筛选</span>
          </Button>
        </div>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(cat.id)}
              className="flex items-center space-x-2"
            >
              <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
              <span>{cat.name}</span>
            </Button>
          ))}
        </div>

        {/* 视频网格 */}
        {videos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {videos.map((video) => (
                <Link key={video.id} to={`/video/${video.id}`}>
                  <Card className="glass-card group cursor-pointer hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      {/* 视频缩略图 */}
                      <div className="relative aspect-video rounded-t-lg overflow-hidden">
                        <img
                          src={getVideoThumbnail(video)}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="h-5 w-5 text-gray-900 ml-1" />
                            </div>
                          </div>
                        </div>
                        
                        {/* 时长标签 */}
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(video.duration)}
                          </div>
                        )}
                        
                        {/* 平台标签 */}
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="text-xs">
                            {video.platform === 'youtube' ? 'YouTube' : 
                             video.platform === 'bilibili' ? 'Bilibili' : 
                             '本地'}
                          </Badge>
                        </div>
                      </div>

                      {/* 视频信息 */}
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors overflow-hidden h-12 leading-6">
                          {video.title}
                        </h3>
                        
                        {/* 用户信息 */}
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
                            {video.user.avatar ? (
                              <img src={video.user.avatar} alt={video.user.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                <User className="h-3 w-3 text-primary" />
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{video.user.username}</span>
                        </div>

                        {/* 统计信息 */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{formatViews(video.views)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3" />
                              <span>{video.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{video._count.comments}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* 标签 */}
                        {video.tags && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {video.tags.split(',').slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
                      onClick={() => fetchVideos(i + 1)}
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
            <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">暂无视频内容</h3>
            <p className="text-muted-foreground">
              {category === 'all' ? '还没有任何视频内容' : '该分类下暂无视频内容'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos;