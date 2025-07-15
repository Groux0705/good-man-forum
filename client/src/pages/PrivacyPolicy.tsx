import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Database, Cookie, Bell, Lock, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import PageTransition from '../components/ui/PageTransition';

const PrivacyPolicy: React.FC = () => {
  const lastUpdated = "2024年12月15日";

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/login">
              <Button variant="ghost" className="mb-4 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回登录
              </Button>
            </Link>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/20">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">隐私政策</h1>
              <p className="text-muted-foreground">
                Good Man Forum 重视并保护用户的个人隐私
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                最后更新时间：{lastUpdated}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* 隐私承诺 */}
            <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>隐私承诺</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">我们的承诺</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Good Man Forum 严格遵守相关法律法规，采用行业标准的安全措施保护用户个人信息。我们承诺不会在未经用户同意的情况下收集、使用或分享用户的个人信息。
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">适用范围</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    本隐私政策适用于用户通过 Good Man Forum 网站、移动应用程序或其他相关服务访问和使用我们服务时的个人信息处理。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 信息收集 */}
            <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-primary" />
                  <span>信息收集</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">主动提供的信息</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>注册信息：用户名、邮箱地址、密码（加密存储）</li>
                    <li>个人资料：头像、个人简介、联系方式（可选）</li>
                    <li>发布内容：帖子、回复、评论等用户生成内容</li>
                    <li>互动信息：点赞、收藏、关注等行为记录</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">自动收集的信息</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>设备信息：IP地址、浏览器类型、操作系统</li>
                    <li>使用数据：访问时间、页面浏览记录、停留时长</li>
                    <li>Cookie数据：用于改善用户体验的技术信息</li>
                    <li>日志信息：系统日志、错误报告等技术数据</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 信息使用 */}
            <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <span>信息使用</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">服务提供</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>创建和维护用户账户</li>
                    <li>展示用户发布的内容</li>
                    <li>提供个性化的内容推荐</li>
                    <li>处理用户的交互和通信</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">服务改进</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>分析用户行为以改进产品功能</li>
                    <li>进行数据统计和趋势分析</li>
                    <li>优化系统性能和用户体验</li>
                    <li>开发新功能和服务</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">安全维护</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>检测和防范安全威胁</li>
                    <li>验证用户身份</li>
                    <li>防止滥用和欺诈行为</li>
                    <li>维护平台秩序</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Cookie政策 */}
            <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cookie className="w-5 h-5 text-primary" />
                  <span>Cookie 政策</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Cookie 的使用</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    我们使用 Cookie 和类似技术来增强用户体验、分析网站使用情况和提供个性化服务。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Cookie 类型</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>必要 Cookie：维持网站基本功能</li>
                    <li>性能 Cookie：分析网站使用情况</li>
                    <li>功能 Cookie：记住用户偏好设置</li>
                    <li>定向 Cookie：提供个性化内容</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Cookie 管理</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    用户可以通过浏览器设置管理 Cookie，但禁用某些 Cookie 可能影响网站功能的正常使用。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 信息共享 */}
            <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <span>信息共享</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">不会共享的信息</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    我们不会向第三方出售、出租或以其他方式披露用户的个人信息，除非获得用户明确同意或法律要求。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">可能共享的情况</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>获得用户明确同意</li>
                    <li>遵守法律法规要求</li>
                    <li>保护用户或他人的权利和安全</li>
                    <li>与可信的服务提供商合作（严格保密协议）</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 数据安全 */}
            <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <span>数据安全</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">安全措施</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>使用加密技术保护数据传输</li>
                    <li>定期更新安全系统和防护措施</li>
                    <li>限制员工访问个人信息</li>
                    <li>定期进行安全审计和漏洞测试</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">数据存储</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    用户数据存储在安全的服务器上，采用行业标准的安全措施。我们会定期备份数据以防止数据丢失。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">数据保留</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    我们仅在必要的时间内保留用户数据。账户被删除后，相关个人信息将在合理时间内被安全删除。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 用户权利 */}
            <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>用户权利</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">您的权利</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>查看和更新个人信息</li>
                    <li>删除个人账户和相关数据</li>
                    <li>控制信息的使用和共享</li>
                    <li>获取个人数据的副本</li>
                    <li>撤回之前给予的同意</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">行使权利</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    用户可以通过账户设置页面或联系我们来行使上述权利。我们将在合理时间内处理相关请求。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 政策更新 */}
            <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <span>政策更新</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">更新通知</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    我们可能会不时更新本隐私政策。重要更改将通过网站公告、邮件或其他适当方式通知用户。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">持续使用</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    用户在隐私政策更新后继续使用我们的服务，视为接受更新后的政策内容。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 联系我们 */}
            <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>联系我们</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  如果您对本隐私政策有任何疑问或需要行使相关权利，请通过以下方式联系我们：
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-muted-foreground">
                    <strong>隐私邮箱：</strong> privacy@goodmanforum.com
                  </p>
                  <p className="text-muted-foreground">
                    <strong>客服邮箱：</strong> support@goodmanforum.com
                  </p>
                  <p className="text-muted-foreground">
                    <strong>论坛反馈：</strong> 在隐私政策讨论区发帖
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              © 2024 Good Man Forum. 构建美好的技术社区.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PrivacyPolicy;