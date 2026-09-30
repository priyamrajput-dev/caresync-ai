import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8000', 10),
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
  MONGO_DB: process.env.MONGO_DB || 'caresync',
  JWT_SECRET: process.env.JWT_SECRET || 'caresync-secret-development-key-2026-secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173')
    .split(',')
    .map(o => o.trim()),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  // Vector search configuration
  ATLAS_VECTOR_INDEX_NAME: process.env.ATLAS_VECTOR_INDEX_NAME || 'vector_index',
  EMBEDDING_DIMENSION: parseInt(process.env.EMBEDDING_DIMENSION || '1536', 10),
};

