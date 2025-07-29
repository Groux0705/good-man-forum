import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save,
  Database,
  Shield,
  Globe,
  Bell,
  Users,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface SystemSettings {
  site: {
    name: string;
    description: string;
    logo: string | null;
    favicon: string | null;
    keywords: string;
    contactEmail: string;
  };
  user: {
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    defaultRole: string;
    maxTopicsPerDay: number;
    maxRepliesPerDay: number;
  };
  content: {
    allowAnonymous: boolean;
    enableMarkdown: boolean;
    maxTopicTitleLength: number;
    maxContentLength: number;
    enableFileUpload: boolean;
    maxFileSize: number;
  };
  notification: {
    emailEnabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    enableSsl: boolean;
  };
  security: {
    enableCaptcha: boolean;
    captchaProvider: string;
    captchaKey: string;
    enableRateLimit: boolean;
    rateLimitRequests: number;
    rateLimitWindow: number;
  };
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('site');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSettings(result.data);
      }
    } catch (error) {
      console.error('获取系统设置失败:', error);
      setMessage({ type: 'error', text: '获取系统设置失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    });
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '设置保存成功' });
      } else {
        setMessage({ type: 'error', text: '设置保存失败' });
      }
    } catch (error) {
      console.error('保存系统设置失败:', error);
      setMessage({ type: 'error', text: '保存系统设置失败' });
    } finally {
      setSaving(false);
    }

    // 3秒后清除消息
    setTimeout(() => setMessage(null), 3000);
  };

  const tabs = [
    { id: 'site', name: '站点设置', icon: Globe },
    { id: 'user', name: '用户设置', icon: Users },
    { id: 'content', name: '内容设置', icon: Database },
    { id: 'notification', name: '通知设置', icon: Bell },
    { id: 'security', name: '安全设置', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">加载设置失败</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">系统设置</h1>
          <p className="text-gray-600 dark:text-gray-400">配置系统参数和功能</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? '保存中...' : '保存设置'}
        </Button>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' 
            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 侧边导航 */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* 设置内容 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2" />
                {tabs.find(t => t.id === activeTab)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 站点设置 */}
              {activeTab === 'site' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      站点名称
                    </label>
                    <input
                      type="text"
                      value={settings.site.name}
                      onChange={(e) => handleSettingChange('site', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      站点描述
                    </label>
                    <textarea
                      value={settings.site.description}
                      onChange={(e) => handleSettingChange('site', 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      关键词
                    </label>
                    <input
                      type="text"
                      value={settings.site.keywords}
                      onChange={(e) => handleSettingChange('site', 'keywords', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="用逗号分隔"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      联系邮箱
                    </label>
                    <input
                      type="email"
                      value={settings.site.contactEmail}
                      onChange={(e) => handleSettingChange('site', 'contactEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* 用户设置 */}
              {activeTab === 'user' && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowRegistration"
                      checked={settings.user.allowRegistration}
                      onChange={(e) => handleSettingChange('user', 'allowRegistration', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="allowRegistration" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      允许用户注册
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireEmailVerification"
                      checked={settings.user.requireEmailVerification}
                      onChange={(e) => handleSettingChange('user', 'requireEmailVerification', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="requireEmailVerification" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      需要邮箱验证
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      每日最大发帖数
                    </label>
                    <input
                      type="number"
                      value={settings.user.maxTopicsPerDay}
                      onChange={(e) => handleSettingChange('user', 'maxTopicsPerDay', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      每日最大回复数
                    </label>
                    <input
                      type="number"
                      value={settings.user.maxRepliesPerDay}
                      onChange={(e) => handleSettingChange('user', 'maxRepliesPerDay', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* 内容设置 */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableMarkdown"
                      checked={settings.content.enableMarkdown}
                      onChange={(e) => handleSettingChange('content', 'enableMarkdown', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="enableMarkdown" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      启用Markdown
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableFileUpload"
                      checked={settings.content.enableFileUpload}
                      onChange={(e) => handleSettingChange('content', 'enableFileUpload', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="enableFileUpload" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      允许文件上传
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      主题标题最大长度
                    </label>
                    <input
                      type="number"
                      value={settings.content.maxTopicTitleLength}
                      onChange={(e) => handleSettingChange('content', 'maxTopicTitleLength', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      内容最大长度
                    </label>
                    <input
                      type="number"
                      value={settings.content.maxContentLength}
                      onChange={(e) => handleSettingChange('content', 'maxContentLength', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      文件大小限制 (MB)
                    </label>
                    <input
                      type="number"
                      value={settings.content.maxFileSize}
                      onChange={(e) => handleSettingChange('content', 'maxFileSize', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* 通知设置 */}
              {activeTab === 'notification' && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailEnabled"
                      checked={settings.notification.emailEnabled}
                      onChange={(e) => handleSettingChange('notification', 'emailEnabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="emailEnabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      启用邮件通知
                    </label>
                  </div>

                  {settings.notification.emailEnabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          SMTP主机
                        </label>
                        <input
                          type="text"
                          value={settings.notification.smtpHost}
                          onChange={(e) => handleSettingChange('notification', 'smtpHost', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          SMTP端口
                        </label>
                        <input
                          type="number"
                          value={settings.notification.smtpPort}
                          onChange={(e) => handleSettingChange('notification', 'smtpPort', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          SMTP用户名
                        </label>
                        <input
                          type="text"
                          value={settings.notification.smtpUser}
                          onChange={(e) => handleSettingChange('notification', 'smtpUser', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enableSsl"
                          checked={settings.notification.enableSsl}
                          onChange={(e) => handleSettingChange('notification', 'enableSsl', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="enableSsl" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          启用SSL
                        </label>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 安全设置 */}
              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableCaptcha"
                      checked={settings.security.enableCaptcha}
                      onChange={(e) => handleSettingChange('security', 'enableCaptcha', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="enableCaptcha" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      启用验证码
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableRateLimit"
                      checked={settings.security.enableRateLimit}
                      onChange={(e) => handleSettingChange('security', 'enableRateLimit', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="enableRateLimit" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      启用限流
                    </label>
                  </div>

                  {settings.security.enableRateLimit && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          限流请求数
                        </label>
                        <input
                          type="number"
                          value={settings.security.rateLimitRequests}
                          onChange={(e) => handleSettingChange('security', 'rateLimitRequests', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          限流时间窗口 (分钟)
                        </label>
                        <input
                          type="number"
                          value={settings.security.rateLimitWindow}
                          onChange={(e) => handleSettingChange('security', 'rateLimitWindow', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;