import { Router } from 'express';
import * as authController from '../controllers/auth/index.js';
import { validateClient } from '../middlewares/client.middleware.js';

const oauthRouter = Router();

// this is main entry point for the SSO: valid client -> valid redirect uri -> (logged in?) -> code
oauthRouter.get('/authorize', validateClient, authController.authorize);

// this is used to verify teh token and code if every thing is correct then send the accessToken and refreshToken
oauthRouter.post('/token', authController.token);

export default oauthRouter;
