import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export async function connectDatabase() {
  if (isConnected) return mongoose.connection;

  const mongoUri = env.MONGO_URL.endsWith('/')
    ? `${env.MONGO_URL}${env.MONGO_DB}`
    : `${env.MONGO_URL}/${env.MONGO_DB}`;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    logger.info(`MongoDB connected successfully to database: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    return conn.connection;
  } catch (err) {
    logger.error(`Failed to connect to MongoDB at ${mongoUri}:`, err.message);
    throw err;
  }
}

export async function disconnectDatabase() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected cleanly');
}
