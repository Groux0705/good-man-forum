import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Target, Calendar, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Progress } from './ui/Progress';
import { Badge } from './ui/Badge';
import LoadingSpinner from './ui/LoadingSpinner';

interface DailyTask {
  id: string;
  task: {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    target: number;
    type: string;
    points: number;
    experience: number;
  };
  progress: number;
  completed: boolean;
  progressPercent: number;
}

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  remainingTasks: number;
}

interface DailyTaskPanelProps {
  compact?: boolean;
  showStats?: boolean;
}

const DailyTaskPanel: React.FC<DailyTaskPanelProps> = ({ 
  compact = false, 
  showStats = true 
}) => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyTasks();
  }, []);

  const fetchDailyTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/daily-tasks/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setTasks(result.data.tasks || []);
        setStats(result.data.stats || null);
      }
    } catch (error) {
      console.error('获取每日任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'social': return 'text-blue-500 bg-blue-100 dark:bg-blue-900';
      case 'learning': return 'text-green-500 bg-green-100 dark:bg-green-900';
      case 'activity': return 'text-purple-500 bg-purple-100 dark:bg-purple-900';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getProgressColor = (percent: number, completed: boolean): string => {
    if (completed) return 'bg-green-500';
    if (percent >= 80) return 'bg-yellow-500';
    if (percent >= 50) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2 text-muted-foreground">加载任务中...</span>
      </div>
    );
  }

  if (compact) {
    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    
    return (
      <Card className="card-glass hover-lift transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">每日任务</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount}/{totalCount} 已完成
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {Math.round((completedCount / totalCount) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">完成率</div>
            </div>
          </div>
          
          <div className="mt-3">
            <Progress 
              value={(completedCount / totalCount) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>今日任务</span>
          </div>
          {showStats && stats && (
            <Badge variant="outline" className="text-sm">
              {stats.completedTasks}/{stats.totalTasks}
            </Badge>
          )}
        </CardTitle>
        {showStats && stats && (
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{stats.completionRate}%</div>
              <div className="text-xs text-muted-foreground">完成率</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">{stats.completedTasks}</div>
              <div className="text-xs text-muted-foreground">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-500">{stats.remainingTasks}</div>
              <div className="text-xs text-muted-foreground">剩余</div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                task.completed 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-background border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{task.task.icon}</span>
                    <h3 className={`font-medium ${task.completed ? 'text-green-700 dark:text-green-300' : 'text-foreground'}`}>
                      {task.task.title}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCategoryColor(task.task.category)}`}
                    >
                      {task.task.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {task.task.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          {task.progress}/{task.task.target}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {task.progressPercent}%
                        </span>
                      </div>
                      <Progress 
                        value={task.progressPercent} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Gift className="h-3 w-3" />
                        <span>+{task.task.points}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>⚡</span>
                        <span>+{task.task.experience}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>今日暂无任务</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyTaskPanel;