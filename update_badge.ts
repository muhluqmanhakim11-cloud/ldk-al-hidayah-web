import { db } from "./src/db";
import { siteSettings } from "./src/db/schema";

async function main() {
  const url = "https://deploy-badge.vercel.app/?url=https://ldk-al-hidayah.vercel.app";
  const settings = await db.query.siteSettings.findFirst();
  if (settings) {
    await db.update(siteSettings).set({ vercelBadgeUrl: url });
    console.log("Updated existing settings with vercel badge URL");
  } else {
    await db.insert(siteSettings).values({ vercelBadgeUrl: url });
    console.log("Created new settings with vercel badge URL");
  }
  process.exit(0);
}

main().catch(console.error);
