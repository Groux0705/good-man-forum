import React, { useState, useEffect } from 'react';
import { 
  FolderTree, 
  Search, 
  Plus,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Hash
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Node {
  id: string;
  name: string;
  title: string;
  description: string | null;
  avatar?: string | null;
  header?: string | null;
  topics: number;
  sort: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  topicCount: number;
}

interface NodeListResponse {
  nodes: Node[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface NodeFormData {
  name: string;
  title: string;
  description: string;
  avatar?: string;
  header?: string;
  sort: number;
  isActive: boolean;
}

const NodeManagement: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [formData, setFormData] = useState<NodeFormData>({
    name: '',
    title: '',
    description: '',
    avatar: '',
    header: '',
    sort: 0,
    isActive: true
  });

  useEffect(() => {
    fetchNodes();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/nodes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result: { data: NodeListResponse } = await response.json();
        setNodes(result.data.nodes);
        setTotalPages(result.data.pagination.pages);
      }
    } catch (error) {
      console.error('获取节点列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeAction = async (nodeId: string, action: 'toggle' | 'delete') => {
    try {
      const token = localStorage.getItem('token');
      
      if (action === 'delete') {
        const response = await fetch(`/api/admin/nodes/${nodeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchNodes();
        }
      } else if (action === 'toggle') {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          const response = await fetch(`/api/admin/nodes/${nodeId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive: !node.isActive })
          });

          if (response.ok) {
            fetchNodes();
          }
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingNode 
        ? `/api/admin/nodes/${editingNode.id}`
        : '/api/admin/nodes';
      
      const response = await fetch(url, {
        method: editingNode ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setEditingNode(null);
        setFormData({
          name: '',
          title: '',
          description: '',
          avatar: '',
          header: '',
          sort: 0,
          isActive: true
        });
        fetchNodes();
      }
    } catch (error) {
      console.error('保存节点失败:', error);
    }
  };

  const handleBatchAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedNodes.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      
      const body = action === 'delete' 
        ? { ids: selectedNodes, action: 'delete' }
        : { 
            ids: selectedNodes, 
            action: 'updateStatus',
            isActive: action === 'activate'
          };
      
      const response = await fetch('/api/admin/nodes/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setSelectedNodes([]);
        fetchNodes();
      }
    } catch (error) {
      console.error('批量操作失败:', error);
    }
  };

  const openEditModal = (node: Node) => {
    setEditingNode(node);
    setFormData({
      name: node.name,
      title: node.title,
      description: node.description || '',
      avatar: node.avatar || '',
      header: node.header || '',
      sort: node.sort,
      isActive: node.isActive
    });
    setShowCreateModal(true);
  };

  const toggleNodeSelection = (nodeId: string) => {
    setSelectedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">节点管理</h1>
          <p className="text-gray-600 dark:text-gray-400">管理论坛分类节点</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          创建节点
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="搜索节点名称或标题..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">所有状态</option>
              <option value="active">激活</option>
              <option value="inactive">停用</option>
            </select>
          </div>

          {/* 批量操作 */}
          {selectedNodes.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  已选择 {selectedNodes.length} 个节点
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBatchAction('activate')}
                  >
                    批量激活
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBatchAction('deactivate')}
                  >
                    批量停用
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

      {/* 节点表格 */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedNodes.length === nodes.length && nodes.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNodes(nodes.map(n => n.id));
                          } else {
                            setSelectedNodes([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      节点信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      统计
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {nodes.map((node) => (
                    <tr key={node.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedNodes.includes(node.id)}
                          onChange={() => toggleNodeSelection(node.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center">
                            <FolderTree className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {node.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <Hash className="h-3 w-3 mr-1" />
                                {node.name}
                              </div>
                            </div>
                          </div>
                          {node.description && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {node.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={node.isActive ? 'default' : 'secondary'}>
                          {node.isActive ? '激活' : '停用'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{node.topicCount || node.topics || 0} 主题</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          排序: {node.sort}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(node.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(node)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNodeAction(node.id, 'toggle')}
                          >
                            {node.isActive ? '停用' : '激活'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleNodeAction(node.id, 'delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* 创建/编辑模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingNode ? '编辑节点' : '创建节点'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  节点名称 (英文)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  节点标题
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  头像 URL
                </label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  头图 URL
                </label>
                <input
                  type="url"
                  value={formData.header}
                  onChange={(e) => setFormData({ ...formData, header: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/header.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  排序
                </label>
                <input
                  type="number"
                  value={formData.sort}
                  onChange={(e) => setFormData({ ...formData, sort: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  激活状态
                </label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingNode(null);
                    setFormData({
                      name: '',
                      title: '',
                      description: '',
                      avatar: '',
                      header: '',
                      sort: 0,
                      isActive: true
                    });
                  }}
                >
                  取消
                </Button>
                <Button type="submit">
                  {editingNode ? '更新' : '创建'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeManagement;