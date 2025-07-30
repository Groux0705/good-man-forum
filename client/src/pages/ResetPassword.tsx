import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import toast from 'react-hot-toast';
import api from '../utils/api';

interface FormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const token = searchParams.get('token');
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>();
  
  const watchedPassword = watch('password');
  const watchedConfirmPassword = watch('confirmPassword');

  // 检查是否有有效的令牌
  useEffect(() => {
    if (!token) {
      toast.error('无效的重置链接');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  // 优化背景效果
  const backgroundEffects = useMemo(() => (
    <div className="absolute inset-0 w-full h-full">
      <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-gradient-radial from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-gradient-radial from-primary/8 via-primary/3 to-transparent rounded-full blur-2xl"></div>
      <div className="block md:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[250px] bg-gradient-radial from-primary/8 via-primary/4 to-transparent rounded-full blur-2xl"></div>
    </div>
  ), []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('密码不匹配');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/reset-password', {
        token,
        password: data.password
      });
      
      if (response.data.success) {
        setSuccess(true);
        toast.success('密码重置成功！');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '密码重置失败';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">密码重置成功</h1>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              您的密码已成功重置，现在可以使用新密码登录
            </p>
          </div>

          <Card className="backdrop-blur-2xl bg-card/95 border border-green-500/15 shadow-xl shadow-green-500/15">
            <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="text-center">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  前往登录
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 lg:p-6 relative overflow-hidden">
        {backgroundEffects}
        
        <div className="w-full max-w-sm sm:max-w-md relative z-10">
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500/25 to-red-400/15 backdrop-blur-xl border border-red-500/20 shadow-xl shadow-red-500/20">
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">无效的重置链接</h1>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              重置链接无效或已过期，请重新申请
            </p>
          </div>

          <Card className="backdrop-blur-2xl bg-card/95 border border-red-500/15 shadow-xl shadow-red-500/15">
            <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="text-center">
                <Link to="/forgot-password">
                  <Button className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                    重新申请重置
                  </Button>
                </Link>
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
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">设置新密码</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            请输入您的新密码
          </p>
        </div>

        <Card className="backdrop-blur-2xl bg-card/95 border border-primary/15 shadow-xl shadow-primary/15 hover:shadow-primary/25 transition-all duration-300 mx-2 sm:mx-0">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-lg sm:text-xl font-semibold text-center flex items-center justify-center space-x-2">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span>重置密码</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  新密码
                </label>
                <div className="relative">
                  <Input
                    {...register('password', {
                      required: '请输入新密码',
                      minLength: { value: 6, message: '密码长度至少需要6个字符' }
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="输入新密码"
                    autoComplete="new-password"
                    className="h-10 sm:h-11 pr-10 sm:pr-12 text-sm sm:text-base backdrop-blur-sm bg-background/70 border border-border/60 focus:border-primary/50 focus:bg-background/90 transition-all duration-300"
                    error={!!errors.password}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive animate-slide-down">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  确认新密码
                </label>
                <div className="relative">
                  <Input
                    {...register('confirmPassword', {
                      required: '请确认新密码',
                      validate: value => value === watchedPassword || '密码不匹配'
                    })}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="再次输入新密码"
                    autoComplete="new-password"
                    className="h-10 sm:h-11 pr-10 sm:pr-12 text-sm sm:text-base backdrop-blur-sm bg-background/70 border border-border/60 focus:border-primary/50 focus:bg-background/90 transition-all duration-300"
                    error={!!errors.confirmPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
                    onClick={toggleConfirmPasswordVisibility}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive animate-slide-down">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !watchedPassword?.trim() || !watchedConfirmPassword?.trim()}
                className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="w-4 h-4 border-2 border-primary-foreground/20 rounded-full"></div>
                      <div className="absolute inset-0 w-4 h-4 border-2 border-transparent border-t-primary-foreground rounded-full animate-spin"></div>
                    </div>
                    <span>重置中...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>重置密码</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <Link 
                to="/login" 
                className="text-sm text-primary hover:text-primary/80 transition-colors duration-200 underline-offset-4 hover:underline"
              >
                返回登录
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;