import { Router } from 'express';
import * as authController from '../controllers/auth/index.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/refresh', authController.refreshTokens);
authRouter.post('/logout', authMiddleware, authController.logout);
// authRouter.get('/me', authMiddleware, authController.me);

export default authRouter;
