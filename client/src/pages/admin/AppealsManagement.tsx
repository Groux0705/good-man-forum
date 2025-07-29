import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Calendar,
  User,
  FileText,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Appeal {
  id: string;
  userId: string;
  punishmentId?: string;
  type: string;
  title: string;
  content: string;
  evidence?: string;
  status: string;
  adminId?: string;
  adminNote?: string;
  handledAt?: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
    role: string;
  };
}

interface AppealStats {
  total: number;
  pending: number;
  processing: number;
  approved: number;
  rejected: number;
  closed: number;
}

const AppealsManagement: React.FC = () => {
  // 状态管理
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [stats, setStats] = useState<AppealStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // 过滤和搜索状态
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // 操作状态
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [showAppealDetail, setShowAppealDetail] = useState(false);
  const [showHandleModal, setShowHandleModal] = useState(false);
  const [handleForm, setHandleForm] = useState({
    status: 'approved',
    adminNote: ''
  });

  useEffect(() => {
    fetchAppeals();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter, priorityFilter, typeFilter]);

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter })
      });

      const response = await fetch(`/api/admin/appeals?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAppeals(result.data.appeals);
        setTotalPages(result.data.pagination.pages);
        setTotal(result.data.pagination.total);
      }
    } catch (error) {
      console.error('获取申诉列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        // 计算申诉统计
        const appealStats = {
          total: result.data.appeals.total,
          pending: result.data.appeals.pending,
          processing: 0, // 需要后端提供
          approved: 0,   // 需要后端提供
          rejected: 0,   // 需要后端提供
          closed: 0      // 需要后端提供
        };
        setStats(appealStats);
      }
    } catch (error) {
      console.error('获取申诉统计失败:', error);
    }
  };

  const handleAppeal = async (appealId: string, status: string, adminNote: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/appeals/${appealId}/handle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          adminNote
        })
      });

      if (response.ok) {
        alert('申诉处理完成');
        setShowHandleModal(false);
        setHandleForm({ status: 'approved', adminNote: '' });
        fetchAppeals();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.message || '处理失败');
      }
    } catch (error) {
      console.error('处理申诉失败:', error);
      alert('处理失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '待处理', color: 'bg-yellow-100 text-yellow-800' },
      processing: { label: '处理中', color: 'bg-blue-100 text-blue-800' },
      approved: { label: '已通过', color: 'bg-green-100 text-green-800' },
      rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
      closed: { label: '已关闭', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: '低', color: 'bg-gray-100 text-gray-800' },
      normal: { label: '普通', color: 'bg-blue-100 text-blue-800' },
      high: { label: '高', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: '紧急', color: 'bg-red-100 text-red-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      punishment_appeal: '处罚申诉',
      account_recovery: '账号找回',
      content_appeal: '内容申诉'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (loading && appeals.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">申诉管理</h1>
          <p className="text-gray-600 dark:text-gray-400">
            处理用户申诉请求，维护论坛公平公正
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总申诉</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待处理</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">处理中</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.processing}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已通过</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.approved}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已拒绝</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.rejected}
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索申诉标题或内容..."
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
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="approved">已通过</option>
              <option value="rejected">已拒绝</option>
              <option value="closed">已关闭</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">所有优先级</option>
              <option value="urgent">紧急</option>
              <option value="high">高</option>
              <option value="normal">普通</option>
              <option value="low">低</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">所有类型</option>
              <option value="punishment_appeal">处罚申诉</option>
              <option value="account_recovery">账号找回</option>
              <option value="content_appeal">内容申诉</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 申诉列表 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">申诉信息</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">用户</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">类型</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">状态</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">优先级</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">提交时间</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {appeals.map((appeal) => (
                  <tr key={appeal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {appeal.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {appeal.content}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          {appeal.user.avatar ? (
                            <img src={appeal.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {appeal.user.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {appeal.user.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {appeal.user.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {getTypeLabel(appeal.type)}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(appeal.status)}
                    </td>
                    <td className="p-4">
                      {getPriorityBadge(appeal.priority)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-500">
                        {formatDate(appeal.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAppeal(appeal);
                            setShowAppealDetail(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {appeal.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAppeal(appeal);
                              setShowHandleModal(true);
                            }}
                          >
                            <ArrowRight className="h-4 w-4" />
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

      {/* 申诉详情模态框 */}
      {showAppealDetail && selectedAppeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">申诉详情</h2>
                <Button variant="outline" onClick={() => setShowAppealDetail(false)}>
                  关闭
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* 申诉基本信息 */}
                <Card>
                  <CardHeader>
                    <CardTitle>基本信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">申诉标题</label>
                        <div className="mt-1">{selectedAppeal.title}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">申诉类型</label>
                        <div className="mt-1">{getTypeLabel(selectedAppeal.type)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">状态</label>
                        <div className="mt-1">{getStatusBadge(selectedAppeal.status)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">优先级</label>
                        <div className="mt-1">{getPriorityBadge(selectedAppeal.priority)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">提交时间</label>
                        <div className="mt-1">{formatDate(selectedAppeal.createdAt)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">申诉用户</label>
                        <div className="mt-1 flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            {selectedAppeal.user.avatar ? (
                              <img src={selectedAppeal.user.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <span className="text-xs font-medium text-gray-600">
                                {selectedAppeal.user.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span>{selectedAppeal.user.username}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 申诉内容 */}
                <Card>
                  <CardHeader>
                    <CardTitle>申诉内容</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap">{selectedAppeal.content}</div>
                  </CardContent>
                </Card>

                {/* 证据材料*/}
                {selectedAppeal.evidence && (
                  <Card>
                    <CardHeader>
                      <CardTitle>证据材料</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap">{selectedAppeal.evidence}</div>
                    </CardContent>
                  </Card>
                )}

                {/* 处理记录 */}
                {selectedAppeal.adminNote && (
                  <Card>
                    <CardHeader>
                      <CardTitle>处理记录</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-500">处理时间:</span>
                          <span className="ml-2">{selectedAppeal.handledAt ? formatDate(selectedAppeal.handledAt) : '未处理'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">管理员备注:</span>
                          <div className="mt-1 whitespace-pre-wrap">{selectedAppeal.adminNote}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 操作按钮 */}
                {selectedAppeal.status === 'pending' && (
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAppealDetail(false);
                        setShowHandleModal(true);
                      }}
                    >
                      处理申诉
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 处理申诉模态框 */}
      {showHandleModal && selectedAppeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">处理申诉</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">处理结果</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    value={handleForm.status}
                    onChange={(e) => setHandleForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="approved">通过申诉</option>
                    <option value="rejected">拒绝申诉</option>
                    <option value="closed">关闭申诉</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">管理员备注</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="请填写处理说明和理由..."
                    value={handleForm.adminNote}
                    onChange={(e) => setHandleForm(prev => ({ ...prev, adminNote: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowHandleModal(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={() => handleAppeal(selectedAppeal.id, handleForm.status, handleForm.adminNote)}
                  disabled={!handleForm.adminNote.trim()}
                >
                  确认处理
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppealsManagement;