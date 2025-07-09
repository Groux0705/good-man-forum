import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus, ArrowRight, Sparkles, Mail, User, Lock } from 'lucide-react';
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

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await registerUser(data.username, data.email, data.password);
      toast.success('注册成功');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse delay-300"></div>
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-2/3 right-1/3 w-48 h-48 bg-primary/15 rounded-full blur-2xl animate-pulse delay-1200"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/20">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">加入我们</h1>
          <p className="text-muted-foreground">创建您的 Good Man Forum 账户，开始精彩的技术之旅</p>
        </div>

        <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl shadow-primary/5">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center space-x-2">
              <UserPlus className="w-5 h-5 text-primary" />
              <span>创建账户</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <User className="w-4 h-4 text-primary" />
                  <span>用户名</span>
                </label>
                <Input
                  {...register('username', { 
                    required: '请输入用户名',
                    minLength: { value: 3, message: '用户名至少3个字符' },
                    maxLength: { value: 20, message: '用户名最多20个字符' },
                    pattern: { value: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
                  })}
                  type="text"
                  placeholder="选择一个独特的用户名"
                  className="h-11 backdrop-blur-sm bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-200"
                  error={!!errors.username}
                />
                {errors.username && (
                  <p className="text-sm text-destructive animate-slide-down">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>邮箱地址</span>
                </label>
                <Input
                  {...register('email', { 
                    required: '请输入邮箱',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入有效的邮箱地址' }
                  })}
                  type="email"
                  placeholder="输入您的邮箱地址"
                  className="h-11 backdrop-blur-sm bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-200"
                  error={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-destructive animate-slide-down">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span>密码</span>
                </label>
                <div className="relative">
                  <Input
                    {...register('password', { 
                      required: '请输入密码',
                      minLength: { value: 6, message: '密码至少6个字符' }
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="创建一个安全的密码"
                    className="h-11 pr-12 backdrop-blur-sm bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-200"
                    error={!!errors.password}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive animate-slide-down">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span>确认密码</span>
                </label>
                <div className="relative">
                  <Input
                    {...register('confirmPassword', { 
                      required: '请确认密码',
                      validate: value => value === password || '两次输入的密码不一致'
                    })}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="再次输入密码"
                    className="h-11 pr-12 backdrop-blur-sm bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-200"
                    error={!!errors.confirmPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive animate-slide-down">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>注册中...</span>
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card/80 text-muted-foreground backdrop-blur-sm">或者</span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                已有账户？{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-primary hover:text-primary/80 transition-colors duration-200 underline-offset-4 hover:underline"
                >
                  立即登录
                </Link>
              </p>
              
              <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                <span>注册即表示您同意我们的</span>
                <button className="text-primary hover:text-primary/80 underline-offset-4 hover:underline">
                  服务条款
                </button>
                <span>和</span>
                <button className="text-primary hover:text-primary/80 underline-offset-4 hover:underline">
                  隐私政策
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 Good Man Forum. 构建美好的技术社区.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;