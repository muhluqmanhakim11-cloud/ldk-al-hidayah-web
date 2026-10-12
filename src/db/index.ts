import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV !== 'production') {
  throw new Error('DATABASE_URL must be a Neon postgres connection string');
}

const sql = neon(databaseUrl || '');
export const db = drizzle(sql, { schema });
