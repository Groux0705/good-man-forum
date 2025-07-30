import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, MessageSquare, Shield, ChevronRight, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { UserPunishment } from '../types';
import toast from 'react-hot-toast';


interface Appeal {
  id: string;
  type: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  handledAt?: string;
  adminNote?: string;
}

const UserPunishments: React.FC = () => {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'appeals'>('current');
  const [punishments, setPunishments] = useState<UserPunishment[]>([]);
  const [appealablePunishments, setAppealablePunishments] = useState<UserPunishment[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [appealForm, setAppealForm] = useState({
    punishmentId: '',
    title: '',
    content: '',
    evidence: ''
  });
  const [showAppealForm, setShowAppealForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPunishments(),
        fetchAppealablePunishments(),
        fetchAppeals()
      ]);
    } catch (error) {
      console.error('Failed to fetch punishment data:', error);
      toast.error('获取惩罚信息失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchPunishments = async () => {
    try {
      const response = await fetch('/api/punishments/my-punishments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // 合并活跃和历史处罚记录
          const allPunishments = [
            ...result.data.activePunishments.map((p: any) => ({ ...p, status: 'active' })),
            ...result.data.recentPunishments
          ];
          setPunishments(allPunishments);
        }
      }
    } catch (error) {
      console.error('Failed to fetch punishments:', error);
    }
  };

  const fetchAppealablePunishments = async () => {
    try {
      const response = await fetch('/api/punishments/appealable', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAppealablePunishments(result.data.appealablePunishments || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch appealable punishments:', error);
    }
  };

  const fetchAppeals = async () => {
    try {
      const response = await fetch('/api/punishments/appeals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAppeals(result.data.appeals || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch appeals:', error);
    }
  };

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appealForm.title.trim() || !appealForm.content.trim()) {
      toast.error('请填写申诉标题和内容');
      return;
    }

    try {
      const response = await fetch('/api/punishments/appeals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          punishmentId: appealForm.punishmentId,
          title: appealForm.title,
          content: appealForm.content,
          evidence: appealForm.evidence || null
        })
      });

      if (response.ok) {
        toast.success('申诉提交成功');
        setShowAppealForm(false);
        setAppealForm({ punishmentId: '', title: '', content: '', evidence: '' });
        fetchAppeals();
      } else {
        const error = await response.json();
        toast.error(error.message || '申诉提交失败');
      }
    } catch (error) {
      console.error('Failed to submit appeal:', error);
      toast.error('申诉提交失败');
    }
  };

  const getPunishmentTypeInfo = (type: string) => {
    const types = {
      ban: { name: '封禁', icon: '🚫', color: 'destructive' },
      mute: { name: '禁言', icon: '🔇', color: 'secondary' },
      suspend: { name: '暂停', icon: '⏸️', color: 'outline' },
      warning: { name: '警告', icon: '⚠️', color: 'default' }
    };
    return types[type as keyof typeof types] || { name: type, icon: '❓', color: 'default' };
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      active: { name: '进行中', variant: 'destructive' as const },
      expired: { name: '已过期', variant: 'secondary' as const },
      revoked: { name: '已撤销', variant: 'default' as const },
      pending: { name: '待处理', variant: 'outline' as const },
      processing: { name: '处理中', variant: 'secondary' as const },
      approved: { name: '已通过', variant: 'default' as const },
      rejected: { name: '已拒绝', variant: 'destructive' as const },
      closed: { name: '已关闭', variant: 'secondary' as const }
    };
    return statuses[status as keyof typeof statuses] || { name: status, variant: 'default' as const };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">我的惩罚记录</h1>
            <p className="text-muted-foreground">查看您的惩罚状态和申诉记录</p>
          </div>
        </div>

        {/* 选项卡 */}
        <div className="flex space-x-1 bg-muted/20 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'current'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            当前惩罚
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            历史记录
          </button>
          <button
            onClick={() => setActiveTab('appeals')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'appeals'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            申诉记录
          </button>
        </div>

        {/* 当前惩罚 */}
        {activeTab === 'current' && (
          <div className="space-y-4">
            {punishments.filter(p => p.status === 'active').length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">没有当前惩罚</h3>
                  <p className="text-muted-foreground">您当前没有任何活跃的惩罚记录</p>
                </CardContent>
              </Card>
            ) : (
              punishments
                .filter(p => p.status === 'active')
                .map((punishment) => {
                  const typeInfo = getPunishmentTypeInfo(punishment.type);
                  return (
                    <Card key={punishment.id} className="border-red-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{typeInfo.icon}</span>
                            <div>
                              <CardTitle className="text-lg">{typeInfo.name}</CardTitle>
                              <Badge variant={typeInfo.color as any} className="mt-1">
                                等级 {punishment.severity}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant="destructive">进行中</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium text-foreground mb-1">惩罚原因</h4>
                          <p className="text-muted-foreground">{punishment.reason}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">开始时间：</span>
                            <span className="text-foreground">{formatDate(punishment.startTime)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">结束时间：</span>
                            <span className="text-foreground">
                              {punishment.endTime ? formatDate(punishment.endTime) : '永久'}
                            </span>
                          </div>
                        </div>
                        
                        {punishment.severity >= 2 && (
                          <div className="flex items-center justify-between pt-4 border-t">
                            <span className="text-sm text-muted-foreground">
                              可以对此惩罚提起申诉
                            </span>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setAppealForm(prev => ({ ...prev, punishmentId: punishment.id }));
                                setShowAppealForm(true);
                              }}
                            >
                              提起申诉
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
            )}
          </div>
        )}

        {/* 历史记录 */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {punishments.filter(p => p.status !== 'active').length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">没有历史记录</h3>
                  <p className="text-muted-foreground">您没有任何历史惩罚记录</p>
                </CardContent>
              </Card>
            ) : (
              punishments
                .filter(p => p.status !== 'active')
                .map((punishment) => {
                  const typeInfo = getPunishmentTypeInfo(punishment.type);
                  const statusInfo = getStatusBadge(punishment.status || 'expired');
                  return (
                    <Card key={punishment.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl opacity-60">{typeInfo.icon}</span>
                            <div>
                              <CardTitle className="text-lg">{typeInfo.name}</CardTitle>
                              <Badge variant="outline" className="mt-1">
                                等级 {punishment.severity}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant={statusInfo.variant}>{statusInfo.name}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium text-foreground mb-1">惩罚原因</h4>
                          <p className="text-muted-foreground">{punishment.reason}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">开始时间：</span>
                            <span className="text-foreground">{formatDate(punishment.startTime)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">结束时间：</span>
                            <span className="text-foreground">
                              {punishment.endTime ? formatDate(punishment.endTime) : '永久'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
            )}
          </div>
        )}

        {/* 申诉记录 */}
        {activeTab === 'appeals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">申诉记录</h2>
              <Button onClick={() => setShowAppealForm(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                提交申诉
              </Button>
            </div>

            {appeals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">没有申诉记录</h3>
                  <p className="text-muted-foreground">您还没有提交过任何申诉</p>
                </CardContent>
              </Card>
            ) : (
              appeals.map((appeal) => {
                const statusInfo = getStatusBadge(appeal.status);
                return (
                  <Card key={appeal.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{appeal.title}</CardTitle>
                        <Badge variant={statusInfo.variant}>{statusInfo.name}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-1">申诉内容</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">{appeal.content}</p>
                      </div>
                      
                      {appeal.adminNote && (
                        <div className="bg-muted/50 p-3 rounded">
                          <h4 className="font-medium text-foreground mb-1">管理员回复</h4>
                          <p className="text-muted-foreground text-sm">{appeal.adminNote}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">提交时间：</span>
                          <span className="text-foreground">{formatDate(appeal.createdAt)}</span>
                        </div>
                        {appeal.handledAt && (
                          <div>
                            <span className="text-muted-foreground">处理时间：</span>
                            <span className="text-foreground">{formatDate(appeal.handledAt)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* 申诉表单模态框 */}
        {showAppealForm && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 pt-20">
            <div className="w-full max-w-2xl max-h-[calc(100vh-6rem)] flex flex-col bg-background rounded-lg shadow-xl border border-border">
              {/* 固定头部 */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-background">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">提交申诉</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAppealForm(false);
                      setAppealForm({ punishmentId: '', title: '', content: '', evidence: '' });
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* 表单内容 */}
              <form onSubmit={handleSubmitAppeal} className="flex flex-col flex-1 overflow-hidden">
                {/* 可滚动内容区域 */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="space-y-6">
                    {appealablePunishments.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          申诉的惩罚（可选）
                        </label>
                        <select
                          value={appealForm.punishmentId}
                          onChange={(e) => setAppealForm(prev => ({ ...prev, punishmentId: e.target.value }))}
                          className="w-full p-3 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">通用申诉</option>
                          {appealablePunishments.map((punishment) => {
                            const typeInfo = getPunishmentTypeInfo(punishment.type);
                            return (
                              <option key={punishment.id} value={punishment.id}>
                                {typeInfo.name} - {punishment.reason}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        申诉标题 <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={appealForm.title}
                        onChange={(e) => setAppealForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full p-3 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground"
                        placeholder="请简要说明申诉原因"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        申诉内容 <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        value={appealForm.content}
                        onChange={(e) => setAppealForm(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full p-3 border border-input bg-background text-foreground rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground"
                        placeholder="请详细说明您的申诉理由..."
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        相关证据（可选）
                      </label>
                      <textarea
                        value={appealForm.evidence}
                        onChange={(e) => setAppealForm(prev => ({ ...prev, evidence: e.target.value }))}
                        className="w-full p-3 border border-input bg-background text-foreground rounded-md h-20 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground"
                        placeholder="提供相关证据或说明..."
                      />
                    </div>
                  </div>
                </div>
                
                {/* 固定底部按钮区域 */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-muted/10">
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAppealForm(false);
                        setAppealForm({ punishmentId: '', title: '', content: '', evidence: '' });
                      }}
                    >
                      取消
                    </Button>
                    <Button type="submit">
                      提交申诉
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPunishments;