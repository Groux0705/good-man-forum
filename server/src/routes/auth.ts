import express from 'express';
import { register, login, registerValidation, forgotPassword, resetPassword } from '../controllers/auth';
import { authLimiter } from '../middleware/rateLimiter';
import passport from '../config/passport';
import { generateToken } from '../utils/auth';

const router = express.Router();

// 传统认证路由
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Google OAuth路由
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user.id);
    
    // 重定向到前端，携带token
    res.redirect(`${process.env.CLIENT_URL}/login/callback?token=${token}`);
  }
);

// GitHub OAuth路由
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user.id);
    
    // 重定向到前端，携带token
    res.redirect(`${process.env.CLIENT_URL}/login/callback?token=${token}`);
  }
);

export default router;