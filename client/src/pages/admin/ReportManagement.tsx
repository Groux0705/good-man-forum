import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Eye,
  Check,
  X,
  Clock,
  User,
  FileText,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Report {
  id: string;
  type: 'topic' | 'reply' | 'user';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  details: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    username: string;
    avatar: string | null;
  };
  target: {
    id: string;
    title?: string;
    content?: string;
    username?: string;
    avatar?: string | null;
  };
  handler?: {
    id: string;
    username: string;
  };
  handlerResponse?: string;
}

interface ReportListResponse {
  reports: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const ReportManagement: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [handlingReport, setHandlingReport] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, [currentPage, statusFilter, typeFilter, searchTerm]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result: { data: ReportListResponse } = await response.json();
        setReports(result.data.reports);
        setTotalPages(result.data.pagination.pages);
      }
    } catch (error) {
      console.error('获取举报列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject', response?: string) => {
    try {
      setHandlingReport(reportId);
      const token = localStorage.getItem('token');
      
      const apiResponse = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          response
        })
      });

      if (apiResponse.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('处理举报失败:', error);
    } finally {
      setHandlingReport(null);
    }
  };

  const handleBatchAction = async (action: 'approve' | 'reject') => {
    if (selectedReports.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/reports/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          ids: selectedReports, 
          action,
          status: action === 'approve' ? 'approved' : 'rejected'
        })
      });

      if (response.ok) {
        setSelectedReports([]);
        fetchReports();
      }
    } catch (error) {
      console.error('批量处理举报失败:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: '待处理', variant: 'secondary' as const, icon: Clock },
      'approved': { label: '已通过', variant: 'default' as const, icon: Check },
      'rejected': { label: '已拒绝', variant: 'destructive' as const, icon: X }
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center">
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      'topic': { label: '主题', variant: 'outline' as const, icon: FileText },
      'reply': { label: '回复', variant: 'outline' as const, icon: MessageSquare },
      'user': { label: '用户', variant: 'outline' as const, icon: User }
    };

    const config = typeMap[type as keyof typeof typeMap] || typeMap.topic;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center">
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const toggleReportSelection = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const formatTargetInfo = (report: Report) => {
    switch (report.type) {
      case 'topic':
        return report.target.title || '未知主题';
      case 'reply':
        return `回复内容: ${report.target.content?.substring(0, 50)}...` || '未知回复';
      case 'user':
        return report.target.username || '未知用户';
      default:
        return '未知目标';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">举报处理</h1>
        <p className="text-gray-600 dark:text-gray-400">处理用户举报和投诉</p>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="搜索举报原因或内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">所有状态</option>
                <option value="pending">待处理</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">所有类型</option>
                <option value="topic">主题</option>
                <option value="reply">回复</option>
                <option value="user">用户</option>
              </select>
            </div>
          </div>

          {/* 批量操作 */}
          {selectedReports.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  已选择 {selectedReports.length} 个举报
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBatchAction('approve')}
                  >
                    批量通过
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBatchAction('reject')}
                  >
                    批量拒绝
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 举报列表 */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
            </CardContent>
          </Card>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">没有找到举报</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report.id)}
                      onChange={() => toggleReportSelection(report.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTypeBadge(report.type)}
                        {getStatusBadge(report.status)}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        #{report.id.slice(-8)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        举报原因: {report.reason}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        被举报内容: {formatTargetInfo(report)}
                      </p>
                    </div>

                    {report.details && (
                      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          详细说明: {report.details}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>举报人: {report.reporter.username}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        {report.handler && (
                          <div className="flex items-center">
                            <span>处理人: {report.handler.username}</span>
                          </div>
                        )}
                      </div>

                      {report.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReportAction(report.id, 'approve')}
                            disabled={handlingReport === report.id}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            通过
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReportAction(report.id, 'reject')}
                            disabled={handlingReport === report.id}
                          >
                            <X className="h-4 w-4 mr-1" />
                            拒绝
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const targetUrl = report.type === 'topic' 
                                ? `/topic/${report.target.id}` 
                                : report.type === 'user'
                                ? `/user/${report.target.id}`
                                : '#';
                              window.open(targetUrl, '_blank');
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {report.handlerResponse && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          处理回复: {report.handlerResponse}
                        </p>
                      </div>
                    )}
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

export default ReportManagement;