import { Router } from 'express';
import * as clientController from '../controllers/client/index.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const clientRouter = Router();

clientRouter.post('/', authMiddleware, clientController.registerClient);

export default clientRouter;
