import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  Ban,
  MessageSquare,
  AlertTriangle,
  Shield,
  CheckCircle,
  Undo2,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import BatchOperationStatus from '../../components/admin/BatchOperationStatus';
import PunishmentLogsModal from '../../components/admin/PunishmentLogsModal';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
  level: number;
  balance: number;
  trustScore: number;
  violationCount: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastActiveAt: string;
  registrationIp: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  topicCount: number;
  replyCount: number;
  reportCount: number;
  punishmentCount: number;
}

interface UserStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    mutedUsers: number;
    newUsersToday: number;
    newUsersWeek: number;
    newUsersMonth: number;
    avgTrustScore: number;
    highRiskUsers: number;
  };
  punishments: {
    total: number;
  };
  appeals: {
    total: number;
    pending: number;
  };
}

interface UserDetail {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
  trustScore: number;
  violationCount: number;
  createdAt: string;
  lastActiveAt: string;
  registrationIp: string | null;
  lastLoginIp: string | null;
  riskProfile: {
    riskScore: number;
    riskLevel: string;
    riskFactors: string[];
  };
  punishments: any[];
  appeals: any[];
  loginLogs: any[];
  topicCount: number;
  replyCount: number;
  reportCount: number;
  punishmentCount: number;
  appealCount: number;
  loginCount: number;
}

