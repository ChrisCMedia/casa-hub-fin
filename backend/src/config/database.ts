import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'info', 'warn'] : ['error'],
});

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Log slow queries in development
if (process.env.NODE_ENV === 'development') {
  // Temporarily disable query logging to avoid TypeScript issues
  // prisma.$on('query', (e: any) => {
  //   if (e.duration > 1000) {
  //     logger.warn(`Slow query detected: ${e.duration}ms`, {
  //       query: e.query,
  //       params: e.params,
  //     });
  //   }
  // });
}

export default prisma;