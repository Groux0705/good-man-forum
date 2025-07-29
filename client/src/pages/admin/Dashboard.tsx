import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface SystemOverview {
  users: {
    total: number;
    active: number;
    newToday: number;
    newWeek: number;
    growthRate: number;
  };
  topics: {
    total: number;
    published: number;
    newToday: number;
    newWeek: number;
    growthRate: number;
  };
  replies: {
    total: number;
    newToday: number;
    newWeek: number;
    growthRate: number;
  };
  system: {
    nodes: number;
    reports: number;
    pendingReports: number;
  };
}

interface TopUser {
  id: string;
  username: string;
  avatar: string | null;
  topicCount: number;
  replyCount: number;
}

interface TopNode {
  id: string;
  name: string;
  title: string;
  topics: number;
}

interface RecentActivity {
  id: string;
  action: string;
  resource: string;
  details: string | null;
  admin: string;
  createdAt: string;
}

interface DashboardData {
  overview: SystemOverview;
  topActiveUsers: TopUser[];
  topNodes: TopNode[];
  recentActivities: RecentActivity[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    if (rate < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getGrowthColor = (rate: number): string => {
    if (rate > 0) return 'text-green-600 dark:text-green-400';
    if (rate < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'CREATE_TOPIC': { label: '创建主题', variant: 'default' },
      'UPDATE_TOPIC_STATUS': { label: '更新主题', variant: 'secondary' },
      'DELETE_TOPIC': { label: '删除主题', variant: 'destructive' },
      'UPDATE_USER_STATUS': { label: '更新用户', variant: 'secondary' },
      'UPDATE_USER_ROLE': { label: '更新角色', variant: 'outline' },
      'HANDLE_REPORT': { label: '处理举报', variant: 'default' },
      'CREATE_NODE': { label: '创建节点', variant: 'default' },
      'UPDATE_NODE': { label: '更新节点', variant: 'secondary' },
      'DELETE_NODE': { label: '删除节点', variant: 'destructive' },
    };

    const config = actionMap[action] || { label: action, variant: 'outline' as const };
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">加载数据失败</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">仪表板</h1>
        <p className="text-gray-600 dark:text-gray-400">系统概览和统计信息</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 用户统计 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总用户数</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(data.overview.users.total)}
                  </p>
                  <div className="ml-2 flex items-center">
                    {getGrowthIcon(data.overview.users.growthRate)}
                    <span className={`ml-1 text-sm ${getGrowthColor(data.overview.users.growthRate)}`}>
                      {data.overview.users.growthRate > 0 ? '+' : ''}{data.overview.users.growthRate}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  活跃用户: {formatNumber(data.overview.users.active)} | 
                  本周新增: {data.overview.users.newWeek}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主题统计 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总主题数</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(data.overview.topics.total)}
                  </p>
                  <div className="ml-2 flex items-center">
                    {getGrowthIcon(data.overview.topics.growthRate)}
                    <span className={`ml-1 text-sm ${getGrowthColor(data.overview.topics.growthRate)}`}>
                      {data.overview.topics.growthRate > 0 ? '+' : ''}{data.overview.topics.growthRate}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  已发布: {formatNumber(data.overview.topics.published)} | 
                  本周新增: {data.overview.topics.newWeek}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 回复统计 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总回复数</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(data.overview.replies.total)}
                  </p>
                  <div className="ml-2 flex items-center">
                    {getGrowthIcon(data.overview.replies.growthRate)}
                    <span className={`ml-1 text-sm ${getGrowthColor(data.overview.replies.growthRate)}`}>
                      {data.overview.replies.growthRate > 0 ? '+' : ''}{data.overview.replies.growthRate}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  本周新增: {data.overview.replies.newWeek}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 举报统计 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待处理举报</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.overview.system.pendingReports}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  总举报: {data.overview.system.reports} | 
                  节点数: {data.overview.system.nodes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 活跃用户 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              活跃用户 TOP 5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topActiveUsers.map((user, index) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      主题: {user.topicCount} | 回复: {user.replyCount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 热门节点 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              热门节点 TOP 5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topNodes.map((node, index) => (
                <div key={node.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {node.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {node.topics} 个主题
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近活动 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            最近管理操作
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getActionBadge(activity.action)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.admin}</span> 
                      执行了 {getActionBadge(activity.action)} 操作
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;