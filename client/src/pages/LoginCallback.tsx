import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const LoginCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error === 'oauth_failed') {
        toast.error('OAuth登录失败，请重试');
        navigate('/login');
        return;
      }

      if (!token) {
        toast.error('登录回调无效');
        navigate('/login');
        return;
      }

      try {
        // 保存token
        localStorage.setItem('token', token);
        
        // 获取用户信息
        const response = await api.get('/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const userData = response.data;
        
        // 更新认证状态
        setUser(userData.data);
        localStorage.setItem('user', JSON.stringify(userData.data));
        
        toast.success('登录成功！欢迎回来');
        navigate('/');
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        toast.error('登录失败，请重试');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg font-medium text-foreground">正在处理登录...</p>
        <p className="text-sm text-muted-foreground mt-2">请稍候，即将跳转</p>
      </div>
    </div>
  );
};

export default LoginCallback;