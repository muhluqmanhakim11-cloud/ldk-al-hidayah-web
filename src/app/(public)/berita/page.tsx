export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/public/PageHero";

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
      <PageHero
        title="Berita & Artikel"
        subtitle="Kumpulan wawasan, berita organisasi, dan tulisan keislaman"
        badge="Berita Terkini"
      />

      <div className="container mx-auto px-4 lg:px-8 mt-14">
        {publishedArticles.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.75rem",
            }}
          >
            {publishedArticles.map((article, idx) => (
              <Link
                href={`/berita/${article.slug}`}
                key={article.id}
                className="group bg-white dark:bg-slate-900 dark:border-slate-800"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "1.25rem",
                  border: "1px solid #f1f5f9",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "box-shadow 0.3s ease, transform 0.3s ease",
                  animation: `cardReveal 0.55s ${Math.min(idx * 0.08, 0.4)}s cubic-bezier(0.16,1,0.3,1) both`,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.13)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                }}
              >
                {/* Cover Image */}
                <div
                  className="bg-gray-100 dark:bg-slate-800"
                  style={{ position: "relative", height: "220px", overflow: "hidden", flexShrink: 0 }}
                >
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="group-hover:scale-105"
                      style={{ objectFit: "cover", transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                      }}
                    >
                      <svg width="40" height="40" fill="none" stroke="#86efac" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  )}
                  {/* Gradient overlay always present */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)",
                      pointerEvents: "none",
                    }}
                  />
                  {article.division && (
                    <span
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        background: "#16a34a",
                        color: "white",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        backdropFilter: "blur(4px)",
                        zIndex: 10,
                      }}
                    >
                      {article.division.name}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: "1.4rem", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3
                    className="text-gray-900 dark:text-gray-100 group-hover:text-green-700"
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      lineHeight: 1.35,
                      marginBottom: "0.6rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      transition: "color 0.2s",
                    }}
                  >
                    {article.title}
                  </h3>
                  <div
                    className="text-gray-500 dark:text-gray-400"
                    style={{
                      fontSize: "0.875rem",
                      lineHeight: 1.6,
                      marginBottom: "1.1rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      flex: 1,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: (article.content || "").substring(0, 200) + "…",
                    }}
                  />

                  {/* Author row */}
                  <div
                    className="border-gray-100 dark:border-slate-800"
                    style={{
                      borderTop: "1px solid",
                      paddingTop: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.7rem",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #16a34a, #34d399)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        flexShrink: 0,
                      }}
                    >
                      {article.author?.name ? article.author.name.charAt(0).toUpperCase() : "A"}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p
                        className="text-gray-900 dark:text-gray-100"
                        style={{ fontSize: "0.82rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {article.author?.name || "Admin"}
                      </p>
                      <p className="text-gray-400" style={{ fontSize: "0.75rem" }}>
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
                    <span
                      className="text-green-600 dark:text-green-400"
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        opacity: 0,
                        transition: "opacity 0.2s",
                        whiteSpace: "nowrap",
                      }}
                      ref={(el) => {
                        // Show arrow on parent hover via group class
                      }}
                    >
                      Baca →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <svg width="36" height="36" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-gray-700 dark:text-gray-300" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Belum ada artikel</h3>
            <p className="text-gray-400">Belum ada tulisan atau berita yang dipublikasikan.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .group:hover .group-hover\\:scale-105 { transform: scale(1.05); }
        .group:hover .group-hover\\:text-green-700 { color: #15803d; }
      `}</style>
    </div>
  );
}
