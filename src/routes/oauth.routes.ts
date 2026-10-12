import { Router } from 'express';
import * as authController from '../controllers/auth/index.js';
import { validateClient } from '../middlewares/client.middleware.js';

const oauthRouter = Router();

// valid client -> valid redirect uri -> (logged in?) -> code
oauthRouter.get('/authorize', validateClient, authController.authorize);

export default oauthRouter;
