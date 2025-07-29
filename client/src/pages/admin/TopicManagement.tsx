import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Eye,
  EyeOff,
  Trash2,
  User,
  MessageSquare,
  Heart,
  Bookmark,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Topic {
  id: string;
  title: string;
  content: string;
  status: 'published' | 'hidden' | 'deleted';
  replies: number;
  likes: number;
  favorites: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
    status: string;
    role: string;
  };
  node: {
    id: string;
    name: string;
    title: string;
  };
}

interface TopicListResponse {
  topics: Topic[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const TopicManagement: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [nodeFilter, setNodeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [nodes, setNodes] = useState<Array<{ id: string; name: string; title: string }>>([]);

  useEffect(() => {
    fetchTopics();
    fetchNodes();
  }, [currentPage, statusFilter, nodeFilter, searchTerm]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(nodeFilter !== 'all' && { nodeId: nodeFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/topics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result: { data: TopicListResponse } = await response.json();
        setTopics(result.data.topics);
        setTotalPages(result.data.pagination.pages);
      }
    } catch (error) {
      console.error('获取主题列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNodes = async () => {
    try {
      const response = await fetch('/api/nodes');
      if (response.ok) {
        const result = await response.json();
        setNodes(result.data);
      }
    } catch (error) {
      console.error('获取节点列表失败:', error);
    }
  };

  const handleTopicAction = async (topicId: string, action: 'hide' | 'show' | 'delete', reason?: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (action === 'delete') {
        const response = await fetch(`/api/admin/topics/${topicId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        });

        if (response.ok) {
          fetchTopics();
        }
      } else {
        const status = action === 'hide' ? 'hidden' : 'published';
        const response = await fetch(`/api/admin/topics/${topicId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status, reason })
        });

        if (response.ok) {
          fetchTopics();
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleBatchAction = async (action: 'hide' | 'show' | 'delete') => {
    if (selectedTopics.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      
      const body = action === 'delete' 
        ? { ids: selectedTopics, action: 'delete' }
        : { 
            ids: selectedTopics, 
            action: 'updateStatus',
            status: action === 'hide' ? 'hidden' : 'published'
          };
      
      const response = await fetch('/api/admin/topics/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setSelectedTopics([]);
        fetchTopics();
      }
    } catch (error) {
      console.error('批量操作失败:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'published': { label: '已发布', variant: 'default' as const },
      'hidden': { label: '已隐藏', variant: 'secondary' as const },
      'deleted': { label: '已删除', variant: 'destructive' as const }
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.published;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const toggleTopicSelection = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">主题管理</h1>
        <p className="text-gray-600 dark:text-gray-400">管理论坛主题内容</p>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="搜索主题标题或内容..."
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
                <option value="published">已发布</option>
                <option value="hidden">已隐藏</option>
                <option value="deleted">已删除</option>
              </select>

              <select
                value={nodeFilter}
                onChange={(e) => setNodeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">所有节点</option>
                {nodes.map(node => (
                  <option key={node.id} value={node.id}>{node.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 批量操作 */}
          {selectedTopics.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  已选择 {selectedTopics.length} 个主题
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBatchAction('show')}
                  >
                    批量显示
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBatchAction('hide')}
                  >
                    批量隐藏
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBatchAction('delete')}
                  >
                    批量删除
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 主题列表 */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
            </CardContent>
          </Card>
        ) : topics.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">没有找到主题</p>
            </CardContent>
          </Card>
        ) : (
          topics.map((topic) => (
            <Card key={topic.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic.id)}
                      onChange={() => toggleTopicSelection(topic.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                        {topic.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(topic.status)}
                        <Badge variant="outline" className="text-xs">
                          {topic.node.title}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {truncateContent(topic.content)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{topic.user.username}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{topic.replies} 回复</span>
                        </div>
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          <span>{topic.likes} 点赞</span>
                        </div>
                        <div className="flex items-center">
                          <Bookmark className="h-4 w-4 mr-1" />
                          <span>{topic.favorites} 收藏</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {topic.status === 'published' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTopicAction(topic.id, 'hide')}
                          >
                            <EyeOff className="h-4 w-4 mr-1" />
                            隐藏
                          </Button>
                        ) : topic.status === 'hidden' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTopicAction(topic.id, 'show')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            显示
                          </Button>
                        ) : null}
                        
                        {topic.status !== 'deleted' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleTopicAction(topic.id, 'delete')}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            删除
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`/topic/${topic.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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

export default TopicManagement;