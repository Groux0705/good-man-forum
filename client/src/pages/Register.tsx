import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus, ArrowRight, Sparkles, Mail, User, Lock, Github } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import toast from 'react-hot-toast';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  const password = watch('password');
  const watchedUsername = watch('username');
  const watchedEmail = watch('email');
  const watchedConfirmPassword = watch('confirmPassword');

  // 优化 ESC 键处理
  const handleEscKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [handleEscKey]);

  // 记忆化背景效果
  const backgroundEffects = useMemo(() => (
    <div className="absolute inset-0 w-full h-full">
      {/* 桌面端背景效果 */}
      <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl"></div>
      <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-radial from-primary/15 via-primary/5 to-transparent rounded-full blur-2xl"></div>
      {/* 移动端简化背景效果 */}
      <div className="block md:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-gradient-radial from-primary/12 via-primary/6 to-transparent rounded-full blur-2xl"></div>
    </div>
  ), []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await registerUser(data.username, data.email, data.password);
      toast.success('注册成功！欢迎加入 Good Man Forum');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '注册失败，请检查您的信息并重试';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 表单验证规则
  const validationRules = {
    username: {
      required: '请输入用户名',
      minLength: { value: 3, message: '用户名至少3个字符' },
      maxLength: { value: 20, message: '用户名最多20个字符' },
      pattern: { value: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
    },
    email: {
      required: '请输入邮箱',
      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入有效的邮箱地址' }
    },
    password: {
      required: '请输入密码',
      minLength: { value: 6, message: '密码至少6个字符' }
    },
    confirmPassword: {
      required: '请确认密码',
      validate: (value: string) => value === password || '两次输入的密码不一致'
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 lg:p-6 relative overflow-hidden cursor-pointer"
      onClick={() => navigate('/')}
      role="main"
      aria-label="注册页面"
    >
      {/* 优化的背景效果 */}
      {backgroundEffects}

      {/* 高亮聚焦内容区域 - 响应式布局 */}
      <div 
        className="w-full max-w-sm sm:max-w-md relative z-10 transform hover:scale-105 transition-transform duration-500 max-h-full overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题区域 - 移动端优化 */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/30 to-primary/20 backdrop-blur-xl border border-primary/30 sm:border-2 shadow-xl shadow-primary/25">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-shadow">加入我们</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">创建您的 Good Man Forum 账户，开始精彩的技术之旅</p>
        </div>

        <Card className="backdrop-blur-2xl bg-card/90 border border-primary/20 sm:border-2 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 mx-2 sm:mx-0">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-lg sm:text-xl font-semibold text-center flex items-center justify-center space-x-2">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span>创建账户</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              {/* 用户名输入框 - 移动端优化 */}
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <User className="w-4 h-4 text-primary" />
                  <span>用户名</span>
                </label>
                <Input
                  {...register('username', validationRules.username)}
                  type="text"
                  placeholder="选择一个独特的用户名"
                  autoComplete="username"
                  className="h-10 sm:h-11 text-sm sm:text-base backdrop-blur-sm bg-background/70 border border-border/60 sm:border-2 focus:border-primary/60 focus:bg-background/90 transition-all duration-300"
                  error={!!errors.username}
                  aria-describedby={errors.username ? "username-error" : undefined}
                />
                {errors.username && (
                  <p id="username-error" className="text-xs text-destructive animate-slide-down" role="alert">{errors.username.message}</p>
                )}
              </div>

              {/* 邮箱输入框 - 移动端优化 */}
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>邮箱地址</span>
                </label>
                <Input
                  {...register('email', validationRules.email)}
                  type="email"
                  placeholder="输入您的邮箱地址"
                  autoComplete="email"
                  className="h-10 sm:h-11 text-sm sm:text-base backdrop-blur-sm bg-background/70 border border-border/60 sm:border-2 focus:border-primary/60 focus:bg-background/90 transition-all duration-300"
                  error={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-destructive animate-slide-down" role="alert">{errors.email.message}</p>
                )}
              </div>

              {/* 密码输入框 - 移动端优化 */}
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span>密码</span>
                </label>
                <div className="relative">
                  <Input
                    {...register('password', validationRules.password)}
                    type={showPassword ? "text" : "password"}
                    placeholder="创建一个安全的密码"
                    autoComplete="new-password"
                    className="h-10 sm:h-11 pr-10 sm:pr-12 text-sm sm:text-base backdrop-blur-sm bg-background/70 border border-border/60 sm:border-2 focus:border-primary/60 focus:bg-background/90 transition-all duration-300"
                    error={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground touch-manipulation"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-xs text-destructive animate-slide-down" role="alert">{errors.password.message}</p>
                )}
              </div>

              {/* 确认密码输入框 - 移动端优化 */}
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span>确认密码</span>
                </label>
                <div className="relative">
                  <Input
                    {...register('confirmPassword', validationRules.confirmPassword)}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="再次输入密码"
                    autoComplete="new-password"
                    className="h-10 sm:h-11 pr-10 sm:pr-12 text-sm sm:text-base backdrop-blur-sm bg-background/70 border border-border/60 sm:border-2 focus:border-primary/60 focus:bg-background/90 transition-all duration-300"
                    error={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground touch-manipulation"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "隐藏密码" : "显示密码"}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="text-xs text-destructive animate-slide-down" role="alert">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !watchedUsername?.trim() || !watchedEmail?.trim() || !watchedConfirmPassword?.trim()}
                className={`w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-manipulation ${loading ? 'opacity-90' : ''}`}
                aria-describedby={loading ? "register-status" : undefined}
              >
                {loading ? (
                  <div className="flex items-center space-x-2" id="register-status" aria-live="polite">
                    <div className="relative">
                      <div className="w-4 h-4 border-2 border-primary-foreground/20 rounded-full"></div>
                      <div className="absolute inset-0 w-4 h-4 border-2 border-transparent border-t-primary-foreground rounded-full animate-spin"></div>
                    </div>
                    <span>正在注册...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>创建账户</span>
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
                <span className="px-3 sm:px-4 bg-card/90 text-muted-foreground backdrop-blur-sm">或者</span>
              </div>
            </div>

            {/* OAuth 注册按钮 */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = `/api/auth/google`}
                className="w-full h-11 sm:h-12 text-sm sm:text-base border border-border/60 bg-background/50 hover:bg-background/80 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>使用 Google 注册</span>
                </div>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = `/api/auth/github`}
                className="w-full h-11 sm:h-12 text-sm sm:text-base border border-border/60 bg-background/50 hover:bg-background/80 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  <Github className="w-5 h-5" />
                  <span>使用 GitHub 注册</span>
                </div>
              </Button>
            </div>

            {/* 底部链接 - 移动端优化 */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                已有账户？{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-primary hover:text-primary/80 transition-colors duration-200 underline-offset-4 hover:underline touch-manipulation"
                >
                  立即登录
                </Link>
              </p>
              
              {/* 服务条款链接 - 移动端优化 */}
              <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-xs text-muted-foreground px-2">
                <span>注册即表示您同意我们的</span>
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

export default Register;