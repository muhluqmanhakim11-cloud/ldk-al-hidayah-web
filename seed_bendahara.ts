import { db } from "./src/db/index";
import { users } from "./src/db/schema";
import { hash } from "bcryptjs";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function seedBendahara() {
  console.log("Creating Bendahara user...");

  const password = "BendaharaLDK2026!";
  const email = "bendahara.ldk@alhidayah.ac.id";

  const pwHash = await hash(password, 10);

  await db.insert(users).values({
    name: "Latifah (Bendahara)",
    email: email,
    passwordHash: pwHash,
    role: "admin_bendahara",
  }).onConflictDoNothing();

  console.log("✅ Bendahara user created!");
  console.log("─────────────────────────────────");
  console.log("  Email    : " + email);
  console.log("  Password : " + password);
  console.log("  Role     : admin_bendahara");
  console.log("─────────────────────────────────");

  process.exit(0);
}

seedBendahara().catch(console.error);