const UserManagement: React.FC = () => {
  // 状态管理
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // 过滤和搜索状态
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [trustScoreMin, setTrustScoreMin] = useState<number | undefined>();
  const [trustScoreMax, setTrustScoreMax] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // 操作状态
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserDetail | null>(null);
  const [showPunishModal, setShowPunishModal] = useState(false);
  const [showPunishmentLogs, setShowPunishmentLogs] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showBatchStatus, setShowBatchStatus] = useState(false);
  const [currentBatchOperationId, setCurrentBatchOperationId] = useState<string | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedPunishment, setSelectedPunishment] = useState<any>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [punishmentForm, setPunishmentForm] = useState({
    type: 'warning',
    reason: '',
    duration: '',
    severity: 1,
    evidence: ''
  });
  const [batchForm, setBatchForm] = useState({
    type: 'batch_ban',
    reason: '',
    duration: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter, roleFilter, trustScoreMin, trustScoreMax, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(trustScoreMin && { trustScoreMin: trustScoreMin.toString() }),
        ...(trustScoreMax && { trustScoreMax: trustScoreMax.toString() })
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(result.data.users);
        setTotalPages(result.data.pagination.pages);
        setTotal(result.data.pagination.total);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('获取用户统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSelectedUserDetail(result.data);
        setShowUserDetail(true);
      }
    } catch (error) {
      console.error('获取用户详情失败:', error);
    }
  };

  const handlePunishUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/punish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...punishmentForm,
          duration: punishmentForm.duration ? parseInt(punishmentForm.duration) : null
        })
      });

      if (response.ok) {
        alert('处罚执行成功');
        setShowPunishModal(false);
        setPunishmentForm({
          type: 'warning',
          reason: '',
          duration: '',
          severity: 1,
          evidence: ''
        });
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.message || '处罚失败');
      }
    } catch (error) {
      console.error('处罚用户失败:', error);
      alert('处罚失败');
    }
  };

  const handleRevokePunishment = async () => {
    if (!selectedPunishment) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/punishments/${selectedPunishment.id}/revoke`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: revokeReason
        })
      });

      if (response.ok) {
        alert('惩罚已撤销');
        setShowRevokeModal(false);
        setSelectedPunishment(null);
        setRevokeReason('');
        // 刷新用户详情
        if (selectedUserDetail) {
          fetchUserDetail(selectedUserDetail.id);
        }
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.message || '撤销失败');
      }
    } catch (error) {
      console.error('撤销惩罚失败:', error);
      alert('撤销失败');
    }
  };

  const handleBatchOperation = async () => {
    if (selectedUsers.length === 0) {
      alert('请选择要操作的用户');
      return;
    }

    const operationLabel = batchForm.type === 'batch_ban' ? '批量封禁' : '批量禁言';
    if (!confirm(`确定要对 ${selectedUsers.length} 个用户执行${operationLabel}操作吗？`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: batchForm.type,
          userIds: selectedUsers,
          params: {
            reason: batchForm.reason,
            duration: batchForm.duration ? parseInt(batchForm.duration) : null
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentBatchOperationId(result.data.operationId);
        setShowBatchModal(false);
        setShowBatchStatus(true);
        setSelectedUsers([]);
        setBatchForm({
          type: 'batch_ban',
          reason: '',
          duration: ''
        });
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.message || '批量操作失败');
      }
    } catch (error) {
      console.error('批量操作失败:', error);
      alert('批量操作失败');
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: '正常', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      banned: { label: '封禁', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      muted: { label: '禁言', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      suspended: { label: '暂停', variant: 'outline' as const, color: 'bg-orange-100 text-orange-800' },
      reviewing: { label: '审核中', variant: 'outline' as const, color: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const formatDaysAgo = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    return `${days}天前`;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和统计 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">用户管理</h1>
          <p className="text-gray-600 dark:text-gray-400">
            管理用户账号、处罚、申诉等功能
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            高级筛选
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowPunishmentLogs(true)}
          >
            <Shield className="h-4 w-4 mr-2" />
            惩罚日志
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总用户数</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.overview.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    活跃: {stats.overview.activeUsers} | 本周新增: {stats.overview.newUsersWeek}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Ban className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">封禁用户</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.overview.bannedUsers}
                  </p>
                  <p className="text-xs text-gray-500">
                    禁言: {stats.overview.mutedUsers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">高风险用户</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.overview.highRiskUsers}
                  </p>
                  <p className="text-xs text-gray-500">
                    平均信用分: {stats.overview.avgTrustScore}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待处理申诉</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.appeals.pending}
                  </p>
                  <p className="text-xs text-gray-500">
                    总申诉: {stats.appeals.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            {/* 基础搜索 */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索用户名、邮箱或真实姓名..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">所有状态</option>
                <option value="active">正常</option>
                <option value="banned">封禁</option>
                <option value="muted">禁言</option>
                <option value="suspended">暂停</option>
                <option value="reviewing">审核中</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">所有角色</option>
                <option value="user">普通用户</option>
                <option value="moderator">版主</option>
                <option value="admin">管理员</option>
              </select>
            </div>

            {/* 高级筛选 */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    信用分范围
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="最小"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={trustScoreMin || ''}
                      onChange={(e) => setTrustScoreMin(e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <input
                      type="number"
                      placeholder="最大"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={trustScoreMax || ''}
                      onChange={(e) => setTrustScoreMax(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    排序方式
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="createdAt">注册时间</option>
                    <option value="lastActiveAt">最后活跃</option>
                    <option value="trustScore">信用分</option>
                    <option value="violationCount">违规次数</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    排序方向
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">降序</option>
                    <option value="asc">升序</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 批量操作工具栏 */}
      {selectedUsers.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  已选择 {selectedUsers.length} 个用户
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUsers([])}
                >
                  取消选择
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBatchForm(prev => ({ ...prev, type: 'batch_ban' }));
                    setShowBatchModal(true);
                  }}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  批量封禁
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBatchForm(prev => ({ ...prev, type: 'batch_mute' }));
                    setShowBatchModal(true);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  批量禁言
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 用户列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">用户</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">状态</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">信用分</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">活跃度</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">违规次数</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">注册时间</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-gray-600 font-medium">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {user.username}
                            </span>
                            {user.role === 'admin' && (
                              <Shield className="h-4 w-4 text-red-500" />
                            )}
                            {user.role === 'moderator' && (
                              <Shield className="h-4 w-4 text-blue-500" />
                            )}
                            {user.emailVerified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                user.trustScore >= 80 ? 'bg-green-500' :
                                user.trustScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${user.trustScore}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium">{user.trustScore}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>主题: {user.topicCount}</div>
                        <div>回复: {user.replyCount}</div>
                        <div className="text-gray-500">
                          {formatDaysAgo(user.lastActiveAt)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <span className={`font-medium ${
                          user.violationCount > 5 ? 'text-red-600' :
                          user.violationCount > 2 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {user.violationCount}
                        </span>
                        {user.punishmentCount > 0 && (
                          <span className="text-xs text-gray-500">
                            ({user.punishmentCount}次处罚)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchUserDetail(user.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUserDetail({ id: user.id } as UserDetail);
                              setShowPunishModal(true);
                            }}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                显示 {((currentPage - 1) * 20) + 1} 到 {Math.min(currentPage * 20, total)} 条，共 {total} 条记录
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  上一页
                </Button>
                <span className="px-3 py-1 text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 用户详情模态框 */}
      {showUserDetail && selectedUserDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">用户详情</h2>
                <Button variant="outline" onClick={() => setShowUserDetail(false)}>
                  关闭
                </Button>
              </div>
              
              {/* 用户详情内容 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 基本信息 */}
                <Card>
                  <CardHeader>
                    <CardTitle>基本信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        {selectedUserDetail.avatar ? (
                          <img src={selectedUserDetail.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-gray-600">
                            {selectedUserDetail.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{selectedUserDetail.username}</h3>
                        <p className="text-gray-500">{selectedUserDetail.email}</p>
                        {getStatusBadge(selectedUserDetail.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">注册时间:</span>
                        <div>{formatDate(selectedUserDetail.createdAt)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">最后活跃:</span>
                        <div>{formatDate(selectedUserDetail.lastActiveAt)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">注册IP:</span>
                        <div>{selectedUserDetail.registrationIp || '未知'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">最后登录IP:</span>
                        <div>{selectedUserDetail.lastLoginIp || '未知'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 风险画像 */}
                {selectedUserDetail.riskProfile && (
                  <Card>
                    <CardHeader>
                      <CardTitle>风险画像</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>风险等级:</span>
                          <Badge variant={
                            selectedUserDetail.riskProfile.riskLevel === 'high' ? 'destructive' :
                            selectedUserDetail.riskProfile.riskLevel === 'medium' ? 'secondary' : 'default'
                          }>
                            {selectedUserDetail.riskProfile.riskLevel === 'high' ? '高风险' :
                             selectedUserDetail.riskProfile.riskLevel === 'medium' ? '中风险' : '低风险'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>风险分数:</span>
                          <span className="font-medium">{selectedUserDetail.riskProfile.riskScore}/100</span>
                        </div>
                        <div>
                          <span className="text-gray-500">风险因素:</span>
                          <div className="mt-2 space-y-1">
                            {selectedUserDetail.riskProfile.riskFactors.map((factor, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                <span className="text-sm">{factor}</span>
                              </div>
                            ))}
                            {selectedUserDetail.riskProfile.riskFactors.length === 0 && (
                              <div className="text-green-600 text-sm">无风险因素</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 统计信息 */}
                <Card>
                  <CardHeader>
                    <CardTitle>活动统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">发布主题:</span>
                        <div className="font-medium">{selectedUserDetail.topicCount}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">回复数:</span>
                        <div className="font-medium">{selectedUserDetail.replyCount}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">被举报:</span>
                        <div className="font-medium">{selectedUserDetail.reportCount}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">处罚次数:</span>
                        <div className="font-medium">{selectedUserDetail.punishmentCount}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">申诉次数:</span>
                        <div className="font-medium">{selectedUserDetail.appealCount}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">登录次数:</span>
                        <div className="font-medium">{selectedUserDetail.loginCount}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 信用分 */}
                <Card>
                  <CardHeader>
                    <CardTitle>信用评分</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>信用分:</span>
                        <span className="text-2xl font-bold">{selectedUserDetail.trustScore}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            selectedUserDetail.trustScore >= 80 ? 'bg-green-500' :
                            selectedUserDetail.trustScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${selectedUserDetail.trustScore}%` }}
                        />
                      </div>
                      <div>
                        <span className="text-gray-500">违规次数:</span>
                        <span className="ml-2 font-medium">{selectedUserDetail.violationCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 处罚记录 */}
              {selectedUserDetail.punishments && selectedUserDetail.punishments.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>处罚记录</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedUserDetail.punishments.map((punishment: any) => (
                        <div key={punishment.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={punishment.status === 'active' ? 'destructive' : 'secondary'}>
                                  {punishment.type === 'ban' ? '封禁' : 
                                   punishment.type === 'mute' ? '禁言' : 
                                   punishment.type === 'warning' ? '警告' : punishment.type}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  严重程度: {punishment.severity}
                                </span>
                              </div>
                              <p className="mt-1 text-sm">{punishment.reason}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(punishment.createdAt)}
                                {punishment.endTime && ` - ${formatDate(punishment.endTime)}`}
                              </p>
                            </div>
                            {punishment.status === 'active' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPunishment(punishment);
                                  setShowRevokeModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Undo2 className="h-4 w-4 mr-1" />
                                撤销
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 处罚模态框 */}
      {showPunishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">用户处罚</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">处罚类型</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={punishmentForm.type}
                    onChange={(e) => setPunishmentForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="warning">警告</option>
                    <option value="mute">禁言</option>
                    <option value="ban">封禁</option>
                    <option value="suspend">暂停</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">处罚原因</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="请详细说明处罚原因..."
                    value={punishmentForm.reason}
                    onChange={(e) => setPunishmentForm(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">处罚时长（分钟）</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="留空表示永久"
                    value={punishmentForm.duration}
                    onChange={(e) => setPunishmentForm(prev => ({ ...prev, duration: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">严重程度 (1-5)</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={punishmentForm.severity}
                    onChange={(e) => setPunishmentForm(prev => ({ ...prev, severity: Number(e.target.value) }))}
                  >
                    <option value={1}>1 - 轻微</option>
                    <option value={2}>2 - 一般</option>
                    <option value={3}>3 - 中等</option>
                    <option value={4}>4 - 严重</option>
                    <option value={5}>5 - 极严重</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowPunishModal(false)}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => selectedUserDetail && handlePunishUser(selectedUserDetail.id)}
                  disabled={!punishmentForm.reason}
                >
                  确认处罚
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 批量操作模态框 */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">批量操作</h2>
              <p className="text-sm text-gray-600 mb-4">
                即将对 {selectedUsers.length} 个用户执行批量操作
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">操作类型</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={batchForm.type}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="batch_ban">批量封禁</option>
                    <option value="batch_mute">批量禁言</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">操作原因</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="请输入批量操作的原因..."
                    value={batchForm.reason}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">时长（分钟）</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="留空表示永久"
                    value={batchForm.duration}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, duration: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowBatchModal(false)}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBatchOperation}
                  disabled={!batchForm.reason.trim()}
                >
                  确认执行
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 批量操作状态跟踪 */}
      {showBatchStatus && currentBatchOperationId && (
        <BatchOperationStatus
          operationId={currentBatchOperationId}
          onClose={() => {
            setShowBatchStatus(false);
            setCurrentBatchOperationId(null);
          }}
        />
      )}

      {/* 惩罚日志模态框 */}
      {showPunishmentLogs && (
        <PunishmentLogsModal
          isOpen={showPunishmentLogs}
          onClose={() => setShowPunishmentLogs(false)}
        />
      )}

      {/* 撤销惩罚模态框 */}
      {showRevokeModal && selectedPunishment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">撤销惩罚</h3>
            
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant={selectedPunishment.status === 'active' ? 'destructive' : 'secondary'}>
                  {selectedPunishment.type === 'ban' ? '封禁' : 
                   selectedPunishment.type === 'mute' ? '禁言' : 
                   selectedPunishment.type === 'warning' ? '警告' : selectedPunishment.type}
                </Badge>
                <span className="text-sm text-gray-500">
                  严重程度: {selectedPunishment.severity}
                </span>
              </div>
              <p className="text-sm">{selectedPunishment.reason}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(selectedPunishment.createdAt)}
                {selectedPunishment.endTime && ` - ${formatDate(selectedPunishment.endTime)}`}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">撤销原因</label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                rows={3}
                placeholder="请输入撤销原因（可选）"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleRevokePunishment}
                className="flex-1"
                variant="destructive"
              >
                <Undo2 className="h-4 w-4 mr-2" />
                确认撤销
              </Button>
              <Button
                onClick={() => {
                  setShowRevokeModal(false);
                  setSelectedPunishment(null);
                  setRevokeReason('');
                }}
                variant="outline"
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;