import { db } from "./src/db";
import { siteSettings } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  await db.update(siteSettings).set({ logoUrl: "/logo-stmik.jpg" });
  console.log("Logo updated successfully.");
}

main().catch(console.error);
