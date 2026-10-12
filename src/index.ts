import './config/env.js';
import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { env } from './config/env.js';
import { Server as HttpServer } from 'node:http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.routes.js';
import clientRouter from './routes/client.routes.js';
import { connectDB } from './config/db.connect.js';

const app = express();

const server = new HttpServer(app);

app.use(cors({ origin: env.CLIENT_ORIGINS, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/clients', clientRouter);

// catches anything thrown outside the controllers (e.g. bad JSON body)
// express only treats this as an error handler when it has 4 params, so _next must stay
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = typeof error?.status === 'number' ? error.status : 500;
  console.log('[server] error : ', error);
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal Server Error' : 'Bad Request',
  });
};
app.use(errorHandler);

// start listening only after the db is ready
await connectDB();

const PORT = env.PORT;
server.listen(PORT, () => console.log('🚀 Server is running on port', PORT));
