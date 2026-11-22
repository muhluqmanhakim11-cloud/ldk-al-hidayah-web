import { db } from "@/db";
import { reels } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import ReelsFeed from "./ReelsFeed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reels Dakwah - LDK Al-Hidayah STMIK IKMI Cirebon",
  description: "Kumpulan video pendek dakwah Islam, tausiyah, motivasi, dan inspirasi hijrah mahasiswa persembahan LDK Al-Hidayah.",
  openGraph: {
    title: "Reels Dakwah - LDK Al-Hidayah",
    description: "Tonton video pendek dakwah dan inspirasi Islam seputar kampus dan kehidupan sehari-hari.",
  },
};

export const revalidate = 60; // ISR 60 detik fallback, instant on-demand via revalidatePublic

export default async function ReelsPage() {
  const publishedReels = await db
    .select({
      id: reels.id,
      title: reels.title,
      description: reels.description,
      speaker: reels.speaker,
      isLdkDai: reels.isLdkDai,
      videoUrl: reels.videoUrl,
      thumbnailUrl: reels.thumbnailUrl,
      duration: reels.duration,
      likesCount: reels.likesCount,
      viewsCount: reels.viewsCount,
      createdAt: reels.createdAt,
    })
    .from(reels)
    .where(eq(reels.status, "PUBLISHED"))
    .orderBy(asc(reels.orderIndex), desc(reels.createdAt));

  return <ReelsFeed initialReels={publishedReels} />;
}

