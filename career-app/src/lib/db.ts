import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Singleton for PrismaClient to avoid exhausting database connections in development
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export { prisma };

// JSON-based local database fallback
const DB_FILE = path.join(process.cwd(), 'src/lib/meetings_db.json');

export interface LocalDBStructure {
  meetings: any[];
  attendees: any[];
  meetingNotes: any[];
  actionItems: any[];
}

export function getLocalDB(): LocalDBStructure {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify({ meetings: [], attendees: [], meetingNotes: [], actionItems: [] }, null, 2)
    );
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { meetings: [], attendees: [], meetingNotes: [], actionItems: [] };
  }
}

export function saveLocalDB(data: LocalDBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save to local JSON DB:', error);
  }
}

// Check if PostgreSQL database is connected and responsive
let _dbConnected: boolean | null = null;

export async function checkDbConnection(): Promise<boolean> {
  if (_dbConnected !== null) return _dbConnected;
  
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('postgresql://...')) {
    _dbConnected = false;
    return false;
  }
  
  try {
    // Quick probe query to check connectivity with a 1-second timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 1200))
    ]);
    _dbConnected = true;
    console.log('Successfully connected to PostgreSQL via Prisma Client.');
    return true;
  } catch (e) {
    _dbConnected = false;
    console.warn('PostgreSQL is not reachable. Falling back to local JSON database storage.');
    return false;
  }
}
