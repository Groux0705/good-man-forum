# OAuth 设置指南

本项目现已支持三种认证方式：邮件注册、Google OAuth 和 GitHub OAuth。

## 环境变量配置

在 `server/.env` 文件中配置以下变量：

```env
# OAuth配置
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your_session_secret_key_here
```

## Google OAuth 设置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端凭据
5. 设置重定向 URI：`http://localhost:3001/api/auth/google/callback`
6. 将客户端 ID 和密钥添加到环境变量

## GitHub OAuth 设置

1. 访问 GitHub Settings > Developer settings > OAuth Apps
2. 点击 "New OAuth App"
3. 填写应用信息：
   - Application name: Good Man Forum
   - Homepage URL: http://localhost:5173
   - Authorization callback URL: `http://localhost:3001/api/auth/github/callback`
4. 将客户端 ID 和密钥添加到环境变量

## 用户数据结构

更新后的用户模型包含以下字段：
- `provider`: 认证提供商 ("local", "google", "github")
- `providerId`: OAuth 提供商的用户 ID
- `password`: 现在是可选的（OAuth 用户不需要密码）
- `emailVerified`: OAuth 用户默认为 true

## 认证流程

### 传统邮件注册/登录
- 用户输入用户名/邮箱和密码
- 密码验证并生成 JWT token
- 支持忘记密码和密码重置功能

### OAuth 认证
- 用户点击 Google/GitHub 登录按钮
- 重定向到 OAuth 提供商进行授权
- 授权成功后返回用户信息
- 自动创建用户或关联现有账户
- 生成 JWT token 并重定向到前端

## 安全特性

- OAuth 用户不能通过传统方式登录
- 自动生成唯一用户名避免冲突
- 支持邮箱地址关联多个认证方式
- Session 安全配置
- CORS 和安全头设置

## 测试

启动开发服务器后，访问 `/login` 或 `/register` 页面即可看到新的 OAuth 登录选项。

注意：在生产环境中，请确保更新重定向 URL 和环境变量为实际域名。


  1. 环境配置: 参考创建的 OAUTH_SETUP.md 文件
  2. Google OAuth: 需要在Google Cloud Console配置应用
  3. GitHub OAuth: 需要在GitHub Developer Settings创建OAuth App
  4. 环境变量: 需要配置客户端ID和密钥