import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Calendar,
  User,
  Eye,
  Download,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface AdminLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: any;
  createdAt: string;
  admin: {
    id: string;
    username: string;
    avatar: string | null;
    role: string;
  };
}

interface LogStats {
  overview: {
    total: number;
    recent: number;
  };
  logsByAction: Array<{
    action: string;
    count: number;
  }>;
  logsByResource: Array<{
    resource: string;
    count: number;
  }>;
  logsByAdmin: Array<{
    admin: {
      id: string;
      username: string;
      avatar: string | null;
      role: string;
    };
    count: number;
  }>;
  dailyActivity: Array<{
    date: string;
    count: number;
  }>;
  period: string;
}

interface LogListResponse {
  logs: AdminLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const LogsManagement: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [adminFilter, setAdminFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showStats, setShowStats] = useState(false);
  const [admins, setAdmins] = useState<Array<{ id: string; username: string }>>([]);

  useEffect(() => {
    fetchLogs();
    fetchAdmins();
  }, [currentPage, actionFilter, resourceFilter, adminFilter, searchTerm]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(actionFilter !== 'all' && { action: actionFilter }),
        ...(resourceFilter !== 'all' && { resource: resourceFilter }),
        ...(adminFilter !== 'all' && { adminId: adminFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result: { data: LogListResponse } = await response.json();
        setLogs(result.data.logs);
        setTotalPages(result.data.pagination.pages);
      }
    } catch (error) {
      console.error('获取操作日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users?role=admin,moderator&limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAdmins(result.data.users.map((user: any) => ({
          id: user.id,
          username: user.username
        })));
      }
    } catch (error) {
      console.error('获取管理员列表失败:', error);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/logs/stats?period=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleShowStats = () => {
    setShowStats(true);
    if (!stats) {
      fetchStats();
    }
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

  const getResourceBadge = (resource: string) => {
    const resourceMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'topic': { label: '主题', variant: 'outline' },
      'user': { label: '用户', variant: 'outline' },
      'node': { label: '节点', variant: 'outline' },
      'report': { label: '举报', variant: 'outline' },
      'reply': { label: '回复', variant: 'outline' },
    };

    const config = resourceMap[resource] || { label: resource, variant: 'outline' as const };
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const exportLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...(actionFilter !== 'all' && { action: actionFilter }),
        ...(resourceFilter !== 'all' && { resource: resourceFilter }),
        ...(adminFilter !== 'all' && { adminId: adminFilter }),
        ...(searchTerm && { search: searchTerm }),
        format: 'csv'
      });

      const response = await fetch(`/api/admin/logs/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `admin-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('导出日志失败:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">操作日志</h1>
          <p className="text-gray-600 dark:text-gray-400">查看管理员操作记录</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleShowStats}>
            <BarChart3 className="h-4 w-4 mr-2" />
            统计分析
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            导出日志
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="搜索操作内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">所有操作</option>
                <option value="CREATE_TOPIC">创建主题</option>
                <option value="UPDATE_TOPIC_STATUS">更新主题</option>
                <option value="DELETE_TOPIC">删除主题</option>
                <option value="UPDATE_USER_STATUS">更新用户</option>
                <option value="UPDATE_USER_ROLE">更新角色</option>
                <option value="HANDLE_REPORT">处理举报</option>
              </select>

              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">所有资源</option>
                <option value="topic">主题</option>
                <option value="user">用户</option>
                <option value="node">节点</option>
                <option value="report">举报</option>
              </select>

              <select
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">所有管理员</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>{admin.username}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计面板 */}
      {showStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                统计分析
              </span>
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  fetchStats();
                }}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="7d">最近7天</option>
                <option value="30d">最近30天</option>
                <option value="90d">最近90天</option>
              </select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2 text-gray-600 dark:text-gray-400">加载统计数据...</span>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.overview.total}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">总操作数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.overview.recent}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    最近{dateRange === '7d' ? '7天' : dateRange === '30d' ? '30天' : '90天'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.logsByAction.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">操作类型</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.logsByAdmin.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">活跃管理员</div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* 日志列表 */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
            </CardContent>
          </Card>
        ) : logs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">没有找到操作日志</p>
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getActionBadge(log.action)}
                      {getResourceBadge(log.resource)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        #{log.id.slice(-8)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.admin.username}
                        </span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {log.admin.role === 'admin' ? '管理员' : '版主'}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {log.details && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 mb-3">
                        <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}

                    {log.resourceId && (
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        资源ID: {log.resourceId}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        // 这里可以实现查看详情功能
                        console.log('查看详情:', log);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            上一页
          </Button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            第 {currentPage} 页，共 {totalPages} 页
          </span>
          
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
};

export default LogsManagement;