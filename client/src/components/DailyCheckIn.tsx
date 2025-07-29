import React, { useState } from 'react';
import { Calendar, Gift } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import toast from 'react-hot-toast';
import { showPointReward } from './ui/PointToast';
import { useAuth } from '../contexts/AuthContext';

interface DailyCheckInProps {
  onCheckInSuccess?: (data: { points: number; experience: number; consecutiveDays: number }) => void;
}

const DailyCheckIn: React.FC<DailyCheckInProps> = ({ onCheckInSuccess }) => {
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const handleCheckIn = async () => {
    if (isLoading || hasCheckedIn) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/points/checkin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setHasCheckedIn(true);
        
        // 刷新用户信息
        await refreshUser();
        
        // 显示积分奖励
        const points = result.data?.points || 5;
        const experience = result.data?.experience || 5;
        const consecutiveDays = result.data?.consecutiveDays || 1;
        
        showPointReward({
          points,
          experience,
          reason: `连续签到${consecutiveDays}天`
        });
        
        toast.success(result.message);
        onCheckInSuccess?.(result.data);
      } else {
        if (result.message.includes('已经签到')) {
          setHasCheckedIn(true);
        }
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Check in error:', error);
      toast.error('签到失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 检查今天是否已签到（简单实现，可以从API获取更准确的状态）
  React.useEffect(() => {
    const checkTodayStatus = () => {
      const lastCheckIn = localStorage.getItem('lastCheckIn');
      const today = new Date().toDateString();
      if (lastCheckIn === today) {
        setHasCheckedIn(true);
      }
    };
    checkTodayStatus();
  }, []);

  // 签到成功后记录本地状态
  React.useEffect(() => {
    if (hasCheckedIn) {
      localStorage.setItem('lastCheckIn', new Date().toDateString());
    }
  }, [hasCheckedIn]);

  return (
    <Card className="card-glass hover-lift transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">每日签到</h3>
              <p className="text-sm text-muted-foreground">
                签到获得积分和经验值奖励
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleCheckIn}
            disabled={isLoading || hasCheckedIn}
            className={`min-w-[80px] ${hasCheckedIn ? 'bg-green-500 hover:bg-green-600' : ''}`}
            size="sm"
          >
            {isLoading ? (
              <div className="loading-spinner" />
            ) : hasCheckedIn ? (
              <>
                <Gift className="h-4 w-4 mr-1" />
                已签到
              </>
            ) : (
              '签到'
            )}
          </Button>
        </div>
        
        {hasCheckedIn && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-green-600 flex items-center">
              <Gift className="h-3 w-3 mr-1" />
              今日签到完成，明天再来吧！
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyCheckIn;