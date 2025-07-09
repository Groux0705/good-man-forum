import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Eye, Heart, MessageSquare, Clock, User, ArrowLeft, Share2, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Textarea';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface VideoComment {
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

interface VideoDetail {
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
    level: number;
  };
  comments: VideoComment[];
}

const VideoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVideo();
    }
  }, [id]);

  const fetchVideo = async () => {
    try {
      const response = await fetch(`/api/videos/${id}`);
      if (response.ok) {
        const data = await response.json();
        setVideo(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch video:', error);
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
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/videos/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVideo(prev => prev ? { ...prev, likes: data.data.likes } : null);
        toast.success('点赞成功');
      }
    } catch (error) {
      console.error('Failed to like video:', error);
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
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/videos/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: comment })
      });

      if (response.ok) {
        const data = await response.json();
        setVideo(prev => prev ? {
          ...prev,
          comments: [data.data, ...prev.comments]
        } : null);
        setComment('');
        toast.success('评论发表成功');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
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

  const getVideoEmbedUrl = (videoUrl: string, platform: string) => {
    if (platform === 'youtube' && videoUrl.includes('youtube.com')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (platform === 'bilibili' && videoUrl.includes('bilibili.com')) {
      const bvMatch = videoUrl.match(/BV[a-zA-Z0-9]+/);
      if (bvMatch) return `https://player.bilibili.com/player.html?bvid=${bvMatch[0]}`;
    }
    return videoUrl;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="aspect-video bg-muted rounded-lg"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">视频不存在</h2>
          <p className="text-muted-foreground mb-6">抱歉，找不到该视频</p>
          <Button asChild>
            <Link to="/videos">返回视频列表</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/videos" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>返回视频列表</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：视频播放器和信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 视频播放器 */}
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={getVideoEmbedUrl(video.videoUrl, video.platform)}
                title={video.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>

            {/* 视频信息 */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{video.title}</h1>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{formatViews(video.views)} 次观看</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                    {video.duration && (
                      <div className="flex items-center space-x-1">
                        <Play className="h-4 w-4" />
                        <span>{formatDuration(video.duration)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      className="flex items-center space-x-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{video.likes}</span>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* 描述 */}
              {video.description && (
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {video.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* 标签 */}
              {video.tags && (
                <div className="flex flex-wrap gap-2">
                  {video.tags.split(',').map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 评论区 */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5" />
                  <span>评论 ({video.comments.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 发表评论 */}
                {user ? (
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="发表你的看法..."
                      rows={3}
                      className="glass-input"
                    />
                    <Button
                      type="submit"
                      disabled={submittingComment || !comment.trim()}
                      className="glass-button"
                    >
                      {submittingComment ? '发表中...' : '发表评论'}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-6 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground mb-4">登录后可发表评论</p>
                    <Button asChild>
                      <Link to="/login">立即登录</Link>
                    </Button>
                  </div>
                )}

                {/* 评论列表 */}
                <div className="space-y-4">
                  {video.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                        {comment.user.avatar ? (
                          <img src={comment.user.avatar} alt={comment.user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-foreground">{comment.user.username}</span>
                          <Badge variant="outline" className="text-xs">
                            Lv.{comment.user.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-foreground leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：创作者信息和相关视频 */}
          <div className="space-y-6">
            {/* 创作者信息 */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-muted overflow-hidden">
                    {video.user.avatar ? (
                      <img src={video.user.avatar} alt={video.user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{video.user.username}</h3>
                    <Badge variant="outline">Lv.{video.user.level}</Badge>
                  </div>
                </div>
                <Button className="w-full">关注</Button>
              </CardContent>
            </Card>

            {/* 视频分类 */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">视频分类</h3>
                <Badge className="w-full justify-center py-2">
                  {video.category === 'relationship' ? '恋爱关系' :
                   video.category === 'communication' ? '沟通技巧' :
                   video.category === 'self-improvement' ? '自我提升' :
                   video.category === 'dating' ? '约会技巧' :
                   video.category === 'psychology' ? '心理学' : video.category}
                </Badge>
              </CardContent>
            </Card>

            {/* 平台信息 */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">视频来源</h3>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">平台</span>
                  <Badge variant="secondary">
                    {video.platform === 'youtube' ? 'YouTube' : 
                     video.platform === 'bilibili' ? 'Bilibili' : 
                     '本地'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;