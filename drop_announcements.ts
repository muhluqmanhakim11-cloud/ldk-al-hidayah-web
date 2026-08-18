import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`TRUNCATE TABLE announcement_acknowledgments CASCADE;`);
  console.log("Truncated announcement_acknowledgments");
  process.exit(0);
}

main().catch(console.error);
