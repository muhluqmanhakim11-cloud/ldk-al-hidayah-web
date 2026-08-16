import { eq } from 'drizzle-orm';
import { db } from './src/db';
import { users } from './src/db/schema';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function updateSuperAdmins() {
  console.log("Updating Super Admins...");
  
  // Update Ketua Umum
  await db.update(users)
    .set({ name: 'Muhammad Luqman Hakim' })
    .where(eq(users.email, 'ketua.ldk@alhidayah.ac.id'));

  // Update Sekretaris
  await db.update(users)
    .set({ name: 'Pariz Hapis Zudin' })
    .where(eq(users.email, 'sekretaris.ldk@alhidayah.ac.id'));

  console.log("Super Admins updated successfully!");
  process.exit(0);
}

updateSuperAdmins().catch(console.error);
