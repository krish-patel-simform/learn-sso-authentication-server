import { Router } from 'express';
import * as clientController from '../controllers/client/index.js';

const clientRouter = Router();

clientRouter.post('/', clientController.registerClient);

export default clientRouter;
