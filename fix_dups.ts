import { db } from './src/db';
import { members } from './src/db/schema';

async function main() {
  const allMembers = await db.select().from(members);
  const seen = new Set();
  const duplicateIds = [];

  for (const m of allMembers) {
    const key = `${m.name}-${m.periodId}`;
    if (seen.has(key)) {
      duplicateIds.push(m.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`Found ${duplicateIds.length} duplicates to delete.`);
  
  if (duplicateIds.length > 0) {
    for (const id of duplicateIds) {
       // Using raw drizzle might be easier, but simple loop is fine for few records
       await db.delete(members).where(require('drizzle-orm').eq(members.id, id));
    }
    console.log('Duplicates deleted.');
  }
}

main().catch(console.error);
