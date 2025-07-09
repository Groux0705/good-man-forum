import express from 'express';
import { register, login, registerValidation } from '../controllers/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, login);

export default router;