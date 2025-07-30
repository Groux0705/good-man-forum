import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/auth';

const prisma = new PrismaClient();

// Google OAuth配置
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: any) => {
    try {
      // 检查是否已存在该Google用户
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { providerId: profile.id, provider: 'google' },
            { email: profile.emails?.[0]?.value }
          ]
        }
      });

      if (user) {
        // 如果用户存在但provider不是google，更新为google
        if (user.provider !== 'google') {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              provider: 'google',
              providerId: profile.id,
              avatar: profile.photos?.[0]?.value || user.avatar
            }
          });
        }
      } else {
        // 创建新用户
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email provided by Google'), false);
        }

        // 生成唯一用户名
        let username = profile.displayName?.replace(/\s+/g, '_').toLowerCase() || 'user';
        let counter = 1;
        while (await prisma.user.findUnique({ where: { username } })) {
          username = `${profile.displayName?.replace(/\s+/g, '_').toLowerCase() || 'user'}_${counter}`;
          counter++;
        }

        user = await prisma.user.create({
          data: {
            username,
            email,
            provider: 'google',
            providerId: profile.id,
            avatar: profile.photos?.[0]?.value,
            emailVerified: true // Google账户默认邮箱已验证
          }
        });
      }

      return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, false);
    }
  }
));

// GitHub OAuth配置
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: "/api/auth/github/callback",
    scope: ['user:email']  // 明确请求邮箱权限
  },
  async (accessToken: string, refreshToken: string, profile: GitHubProfile, done: any) => {
    try {
      // 如果profile没有邮箱，使用GitHub API获取
      let email = profile.emails?.[0]?.value;
      
      if (!email) {
        try {
          // 使用访问令牌调用GitHub API获取邮箱
          const fetch = (await import('node-fetch')).default;
          const response = await fetch('https://api.github.com/user/emails', {
            headers: {
              'Authorization': `token ${accessToken}`,
              'User-Agent': 'Good-Man-Forum'
            }
          });
          
          if (response.ok) {
            const emails = await response.json() as any[];
            // 优先使用主邮箱或已验证的邮箱
            const primaryEmail = emails.find(e => e.primary) || emails.find(e => e.verified) || emails[0];
            email = primaryEmail?.email;
          }
        } catch (apiError) {
          console.error('Error fetching GitHub emails:', apiError);
        }
      }

      // 检查是否已存在该GitHub用户
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { providerId: profile.id, provider: 'github' },
            ...(email ? [{ email }] : [])
          ]
        }
      });

      if (user) {
        // 如果用户存在但provider不是github，更新为github
        if (user.provider !== 'github') {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              provider: 'github',
              providerId: profile.id,
              avatar: profile.photos?.[0]?.value || user.avatar
            }
          });
        }
      } else {
        // 创建新用户
        if (!email) {
          // 如果仍然没有邮箱，生成一个临时邮箱
          email = `github_${profile.id}@github.local`;
          console.warn(`GitHub user ${profile.username} has no public email, using temporary: ${email}`);
        }

        // 生成唯一用户名，优先使用GitHub用户名
        let username = profile.username || profile.displayName?.replace(/\s+/g, '_').toLowerCase() || 'user';
        let counter = 1;
        while (await prisma.user.findUnique({ where: { username } })) {
          username = `${profile.username || 'user'}_${counter}`;
          counter++;
        }

        user = await prisma.user.create({
          data: {
            username,
            email,
            provider: 'github',
            providerId: profile.id,
            avatar: profile.photos?.[0]?.value,
            emailVerified: true // GitHub账户默认邮箱已验证
          }
        });
      }

      return done(null, user);
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return done(error, false);
    }
  }
));

// 序列化用户
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// 反序列化用户
passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        provider: true,
        role: true,
        balance: true,
        level: true,
        createdAt: true
      }
    });
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});

export default passport;