import { PrismaClient } from '@prisma/client';
import { ENV } from './env.js';

// Singleton instance in development to prevent multiple connection instances
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ENV.isDev ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

if (ENV.isDev) {
  globalForPrisma.prisma = prisma;
}

/**
 * Checks database connectivity by executing a quick query
 */
export async function checkDatabaseConnection() {
  if (!ENV.DATABASE_URL) {
    return {
      connected: false,
      message: 'DATABASE_URL is not set in environment.',
    };
  }

  const startTime = Date.now();
  try {
    // Perform heartbeat ping on PostgreSQL
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;
    return {
      connected: true,
      latencyMs,
      message: 'Successfully connected to PostgreSQL (NeonDB)',
    };
  } catch (error) {
    return {
      connected: false,
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}
