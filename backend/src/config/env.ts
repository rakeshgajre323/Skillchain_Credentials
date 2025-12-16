import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root (or project root depending on run context)
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/skillchain?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_12345',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL not set in env, using default local docker URL');
}