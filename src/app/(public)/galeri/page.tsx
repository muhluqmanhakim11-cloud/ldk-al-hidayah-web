export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/db";
import { galleries } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import GalleryGridClient from "./GalleryGridClient";
import PageHero from "@/components/public/PageHero";
import ScrollReveal from "@/components/public/ScrollReveal";

export const metadata: Metadata = {
  title: "Galeri & Dokumentasi",
  description: "Momen-momen berharga dalam kegiatan LDK Al-Hidayah.",
};

export default async function GaleriPage() {
  const publishedGalleries = await db.query.galleries.findMany({
    where: eq(galleries.status, "PUBLISHED"),
    with: {
      images: true,
      event: true,
      division: true,
    },
    orderBy: [desc(galleries.createdAt)],
  });

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-24">
      <ScrollReveal />
      <PageHero
        title="Galeri Dokumentasi"
        subtitle="Momen-momen berharga dalam perjalanan LDK Al-Hidayah"
        badge="Dokumentasi"
      />

      <div className="container mx-auto px-4 lg:px-8 mt-14">
        {publishedGalleries.length > 0 ? (
          <div className="space-y-14">
            {publishedGalleries.map((gallery, idx) => (
              <section
                key={gallery.id}
                className={`reveal delay-${Math.min(idx * 100, 400)}`}
              >
                {/* Album header card */}
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  {/* Colored top strip */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400" />

                  {/* Header content */}
                  <div className="px-6 md:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800">
                    <div>
                      {/* Breadcrumb-style meta */}
                      <div className="flex items-center gap-2 text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">
                        <span className="bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
                          {gallery.division?.name || "Umum"}
                        </span>
                        {gallery.event && (
                          <>
                            <span className="text-gray-300 dark:text-slate-600">•</span>
                            <span className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-medium normal-case tracking-normal px-2.5 py-1 rounded-full">
                              {gallery.event.name}
                            </span>
                          </>
                        )}
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {gallery.title}
                      </h2>
                      {gallery.description && (
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm leading-relaxed">
                          {gallery.description}
                        </p>
                      )}
                    </div>
                    {/* Photo count badge */}
                    <div className="flex-shrink-0 flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {gallery.images?.length ?? 0} foto
                      </span>
                    </div>
                  </div>

                  {/* Photo grid */}
                  <div className="p-6 md:p-8">
                    {gallery.images && gallery.images.length > 0 ? (
                      <GalleryGridClient images={gallery.images} title={gallery.title} />
                    ) : (
                      <div className="text-center py-10 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                        <svg className="mx-auto w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">Belum ada foto dalam galeri ini.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Belum ada galeri</h3>
            <p className="text-gray-400 dark:text-gray-500">Album dokumentasi belum tersedia saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
