import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_refresh',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
};

export const validateEnv = () => {
  if (!ENV.DATABASE_URL) {
    console.warn(
      '\x1b[33m[WARN] DATABASE_URL is not defined in the environment. Set it in server/.env for Neon PostgreSQL connectivity.\x1b[0m'
    );
  }
};
