import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Eye, Clock } from 'lucide-react';
import { Topic } from '../types';
import { formatRelativeTime } from '../utils/format';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';

interface TopicListProps {
  topics: Topic[];
}

const TopicList: React.FC<TopicListProps> = ({ topics }) => {
  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <Card key={topic.id} hover className="animate-fade-in theme-card">
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar
                src={topic.user?.avatar}
                alt={topic.user?.username}
                fallback={topic.user?.username?.charAt(0).toUpperCase()}
                size="lg"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {topic.node?.title}
                  </Badge>
                  <span className="text-sm theme-text-secondary">•</span>
                  <span className="text-sm font-medium theme-text">
                    {topic.user?.username}
                  </span>
                  <span className="text-sm theme-text-secondary">•</span>
                  <div className="flex items-center space-x-1 text-sm theme-text-secondary">
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeTime(topic.createdAt)}</span>
                  </div>
                </div>
                
                <Link
                  to={`/topic/${topic.id}`}
                  className="block group"
                >
                  <h3 className="text-lg font-semibold theme-text group-hover:text-primary transition-colors duration-200 mb-2 text-balance">
                    {topic.title}
                  </h3>
                </Link>
                
                <div className="flex items-center space-x-6 text-sm theme-text-secondary">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{topic.clicks}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{topic.replies}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>最后回复 {formatRelativeTime(topic.lastReply)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TopicList;