import { connect } from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  try {
    await connect(env.MONGO_DB_URL);
    console.log('[mongo DB] connected successfully');
  } catch (error) {
    console.log('[mongo connect] error : ', error);
    process.exit(1);
  }
}
