import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function getDirectUrl(): string {
  const dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.startsWith('prisma+postgres://')) {
    const apiKey = new URL(dbUrl).searchParams.get('api_key')!;
    const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString());
    return decoded.databaseUrl;
  }
  return dbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg(getDirectUrl());
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
