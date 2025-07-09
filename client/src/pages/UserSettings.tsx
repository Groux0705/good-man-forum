import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { toast } from 'react-hot-toast';
import { Settings, User, Lock, Camera, Save, Eye, EyeOff } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  balance: number;
  level: number;
  createdAt: string;
  topicsCount: number;
  repliesCount: number;
}

const UserSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        setProfileForm({
          username: data.data.username,
          email: data.data.email,
          bio: data.data.bio || '',
          avatar: data.data.avatar || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('获取用户信息失败');
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('个人信息更新成功');
        setProfile(prev => prev ? { ...prev, ...data.data } : null);
        updateProfile(data.data);
      } else {
        toast.error(data.error || '更新失败');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }

    setUploading(true);

    try {
      // 创建 FormData
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // 直接使用返回的URL
        setProfileForm(prev => ({ ...prev, avatar: data.url }));
        toast.success('头像上传成功');
      } else {
        toast.error(data.error || '头像上传失败');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('头像上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('新密码与确认密码不一致');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('新密码至少需要6位字符');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('密码修改成功');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(data.error || '密码修改失败');
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('密码修改失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'password', label: '修改密码', icon: Lock },
  ];

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">个人设置</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 左侧菜单 */}
          <div className="lg:col-span-3">
            <Card className="glass-card sticky top-8">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* 右侧内容 */}
          <div className="lg:col-span-9">
            {activeTab === 'profile' && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <User className="h-6 w-6" />
                    <span>个人资料</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* 头像区域 */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-muted border-4 border-background shadow-lg overflow-hidden">
                          {profileForm.avatar ? (
                            <img
                              src={profileForm.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                              <User className="h-8 w-8 text-primary" />
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          id="avatar-upload"
                          disabled={uploading}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 rounded-full shadow-lg bg-background border-2"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">头像</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          点击相机图标上传本地图片，支持 JPG、PNG 格式，大小不超过 5MB
                        </p>
                        {uploading && (
                          <p className="text-xs text-primary">正在上传...</p>
                        )}
                      </div>
                    </div>

                    {/* 基本信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          用户名
                        </label>
                        <Input
                          type="text"
                          value={profileForm.username}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="请输入用户名"
                          className="glass-input"
                        />
                        <p className="text-xs text-muted-foreground">
                          3-20个字符，只能包含字母、数字和下划线
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          邮箱地址
                        </label>
                        <Input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="请输入邮箱地址"
                          className="glass-input"
                        />
                      </div>
                    </div>

                    {/* 头像URL */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        头像链接
                      </label>
                      <Input
                        type="url"
                        value={profileForm.avatar}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, avatar: e.target.value }))}
                        placeholder="请输入头像图片链接"
                        className="glass-input"
                      />
                    </div>

                    {/* 个人简介 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        个人简介
                      </label>
                      <Textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="介绍一下自己吧..."
                        rows={4}
                        maxLength={200}
                        className="glass-input resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {profileForm.bio.length}/200 字符
                      </p>
                    </div>

                    {/* 账户统计 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{profile.level}</div>
                        <div className="text-sm text-muted-foreground">等级</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{profile.balance}</div>
                        <div className="text-sm text-muted-foreground">余额</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{profile.topicsCount}</div>
                        <div className="text-sm text-muted-foreground">主题</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{profile.repliesCount}</div>
                        <div className="text-sm text-muted-foreground">回复</div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full glass-button"
                      disabled={loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? '保存中...' : '保存更改'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'password' && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Lock className="h-6 w-6" />
                    <span>修改密码</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        当前密码
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="请输入当前密码"
                          className="glass-input pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        新密码
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="请输入新密码"
                          className="glass-input pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        密码至少需要6位字符
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        确认新密码
                      </label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="请再次输入新密码"
                        className="glass-input"
                      />
                    </div>

                    <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Lock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-amber-800">安全提示</h4>
                          <ul className="mt-2 text-xs text-amber-700 space-y-1">
                            <li>• 建议使用包含字母、数字和特殊字符的复杂密码</li>
                            <li>• 不要使用与其他网站相同的密码</li>
                            <li>• 定期更换密码以保护账户安全</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full glass-button"
                      disabled={loading}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {loading ? '修改中...' : '修改密码'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;