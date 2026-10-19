export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/db";
import { articles, divisions } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import PageHero from "@/components/public/PageHero";
import BeritaClient from "./BeritaClient";

export const metadata: Metadata = {
  title: "Berita & Artikel",
  description: "Kumpulan wawasan, berita organisasi, dan tulisan keislaman dari LDK Al-Hidayah.",
};

export default async function BeritaPage() {
  const [publishedArticles, allDivisions] = await Promise.all([
    db.query.articles.findMany({
      where: eq(articles.status, "PUBLISHED"),
      with: { author: true, division: true },
      orderBy: [desc(articles.publishedAt)],
    }),
    db.query.divisions.findMany({ orderBy: [asc(divisions.name)] }),
  ]);

  // Only include divisions that have at least one published article
  const activeDivisionIds = new Set(publishedArticles.map((a) => a.division?.id).filter(Boolean));
  const filteredDivisions = allDivisions.filter((d) => activeDivisionIds.has(d.id));

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-24">
      <PageHero
        title="Berita & Artikel"
        subtitle="Kumpulan wawasan, berita organisasi, dan tulisan keislaman"
        badge="Berita Terkini"
      />
      <div className="container mx-auto px-4 lg:px-8 mt-14">
        <BeritaClient articles={publishedArticles} divisions={filteredDivisions} />
      </div>
    </div>
  );
}
