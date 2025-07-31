// lib/prisma-wp.ts
import { PrismaClient } from '../generated/wordpress-client';

declare global {  
  var prismaWp: PrismaClient | undefined;
}

export const prismaWp =
  global.prismaWp ||
  new PrismaClient({
    // Optional: log queries for debugging
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') global.prismaWp = prismaWp;