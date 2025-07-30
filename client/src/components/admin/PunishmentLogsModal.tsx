import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Clock, User, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';

interface PunishmentLog {
  id: string;
  type: string;
  reason: string;
  severity: number;
  status: string;
  startTime: string;
  endTime?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
    email: string;
  };
}

interface PunishmentStats {
  type: string;
  status: string;
  _count: number;
}

interface PunishmentLogsResponse {
  punishments: PunishmentLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: PunishmentStats[];
}

interface PunishmentLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PunishmentLogsModal: React.FC<PunishmentLogsModalProps> = ({ isOpen, onClose }) => {
  const [punishments, setPunishments] = useState<PunishmentLog[]>([]);
  const [stats, setStats] = useState<PunishmentStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // 筛选状态
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPunishments();
    }
  }, [isOpen, currentPage, typeFilter, statusFilter, severityFilter]);

  const fetchPunishments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(severityFilter && { severity: severityFilter }),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const response = await fetch(`/api/admin/punishments?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data: { data: PunishmentLogsResponse } = await response.json();
        setPunishments(data.data.punishments);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.pages);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch punishment logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPunishmentTypeInfo = (type: string) => {
    const types = {
      ban: { name: '封禁', icon: '🚫', color: 'bg-red-500' },
      mute: { name: '禁言', icon: '🔇', color: 'bg-orange-500' },
      suspend: { name: '暂停', icon: '⏸️', color: 'bg-yellow-500' },
      warning: { name: '警告', icon: '⚠️', color: 'bg-blue-500' }
    };
    return types[type as keyof typeof types] || { name: type, icon: '❓', color: 'bg-gray-500' };
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      active: { name: '进行中', variant: 'destructive' as const },
      expired: { name: '已过期', variant: 'secondary' as const },
      revoked: { name: '已撤销', variant: 'default' as const }
    };
    return statuses[status as keyof typeof statuses] || { name: status, variant: 'default' as const };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getStatsForType = (type: string) => {
    return stats
      .filter(stat => stat.type === type)
      .reduce((acc, stat) => acc + stat._count, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <span>惩罚日志</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                查看和管理所有用户惩罚记录
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-red-500 rounded-full text-white text-sm">🚫</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">封禁</p>
                  <p className="text-2xl font-bold text-red-900">{getStatsForType('ban')}</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-orange-500 rounded-full text-white text-sm">🔇</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-800">禁言</p>
                  <p className="text-2xl font-bold text-orange-900">{getStatsForType('mute')}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500 rounded-full text-white text-sm">⏸️</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">暂停</p>
                  <p className="text-2xl font-bold text-yellow-900">{getStatsForType('suspend')}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500 rounded-full text-white text-sm">⚠️</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">警告</p>
                  <p className="text-2xl font-bold text-blue-900">{getStatsForType('warning')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 筛选器 */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">筛选：</span>
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">所有类型</option>
              <option value="ban">封禁</option>
              <option value="mute">禁言</option>
              <option value="suspend">暂停</option>
              <option value="warning">警告</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">所有状态</option>
              <option value="active">进行中</option>
              <option value="expired">已过期</option>
              <option value="revoked">已撤销</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="">所有等级</option>
              <option value="1">等级 1</option>
              <option value="2">等级 2</option>
              <option value="3">等级 3</option>
              <option value="4">等级 4</option>
              <option value="5">等级 5</option>
            </select>

            <div className="flex-1 text-right text-sm text-muted-foreground">
              共 {total} 条记录
            </div>
          </div>

          {/* 惩罚记录列表 */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : punishments.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">没有找到记录</h3>
                <p className="text-muted-foreground">请调整筛选条件</p>
              </div>
            ) : (
              <div className="space-y-3">
                {punishments.map((punishment) => {
                  const typeInfo = getPunishmentTypeInfo(punishment.type);
                  const statusInfo = getStatusBadge(punishment.status);
                  
                  return (
                    <div key={punishment.id} className="border rounded-lg p-4 hover:bg-muted/10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full text-white text-sm ${typeInfo.color}`}>
                            {typeInfo.icon}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{typeInfo.name}</h4>
                              <Badge variant="outline">等级 {punishment.severity}</Badge>
                              <Badge variant={statusInfo.variant}>{statusInfo.name}</Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {punishment.reason}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{punishment.user.username}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(punishment.createdAt)}</span>
                              </div>
                              {punishment.endTime && (
                                <div className="flex items-center space-x-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>至 {formatDate(punishment.endTime)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[36px]"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PunishmentLogsModal;