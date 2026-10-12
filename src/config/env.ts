import { config } from 'dotenv';

config();

if (!process.env.MONGO_DB_URL) {
  console.log('[env config] there is no mongo URL exist');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.log('[env config] there is no jwt secret is exist');
  process.exit(1);
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_DB_URL: process.env.MONGO_DB_URL,
  JWT_SECRET: process.env.JWT_SECRET,

  // comma separated list of frontend origins allowed to call this server with cookies
  CLIENT_ORIGINS: (process.env.CLIENT_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
