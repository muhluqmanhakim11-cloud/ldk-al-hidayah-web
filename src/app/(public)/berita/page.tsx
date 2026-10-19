export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/public/PageHero";
import ScrollReveal from "@/components/public/ScrollReveal";

export const metadata: Metadata = {
  title: "Berita & Artikel",
  description: "Kumpulan wawasan, berita organisasi, dan tulisan keislaman dari LDK Al-Hidayah.",
};

export default async function BeritaPage() {
  const publishedArticles = await db.query.articles.findMany({
    where: eq(articles.status, "PUBLISHED"),
    with: { author: true, division: true },
    orderBy: [desc(articles.publishedAt)],
  });

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-24">
      <ScrollReveal />
      <PageHero
        title="Berita & Artikel"
        subtitle="Kumpulan wawasan, berita organisasi, dan tulisan keislaman"
        badge="Berita Terkini"
      />

      <div className="container mx-auto px-4 lg:px-8 mt-14">
        {publishedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedArticles.map((article, idx) => (
              <Link
                href={`/berita/${article.slug}`}
                key={article.id}
                className={`reveal delay-${Math.min((idx % 3) * 100 + 100, 500)} group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col`}
              >
                {/* Cover Image */}
                <div className="relative h-52 bg-gray-100 dark:bg-slate-800 w-full overflow-hidden flex-shrink-0">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-slate-600">
                      <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Tanpa Gambar</span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Division badge */}
                  {article.division && (
                    <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-sm z-10">
                      {article.division.name}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <div
                    className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-5 leading-relaxed flex-grow"
                    dangerouslySetInnerHTML={{
                      __html: (article.content || "").substring(0, 180) + "…",
                    }}
                  />

                  {/* Author + Date */}
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {article.author?.name ? article.author.name.charAt(0).toUpperCase() : "A"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                        {article.author?.name || "Admin"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              timeZone: "Asia/Jakarta",
                            })
                          : "—"}
                      </p>
                    </div>
                    <span className="ml-auto text-xs font-semibold text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Baca →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Belum ada artikel</h3>
            <p className="text-gray-400 dark:text-gray-500">Belum ada tulisan atau berita yang dipublikasikan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
