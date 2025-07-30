import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import toast from 'react-hot-toast';
import api from '../utils/api';

interface FormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>();

  const watchedEmail = watch('email');

  // 优化背景效果
  const backgroundEffects = useMemo(() => (
    <div className="absolute inset-0 w-full h-full">
      <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-gradient-radial from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-gradient-radial from-primary/8 via-primary/3 to-transparent rounded-full blur-2xl"></div>
      <div className="block md:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[250px] bg-gradient-radial from-primary/8 via-primary/4 to-transparent rounded-full blur-2xl"></div>
    </div>
  ), []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/forgot-password', data);
      
      if (response.data.success) {
        setSent(true);
        toast.success('重置链接已发送到您的邮箱');
        
        // 开发环境下显示令牌
        if (response.data.token) {
          console.log('重置令牌:', response.data.token);
          toast.success(`开发模式：重置令牌为 ${response.data.token}`, {
            duration: 10000
          });
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '发送重置邮件失败';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 lg:p-6 relative overflow-hidden">
        {backgroundEffects}
        
        <div className="w-full max-w-sm sm:max-w-md relative z-10">
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500/25 to-green-400/15 backdrop-blur-xl border border-green-500/20 shadow-xl shadow-green-500/20">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 animate-pulse" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">邮件已发送</h1>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              如果您的邮箱存在于我们的系统中，您将收到密码重置链接
            </p>
          </div>

          <Card className="backdrop-blur-2xl bg-card/95 border border-green-500/15 shadow-xl shadow-green-500/15">
            <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  请检查您的邮箱并点击重置链接来设置新密码。链接将在30分钟后过期。
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleBackToLogin}
                    className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回登录
                  </Button>
                  
                  <Button
                    onClick={() => setSent(false)}
                    variant="outline"
                    className="w-full h-10 sm:h-11 text-sm"
                  >
                    重新发送邮件
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 lg:p-6 relative overflow-hidden">
      {backgroundEffects}

      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/25 to-primary/15 backdrop-blur-xl border border-primary/20 shadow-xl shadow-primary/20">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">忘记密码</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            输入您的邮箱地址，我们将发送密码重置链接
          </p>
        </div>

        <Card className="backdrop-blur-2xl bg-card/95 border border-primary/15 shadow-xl shadow-primary/15 hover:shadow-primary/25 transition-all duration-300 mx-2 sm:mx-0">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-lg sm:text-xl font-semibold text-center flex items-center justify-center space-x-2">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span>重置密码</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  邮箱地址
                </label>
                <Input
                  {...register('email', {
                    required: '请输入邮箱地址',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: '请输入有效的邮箱地址'
                    }
                  })}
                  type="email"
                  placeholder="输入您的邮箱地址"
                  autoComplete="email"
                  className="h-10 sm:h-11 text-sm sm:text-base backdrop-blur-sm bg-background/70 border border-border/60 focus:border-primary/50 focus:bg-background/90 transition-all duration-300"
                  error={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-destructive animate-slide-down">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !watchedEmail?.trim()}
                className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="w-4 h-4 border-2 border-primary-foreground/20 rounded-full"></div>
                      <div className="absolute inset-0 w-4 h-4 border-2 border-transparent border-t-primary-foreground rounded-full animate-spin"></div>
                    </div>
                    <span>发送中...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>发送重置链接</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <Link 
                to="/login" 
                className="text-sm text-primary hover:text-primary/80 transition-colors duration-200 underline-offset-4 hover:underline inline-flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回登录</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;