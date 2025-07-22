import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../services/notifications';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { NotificationPanel } from './NotificationPanel';
import { useAuth } from '../contexts/AuthContext';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      setIsLoading(true);
      console.log('🔔 Bell: Current user:', user);
      console.log('🔔 Bell: Token in localStorage:', localStorage.getItem('token'));
      const count = await notificationService.getUnreadCount();
      console.log('🔔 Bell: Fetched unread count:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('🔔 Bell: Failed to fetch unread count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('🔔 Bell: User logged in, fetching notifications...');
      fetchUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => clearInterval(interval);
    } else {
      console.log('🔔 Bell: No user logged in');
    }
  }, [user]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationRead = () => {
    // Refresh unread count when notifications are marked as read
    fetchUnreadCount();
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="relative touch-manipulation"
        onClick={handleToggle}
        disabled={isLoading}
      >
        <Bell className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onNotificationRead={handleNotificationRead}
      />
    </div>
  );
};