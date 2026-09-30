import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { seedDatabase } from './services/database/seed.service.js';
import { logger } from './utils/logger.js';

let server;

async function bootstrap() {
  try {
    logger.info('Initializing CareSync AI Node.js/Express Backend...');

    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Seed initial data if database is fresh
    await seedDatabase(false);

    // 3. Start server
    server = app.listen(env.PORT, () => {
      logger.info(`CareSync AI Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`Health check available at http://localhost:${env.PORT}/api/health`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown handlers
async function handleShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDatabase();
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

bootstrap();
