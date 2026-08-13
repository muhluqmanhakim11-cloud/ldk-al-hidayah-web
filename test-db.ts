import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkConnection() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('ep-example')) {
    console.error("DATABASE_URL is not set correctly.");
    process.exit(1);
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT version()`;
    
    // Test drizzle connection as well
    const { drizzle } = await import('drizzle-orm/neon-http');
    const { sql: dSql } = await import('drizzle-orm');
    const db = drizzle(sql);
    const drizzleResult = await db.execute(dSql`SELECT current_database()`);

    console.log("SUCCESS: Connection to Neon PostgreSQL established.");
    console.log("PostgreSQL Version:", result[0].version);
    console.log("Connected Database:", drizzleResult.rows[0].current_database);
    console.log("Drizzle ORM is working perfectly!");
  } catch (error) {
    console.error("FAILED: Connection to Neon PostgreSQL failed.");
    console.error(error);
    process.exit(1);
  }
}

checkConnection();
