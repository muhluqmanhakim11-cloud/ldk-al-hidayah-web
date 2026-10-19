export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import PageHero from "@/components/public/PageHero";
import KegiatanClient from "./KegiatanClient";

export const metadata: Metadata = {
  title: "Kegiatan & Agenda",
  description: "Informasi terbaru mengenai agenda dan kegiatan LDK Al-Hidayah.",
};

export default async function KegiatanPage() {
  const publishedEvents = await db.query.events.findMany({
    where: eq(events.status, "PUBLISHED"),
    with: { division: true },
    orderBy: [desc(events.date)],
  });

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-24">
      <PageHero
        title="Kegiatan & Agenda"
        subtitle="Informasi terbaru mengenai agenda kegiatan LDK Al-Hidayah"
        badge="Agenda"
      />
      <div className="container mx-auto px-4 lg:px-8 mt-14">
        <KegiatanClient events={publishedEvents} />
      </div>
    </div>
  );
}
