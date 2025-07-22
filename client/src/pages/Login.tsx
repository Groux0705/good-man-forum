import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: {
      rememberMe: localStorage.getItem('rememberMe') === 'true'
    }
  });

  const watchedUsername = watch('username');
  const watchedPassword = watch('password');

  // 优化 ESC 键处理 - 使用 useCallback 避免重复创建函数
  const handleEscKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      navigate('/');
    }
  }, [navigate]);

  // ESC 键关闭页面功能
  useEffect(() => {
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [handleEscKey]);

  // 优化密码显示切换
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // 记忆化动画样式以减少重复计算，并为移动端优化
  const backgroundEffects = useMemo(() => (
    <div className="absolute inset-0 w-full h-full">
      {/* 桌面端背景效果 */}
      <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-gradient-radial from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-gradient-radial from-primary/8 via-primary/3 to-transparent rounded-full blur-2xl"></div>
      {/* 移动端简化背景效果 */}
      <div className="block md:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[250px] bg-gradient-radial from-primary/8 via-primary/4 to-transparent rounded-full blur-2xl"></div>
    </div>
  ), []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      // 保存"记住我"选项
      localStorage.setItem('rememberMe', data.rememberMe.toString());
      if (data.rememberMe) {
        localStorage.setItem('savedUsername', data.username);
      } else {
        localStorage.removeItem('savedUsername');
      }
      
      await login(data.username, data.password);
      toast.success('登录成功！欢迎回来');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '登录失败，请检查您的用户名和密码';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 表单验证规则
  const validationRules = {
    username: {
      required: '请输入用户名或邮箱',
      minLength: { value: 3, message: '用户名至少需要3个字符' },
      pattern: {
        value: /^[a-zA-Z0-9_@.-]+$/,
        message: '用户名只能包含字母、数字、下划线、@、.、-'
      }
    },
    password: {
      required: '请输入密码',
      minLength: { value: 6, message: '密码至少需要6个字符' }
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 lg:p-6 relative overflow-hidden cursor-pointer"
      onClick={() => navigate('/')}
      role="main"
      aria-label="登录页面"
    >
      {/* 优化的背景效果 */}
      {backgroundEffects}

      {/* 高亮聚焦内容区域 - 响应式布局 */}
      <div 
        className="w-full max-w-sm sm:max-w-md relative z-10 transform hover:scale-105 transition-transform duration-300 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题区域 - 移动端优化 */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/25 to-primary/15 backdrop-blur-xl border border-primary/20 shadow-xl shadow-primary/20">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-shadow">欢迎回来</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">登录到 Good Man Forum 继续您的精彩讨论</p>
        </div>

        <Card className="backdrop-blur-2xl bg-card/95 border border-primary/15 shadow-xl shadow-primary/15 hover:shadow-primary/25 transition-all duration-300 mx-2 sm:mx-0">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-lg sm:text-xl font-semibold text-center flex items-center justify-center space-x-2">
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span>登录账户</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              {/* 用户名输入框 - 移动端优化 */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  用户名或邮箱
                </label>
                <Input
                  {...register('username', validationRules.username)}
                  type="text"
                  placeholder="输入您的用户名或邮箱"
                  autoComplete="username"
                  defaultValue={localStorage.getItem('savedUsername') || ''}
                  className="h-10 sm:h-11 text-sm sm:text-base backdrop-blur-sm bg-background/70 border border-border/60 focus:border-primary/50 focus:bg-background/90 transition-all duration-300"
                  error={!!errors.username}
                  aria-describedby={errors.username ? "username-error" : undefined}
                />
                {errors.username && (
                  <p id="username-error" className="text-sm text-destructive animate-slide-down" role="alert">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* 密码输入框 - 移动端优化 */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  密码
                </label>
                <div className="relative">
                  <Input
                    {...register('password', validationRules.password)}
                    type={showPassword ? "text" : "password"}
                    placeholder="输入您的密码"
                    autoComplete="current-password"
                    className="h-10 sm:h-11 pr-10 sm:pr-12 text-sm sm:text-base backdrop-blur-sm bg-background/70 border border-border/60 focus:border-primary/50 focus:bg-background/90 transition-all duration-300"
                    error={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground touch-manipulation"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive animate-slide-down" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* 记住我选项 - 移动端优化 */}
              <div className="flex items-center justify-between space-x-2 py-1">
                <div className="flex items-center space-x-2">
                  <input
                    {...register('rememberMe')}
                    type="checkbox"
                    id="rememberMe"
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-border/60 text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-background bg-background/70 touch-manipulation"
                  />
                  <label htmlFor="rememberMe" className="text-sm font-medium text-foreground cursor-pointer select-none touch-manipulation">
                    记住我
                  </label>
                </div>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80 transition-colors duration-200 underline-offset-4 hover:underline touch-manipulation py-1 px-1"
                  tabIndex={0}
                >
                  忘记密码？
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading || !watchedUsername?.trim() || !watchedPassword?.trim()}
                className={`w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-manipulation ${loading ? 'opacity-90' : ''}`}
                aria-describedby={loading ? "login-status" : undefined}
              >
                {loading ? (
                  <div className="flex items-center space-x-2" id="login-status" aria-live="polite">
                    <div className="relative">
                      <div className="w-4 h-4 border-2 border-primary-foreground/20 rounded-full"></div>
                      <div className="absolute inset-0 w-4 h-4 border-2 border-transparent border-t-primary-foreground rounded-full animate-spin"></div>
                    </div>
                    <span>正在登录...</span>
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

            {/* 分隔线 - 移动端优化 */}
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 sm:px-4 bg-card/95 text-muted-foreground backdrop-blur-sm">或者</span>
              </div>
            </div>

            {/* 底部链接 - 移动端优化 */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                还没有账户？{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-primary hover:text-primary/80 transition-colors duration-200 underline-offset-4 hover:underline touch-manipulation"
                >
                  立即注册
                </Link>
              </p>
              
              {/* 服务条款链接 - 移动端优化 */}
              <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-xs text-muted-foreground px-2">
                <span>登录即表示您同意我们的</span>
                <Link 
                  to="/terms-of-service" 
                  className="text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors touch-manipulation py-1"
                >
                  服务条款
                </Link>
                <span>和</span>
                <Link 
                  to="/privacy-policy" 
                  className="text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors touch-manipulation py-1"
                >
                  隐私政策
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 页脚信息 - 移动端优化 */}
        <div className="mt-4 sm:mt-6 text-center px-4">
          <p className="text-xs text-muted-foreground">
            © 2024 Good Man Forum. 构建美好的技术社区.
          </p>
          <p className="text-xs text-muted-foreground mt-1 opacity-75">
            <span className="hidden sm:inline">按 ESC 键或</span>点击外部区域返回首页
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;