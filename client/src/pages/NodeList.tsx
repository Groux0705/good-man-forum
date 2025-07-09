import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { nodeService } from '../services/node';
import { Node } from '../types';

const NodeList: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const data = await nodeService.getNodes();
        setNodes(data);
      } catch (error) {
        console.error('Failed to fetch nodes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">节点导航</h1>
          <p className="text-gray-600 mt-1">浏览所有讨论节点</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">节点导航</h1>
        <p className="text-gray-600 mt-1">浏览所有讨论节点</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nodes.map((node) => (
          <Link
            key={node.id}
            to={`/node/${node.name}`}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 block"
          >
            <div className="flex items-center space-x-3 mb-3">
              {node.avatar ? (
                <img
                  src={node.avatar}
                  alt={node.title}
                  className="w-10 h-10 rounded"
                />
              ) : (
                <div className="w-10 h-10 bg-primary-100 rounded flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {node.title.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">{node.title}</h3>
                <p className="text-sm text-gray-500">{node.name}</p>
              </div>
            </div>
            
            {node.description && (
              <p className="text-gray-600 text-sm mb-3 overflow-hidden h-10 leading-5">
                {node.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{node.topics} 个主题</span>
              <span className="text-primary-600 hover:text-primary-700">
                进入节点 →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NodeList;