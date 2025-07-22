import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Trash2, ExternalLink, Clock, MessageSquare, Heart, BookOpen, UserPlus } from 'lucide-react';
import { notificationService, Notification } from '../services/notifications';
import { Button } from './ui/Button';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationRead?: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  isOpen, 
  onClose, 
  onNotificationRead 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      console.log('📋 Fetching notifications panel data...');
      const result = await notificationService.getNotifications(pageNum, 10);
      console.log('📋 Service result:', result);
      console.log('📋 Notifications:', result.notifications);
      console.log('📋 Pagination:', result.pagination);
      
      const newNotifications = result.notifications || [];
      
      if (reset) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
      
      if (result.pagination) {
        setHasMore(result.pagination.page < result.pagination.pages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('📋 Failed to fetch notifications:', error);
      console.error('📋 Error details:', error.response || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications(1, true);
      setPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      onNotificationRead?.();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      onNotificationRead?.();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      onNotificationRead?.();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    onClose();
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'topic_reply':
      case 'comment_reply':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'topic_vote':
      case 'comment_vote':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'course_comment':
      case 'course_enrollment':
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'mention':
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:absolute lg:inset-auto lg:top-full lg:right-0 lg:w-96">
      <div className="absolute inset-0 bg-black/20 lg:hidden" onClick={onClose} />
      <Card 
        ref={panelRef}
        className="absolute inset-x-4 top-4 bottom-4 lg:relative lg:inset-auto lg:mt-2 lg:shadow-lg lg:border bg-white"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">通知</h3>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.read) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                全部已读
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)] lg:h-96">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>暂无通知</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <Badge variant="secondary" className="ml-2 h-2 w-2 rounded-full p-0" />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {notification.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(notification.createdAt), { 
                                addSuffix: true, 
                                locale: zhCN 
                              })}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              {notification.actionUrl && (
                                <ExternalLink className="h-3 w-3 text-gray-400" />
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notification.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {hasMore && (
                  <div className="text-center py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadMore}
                      disabled={loading}
                      className="text-sm"
                    >
                      {loading ? '加载中...' : '加载更多'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};