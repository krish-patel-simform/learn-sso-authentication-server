import { Router } from 'express';
import * as authController from '../controllers/auth/index.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validateClient } from '../middlewares/client.middleware.js';

const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/refresh', authController.refreshTokens);
authRouter.post('/logout', authMiddleware, authController.logout);
authRouter.get('/me', authMiddleware, authController.me);

// this is main entry point for the SSO
authRouter.get('/authorize', validateClient, authController.authorize);

// this is used to verify teh token and code if every thing is correct then send the accessToken and refreshToken
authRouter.post('/token', authController.token);

export default authRouter;
