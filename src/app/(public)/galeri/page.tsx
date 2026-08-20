export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import { db } from "@/db";
import { galleries } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Galeri & Dokumentasi",
};

export default async function GaleriPage() {
  const publishedGalleries = await db.query.galleries.findMany({
    where: eq(galleries.status, 'PUBLISHED'),
    with: { 
      images: true,
      event: true,
      division: true 
    },
    orderBy: [desc(galleries.createdAt)],
  });

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20">
      <div className="bg-green-800 text-white pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Galeri Dokumentasi</h1>
          <p className="text-green-100 max-w-2xl mx-auto text-lg">Momen-momen berharga dalam kegiatan LDK Al-Hidayah.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 mt-12 md:mt-16">
        {publishedGalleries.length > 0 ? (
          <div className="space-y-16">
            {publishedGalleries.map(gallery => (
              <section key={gallery.id} className="bg-white dark:bg-slate-900 border rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b pb-4">
                  <div>
                    <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">
                      {gallery.division?.name || 'UMUM'} {gallery.event ? `• ${gallery.event.name}` : ''}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{gallery.title}</h2>
                    {gallery.description && <p className="text-gray-500 dark:text-gray-400 mt-2">{gallery.description}</p>}
                  </div>
                  <div className="mt-4 md:mt-0 text-sm text-gray-400 font-medium">
                    {new Date(gallery.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
                  </div>
                </div>

                {gallery.images && gallery.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gallery.images.map(image => (
                      <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 group cursor-pointer">
                        <Image 
                          src={image.imageUrl} 
                          alt={gallery.title} 
                          fill 
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-slate-950 rounded-lg border border-dashed">
                    <p className="text-gray-500 dark:text-gray-400">Belum ada foto dalam galeri ini.</p>
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white dark:bg-slate-900 border border-dashed rounded-xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Belum ada galeri</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Album dokumentasi belum tersedia saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}

