export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/db";
import { galleries } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import GalleryGridClient from "./GalleryGridClient";
import PageHero from "@/components/public/PageHero";

export const metadata: Metadata = {
  title: "Galeri & Dokumentasi",
  description: "Momen-momen berharga dalam kegiatan LDK Al-Hidayah.",
};

export default async function GaleriPage() {
  const publishedGalleries = await db.query.galleries.findMany({
    where: eq(galleries.status, "PUBLISHED"),
    with: { images: true, event: true, division: true },
    orderBy: [desc(galleries.createdAt)],
  });

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-24">
      <PageHero
        title="Galeri Dokumentasi"
        subtitle="Momen-momen berharga dalam perjalanan LDK Al-Hidayah"
        badge="Dokumentasi"
      />

      <div className="container mx-auto px-4 lg:px-8 mt-14">
        {publishedGalleries.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            {publishedGalleries.map((gallery, idx) => (
              <section
                key={gallery.id}
                style={{
                  animation: `cardReveal 0.6s ${Math.min(idx * 0.1, 0.4)}s cubic-bezier(0.16,1,0.3,1) both`,
                }}
              >
                <div
                  className="bg-white dark:bg-slate-900 dark:border-slate-800"
                  style={{
                    borderRadius: "1.5rem",
                    border: "1px solid #f1f5f9",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Gradient strip */}
                  <div
                    style={{
                      height: "5px",
                      background: `linear-gradient(90deg, #16a34a, #34d399, #22c55e, #86efac)`,
                    }}
                  />

                  {/* Album header */}
                  <div
                    className="border-gray-100 dark:border-slate-800"
                    style={{
                      padding: "1.5rem 1.75rem",
                      borderBottom: "1px solid",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      {/* Meta breadcrumb */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "#16a34a",
                            background: "rgba(22,163,74,0.1)",
                            borderRadius: "9999px",
                            padding: "3px 10px",
                          }}
                        >
                          {gallery.division?.name || "Umum"}
                        </span>
                        {gallery.event && (
                          <>
                            <span className="text-gray-300 dark:text-slate-600" style={{ fontSize: "0.75rem" }}>•</span>
                            <span
                              className="text-gray-500 dark:text-gray-400"
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 500,
                                background: "#f8fafc",
                                borderRadius: "9999px",
                                padding: "3px 10px",
                              }}
                            >
                              {gallery.event.name}
                            </span>
                          </>
                        )}
                      </div>
                      <h2
                        className="text-gray-900 dark:text-gray-100"
                        style={{ fontSize: "1.35rem", fontWeight: 800, lineHeight: 1.25 }}
                      >
                        {gallery.title}
                      </h2>
                      {gallery.description && (
                        <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: "0.875rem", marginTop: "0.35rem", lineHeight: 1.5 }}>
                          {gallery.description}
                        </p>
                      )}
                    </div>

                    {/* Photo count */}
                    <div
                      className="bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-300"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        border: "1px solid",
                        borderRadius: "0.75rem",
                        padding: "0.5rem 1rem",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                        {gallery.images?.length ?? 0} foto
                      </span>
                    </div>
                  </div>

                  {/* Photo grid */}
                  <div style={{ padding: "1.5rem 1.75rem" }}>
                    {gallery.images && gallery.images.length > 0 ? (
                      <GalleryGridClient images={gallery.images} title={gallery.title} />
                    ) : (
                      <div
                        className="bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700"
                        style={{
                          textAlign: "center",
                          padding: "3rem 1rem",
                          borderRadius: "1rem",
                          border: "1.5px dashed",
                        }}
                      >
                        <svg width="36" height="36" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: "0 auto 0.75rem" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-400" style={{ fontSize: "0.875rem" }}>Belum ada foto dalam galeri ini.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <svg width="36" height="36" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-gray-700 dark:text-gray-300" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Belum ada galeri</h3>
            <p className="text-gray-400">Album dokumentasi belum tersedia saat ini.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
