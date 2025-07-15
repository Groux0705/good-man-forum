import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, Users, AlertTriangle, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import PageTransition from '../components/ui/PageTransition';

const TermsOfService: React.FC = () => {
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
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">服务条款</h1>
              <p className="text-muted-foreground">
                欢迎使用 Good Man Forum，请仔细阅读以下条款
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                最后更新时间：{lastUpdated}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* 服务协议 */}
            <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>服务协议</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">1. 服务说明</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Good Man Forum（以下简称"本论坛"）是一个面向技术交流和学习的在线社区平台。我们致力于为用户提供一个开放、友好、专业的交流环境。
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">2. 用户注册</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    用户在注册时必须提供真实、准确的个人信息。用户对其账户的安全性负责，包括密码的保管和账户的使用。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">3. 接受条款</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    通过注册和使用本论坛，您表示已阅读、理解并同意遵守本服务条款。如不同意任何条款，请勿使用本服务。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 用户行为规范 */}
            <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>用户行为规范</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">允许的行为</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>发布与技术相关的优质内容</li>
                    <li>积极参与讨论，提供有价值的回复</li>
                    <li>尊重其他用户，保持友好的交流态度</li>
                    <li>分享学习资源和经验</li>
                    <li>遵守社区规则和网络道德</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">禁止的行为</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>发布违法、有害、威胁、滥用、骚扰的内容</li>
                    <li>发布垃圾信息、广告或无关内容</li>
                    <li>侵犯他人知识产权或隐私权</li>
                    <li>恶意攻击或诽谤他人</li>
                    <li>传播恶意软件或病毒</li>
                    <li>尝试破坏系统安全或获取未授权访问</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 知识产权 */}
            <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>知识产权</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">内容所有权</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    用户发布的原创内容归用户所有。但用户同意授予本论坛在全球范围内使用、修改、展示、分发其内容的权利。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">平台权利</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    本论坛的设计、功能、商标等知识产权归平台所有。未经许可，用户不得复制、修改或商业使用。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 免责声明 */}
            <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <span>免责声明</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">服务可用性</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    本论坛按"现状"提供服务，不保证服务的连续性、及时性、安全性或无错误性。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">用户责任</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    用户对其在平台上的行为承担完全责任。平台不对用户的任何损失或损害承担责任。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">第三方链接</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    本论坛可能包含第三方网站链接。我们不对这些外部网站的内容或服务承担责任。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 服务变更与终止 */}
            <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>服务变更与终止</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">条款修改</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    我们保留随时修改本服务条款的权利。重要变更将通过平台公告或邮件通知用户。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">账户终止</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    我们保留在用户违反服务条款时暂停或终止其账户的权利。用户也可以随时删除自己的账户。
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
                  如果您对本服务条款有任何疑问或建议，请通过以下方式联系我们：
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-muted-foreground">
                    <strong>邮箱：</strong> support@goodmanforum.com
                  </p>
                  <p className="text-muted-foreground">
                    <strong>论坛：</strong> 在相关板块发帖或私信管理员
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

export default TermsOfService;