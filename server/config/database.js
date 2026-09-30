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
    // If remote connection fails (e.g. Atlas IP whitelist restriction), try local MongoDB
    if (!mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
      logger.warn(`Could not connect to remote MongoDB: ${err.message}`);
      logger.warn('Attempting automatic fallback to local MongoDB (mongodb://127.0.0.1:27017/caresync)...');
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/caresync', {
          serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        logger.info(`Successfully connected to fallback local MongoDB: ${localConn.connection.name}`);
        
        mongoose.connection.on('error', (e) => {
          logger.error('MongoDB connection error:', e);
        });
        mongoose.connection.on('disconnected', () => {
          logger.warn('MongoDB disconnected');
          isConnected = false;
        });

        return localConn.connection;
      } catch (localErr) {
        logger.error(`Fallback to local MongoDB also failed: ${localErr.message}`);
      }
    }

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
