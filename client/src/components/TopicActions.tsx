import React, { useState, useEffect } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { Button } from './ui/Button';
import { topicInteractionService } from '../services/topicInteractions';
import { useAuth } from '../contexts/AuthContext';

interface TopicActionsProps {
  topicId: string;
  initialLikes?: number;
  initialFavorites?: number;
  className?: string;
}

export const TopicActions: React.FC<TopicActionsProps> = ({
  topicId,
  initialLikes = 0,
  initialFavorites = 0,
  className = ''
}) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [isLoading, setIsLoading] = useState(false);

  // 获取用户的互动状态
  useEffect(() => {
    if (user && topicId) {
      fetchInteractions();
    }
  }, [user, topicId]);

  const fetchInteractions = async () => {
    try {
      const data = await topicInteractionService.getTopicInteractions(topicId);
      setLiked(data.liked);
      setFavorited(data.favorited);
      setLikes(data.likes);
      setFavorites(data.favorites);
    } catch (error) {
      console.error('Failed to fetch topic interactions:', error);
    }
  };

  const handleLike = async () => {
    if (!user || isLoading) return;
    
    try {
      setIsLoading(true);
      const result = await topicInteractionService.likeTopic(topicId);
      
      setLiked(result.liked || false);
      setLikes(result.likes);

      console.log(`主题${result.action === 'liked' ? '点赞' : '取消点赞'}成功`);
    } catch (error) {
      console.error('点赞操作失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user || isLoading) return;
    
    try {
      setIsLoading(true);
      const result = await topicInteractionService.favoriteTopic(topicId);
      
      setFavorited(result.favorited || false);
      setFavorites(result.favorites || 0);

      console.log(`主题${result.action === 'favorited' ? '收藏' : '取消收藏'}成功`);
    } catch (error) {
      console.error('收藏操作失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // 未登录用户不显示操作按钮
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* 点赞按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center space-x-2 transition-colors ${
          liked 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-500 hover:text-red-500'
        }`}
      >
        <Heart 
          className={`h-4 w-4 transition-transform hover:scale-110 ${
            liked ? 'fill-current' : ''
          }`}
        />
        <span className="text-sm">{likes}</span>
      </Button>

      {/* 收藏按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFavorite}
        disabled={isLoading}
        className={`flex items-center space-x-2 transition-colors ${
          favorited 
            ? 'text-blue-500 hover:text-blue-600' 
            : 'text-gray-500 hover:text-blue-500'
        }`}
      >
        <Bookmark 
          className={`h-4 w-4 transition-transform hover:scale-110 ${
            favorited ? 'fill-current' : ''
          }`}
        />
        <span className="text-sm">{favorites}</span>
      </Button>
    </div>
  );
};