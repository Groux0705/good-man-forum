import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import toast from 'react-hot-toast';

interface FormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  // ESC 键关闭页面功能
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate('/');
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await login(data.username, data.password);
      toast.success('登录成功');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden cursor-pointer"
      onClick={() => navigate('/')}
    >
      {/* 聚焦光圈效果 */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-gradient-radial from-primary/15 via-primary/8 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-gradient-radial from-primary/10 via-primary/5 to-transparent rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* 高亮聚焦内容区域 */}
      <div 
        className="w-full max-w-md relative z-10 transform hover:scale-105 transition-transform duration-300 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/15 backdrop-blur-xl border border-primary/20 shadow-xl shadow-primary/20">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 text-shadow">欢迎回来</h1>
          <p className="text-muted-foreground">登录到 Good Man Forum 继续您的精彩讨论</p>
        </div>

        <Card className="backdrop-blur-2xl bg-card/95 border border-primary/15 shadow-xl shadow-primary/15 hover:shadow-primary/25 transition-all duration-300">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center flex items-center justify-center space-x-2">
              <LogIn className="w-5 h-5 text-primary" />
              <span>登录账户</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  用户名或邮箱
                </label>
                <Input
                  {...register('username', { required: '请输入用户名或邮箱' })}
                  type="text"
                  placeholder="输入您的用户名或邮箱"
                  className="h-10 backdrop-blur-sm bg-background/70 border border-border/60 focus:border-primary/50 focus:bg-background/90 transition-all duration-300"
                  error={!!errors.username}
                />
                {errors.username && (
                  <p className="text-sm text-destructive animate-slide-down">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  密码
                </label>
                <div className="relative">
                  <Input
                    {...register('password', { required: '请输入密码' })}
                    type={showPassword ? "text" : "password"}
                    placeholder="输入您的密码"
                    className="h-10 pr-10 backdrop-blur-sm bg-background/70 border border-border/60 focus:border-primary/50 focus:bg-background/90 transition-all duration-300"
                    error={!!errors.password}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive animate-slide-down">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full h-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 ${loading ? 'opacity-90 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="w-4 h-4 border-2 border-primary-foreground/20 rounded-full"></div>
                      <div className="absolute inset-0 w-4 h-4 border-2 border-transparent border-t-primary-foreground rounded-full animate-spin"></div>
                    </div>
                    <span className="animate-pulse">登录中...</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-primary-foreground/60 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-primary-foreground/60 rounded-full animate-pulse delay-100"></div>
                      <div className="w-1 h-1 bg-primary-foreground/60 rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>登录</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card/95 text-muted-foreground backdrop-blur-sm">或者</span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                还没有账户？{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-primary hover:text-primary/80 transition-colors duration-200 underline-offset-4 hover:underline"
                >
                  立即注册
                </Link>
              </p>
              
              <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                <span>登录即表示您同意我们的</span>
                <Link 
                  to="/terms-of-service" 
                  className="text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
                >
                  服务条款
                </Link>
                <span>和</span>
                <Link 
                  to="/privacy-policy" 
                  className="text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
                >
                  隐私政策
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 Good Man Forum. 构建美好的技术社区.
          </p>
          <p className="text-xs text-muted-foreground mt-1 opacity-75">
            按 ESC 键或点击外部区域返回首页
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;