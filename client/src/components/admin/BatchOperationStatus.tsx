import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Eye,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

interface BatchOperation {
  id: string;
  adminId: string;
  type: string;
  targets: string;
  params: string;
  status: string;
  progress: number;
  result?: string;
  createdAt: string;
  updatedAt: string;
}

interface BatchOperationStatusProps {
  operationId: string;
  onClose: () => void;
}

const BatchOperationStatus: React.FC<BatchOperationStatusProps> = ({ 
  operationId, 
  onClose 
}) => {
  const [operation, setOperation] = useState<BatchOperation | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchOperationStatus();
    
    // 如果操作还在进行中，每2秒刷新一次状态
    const interval = setInterval(() => {
      if (autoRefresh && operation?.status === 'processing') {
        fetchOperationStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [operationId, autoRefresh, operation?.status]);

  const fetchOperationStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/batch-operations/${operationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setOperation(result.data);
        
        // 如果操作完成，停止自动刷新
        if (result.data.status === 'completed' || result.data.status === 'failed') {
          setAutoRefresh(false);
        }
      }
    } catch (error) {
      console.error('获取批量操作状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '等待中', color: 'bg-gray-100 text-gray-800', icon: Clock },
      processing: { label: '执行中', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      completed: { label: '已完成', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { label: '已失败', color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <div className="flex items-center space-x-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
        <IconComponent className={`h-4 w-4 ${
          status === 'processing' ? 'animate-spin' : ''
        }`} />
      </div>
    );
  };

  const getOperationTypeLabel = (type: string) => {
    const typeLabels = {
      batch_ban: '批量封禁',
      batch_mute: '批量禁言',
      batch_delete: '批量删除',
      batch_suspend: '批量暂停'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const parseResult = (resultStr?: string) => {
    if (!resultStr) return null;
    try {
      return JSON.parse(resultStr);
    } catch {
      return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              未找到操作记录
            </h3>
            <p className="text-gray-500 mb-4">
              指定的批量操作记录不存在或已被删除
            </p>
            <Button onClick={onClose}>关闭</Button>
          </div>
        </div>
      </div>
    );
  }

  const result = parseResult(operation.result);
  const targets = JSON.parse(operation.targets);
  const params = JSON.parse(operation.params);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              批量操作状态
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOperationStatus}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* 操作基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">操作类型</label>
                    <div className="mt-1 font-medium">
                      {getOperationTypeLabel(operation.type)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">状态</label>
                    <div className="mt-1">
                      {getStatusBadge(operation.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">目标数量</label>
                    <div className="mt-1 font-medium">
                      {targets.length} 个用户
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">创建时间</label>
                    <div className="mt-1 text-sm">
                      {formatDate(operation.createdAt)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 执行进度 */}
            <Card>
              <CardHeader>
                <CardTitle>执行进度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">完成进度</span>
                    <span className="text-sm font-medium">{operation.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        operation.status === 'completed' ? 'bg-green-500' :
                        operation.status === 'failed' ? 'bg-red-500' :
                        operation.status === 'processing' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${operation.progress}%` }}
                    />
                  </div>
                  {operation.status === 'processing' && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>正在执行中，请耐心等待...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 操作参数 */}
            <Card>
              <CardHeader>
                <CardTitle>操作参数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {params.reason && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">操作原因</label>
                      <div className="mt-1 text-sm">
                        {params.reason}
                      </div>
                    </div>
                  )}
                  {params.duration && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">持续时间</label>
                      <div className="mt-1 text-sm">
                        {params.duration} 分钟
                      </div>
                    </div>
                  )}
                  {params.severity && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">严重程度</label>
                      <div className="mt-1 text-sm">
                        {params.severity}/5
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 执行结果 */}
            {result && (operation.status === 'completed' || operation.status === 'failed') && (
              <Card>
                <CardHeader>
                  <CardTitle>执行结果</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(result) ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-green-600">成功:</span>
                          <span className="ml-2">
                            {result.filter(r => r.success).length} 个
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-red-600">失败:</span>
                          <span className="ml-2">
                            {result.filter(r => !r.success).length} 个
                          </span>
                        </div>
                      </div>
                      
                      {/* 详细结果列表 */}
                      <div className="max-h-60 overflow-y-auto">
                        <div className="space-y-2">
                          {result.map((item, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-2 rounded text-sm ${
                                item.success 
                                  ? 'bg-green-50 text-green-800' 
                                  : 'bg-red-50 text-red-800'
                              }`}
                            >
                              <span>用户 ID: {item.userId}</span>
                              <div className="flex items-center space-x-2">
                                {item.success ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                <span>{item.success ? '成功' : '失败'}</span>
                                {item.error && (
                                  <span className="text-xs">({item.error})</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : operation.status === 'failed' && result.error ? (
                    <div className="text-red-600 text-sm">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4" />
                        <span>操作失败</span>
                      </div>
                      <div className="mt-2 text-xs">
                        错误信息: {result.error}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      暂无详细结果信息
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchOperationStatus;