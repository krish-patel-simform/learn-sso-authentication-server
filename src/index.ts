import './config/env.js';
import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { env } from './config/env.js';
import { Server as HttpServer } from 'node:http';
import path from 'node:path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.routes.js';
import clientRouter from './routes/client.routes.js';
import oauthRouter from './routes/oauth.routes.js';
import { connectDB } from './config/db.connect.js';
import { AUTH_BASE_PATH, OAUTH_BASE_PATH } from './constants/auth.constant.js';

const app = express();

const server = new HttpServer(app);

app.use(cors({ origin: env.CLIENT_ORIGINS, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// serves the login / register pages (and their js + css) from the public folder:
// /login -> public/login.html, /register -> public/register.html.
// it must be the same server (same origin) so the cookies from the login api are saved for this domain.
// ../public works from both src/ (dev) and dist/ (build)
app.use(express.static(path.join(import.meta.dirname, '../public'), { extensions: ['html'] }));

app.use(AUTH_BASE_PATH, authRouter);
app.use(OAUTH_BASE_PATH, oauthRouter);
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
