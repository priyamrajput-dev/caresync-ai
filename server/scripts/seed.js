import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { seedDatabase } from '../services/database/seed.service.js';
import { logger } from '../utils/logger.js';

async function runSeed() {
  try {
    await connectDatabase();
    await seedDatabase(true);
    logger.info('Database seeded successfully.');
  } catch (err) {
    logger.error('Seeding failed:', err);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

runSeed();
