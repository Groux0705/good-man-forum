import React, { useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-primary/15 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/20">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">欢迎回来</h1>
          <p className="text-muted-foreground">登录到 Good Man Forum 继续您的精彩讨论</p>
        </div>

        <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl shadow-primary/5">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center space-x-2">
              <LogIn className="w-5 h-5 text-primary" />
              <span>登录账户</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  用户名或邮箱
                </label>
                <Input
                  {...register('username', { required: '请输入用户名或邮箱' })}
                  type="text"
                  placeholder="输入您的用户名或邮箱"
                  className="h-11 backdrop-blur-sm bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all duration-200"
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>登录中...</span>
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
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card/80 text-muted-foreground backdrop-blur-sm">或者</span>
              </div>
            </div>

            <div className="text-center space-y-4">
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

export default Login;