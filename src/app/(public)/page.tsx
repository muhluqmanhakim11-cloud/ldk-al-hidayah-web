export const dynamic = 'force-dynamic';
import Link from "next/link";
import { db } from "@/db";
import { events, articles, runningTexts } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import Image from "next/image";
import JadwalSholat from "@/components/public/JadwalSholat";
import FiturCepat from "@/components/public/FiturCepat";
import PopupBanner from "@/components/public/PopupBanner";

export default async function HomePage() {
  const settings = await db.query.siteSettings.findFirst();

  const latestEvents = await db.query.events.findMany({
    where: eq(events.status, 'PUBLISHED'), // Or UPCOMING if you prefer
    orderBy: [desc(events.date)],
    limit: 3,
    with: { division: true },
  });

  const activeRunningTexts = await db.query.runningTexts.findMany({
    where: eq(runningTexts.isActive, true),
    orderBy: [asc(runningTexts.orderIndex)],
  });

  const latestArticles = await db.query.articles.findMany({
    where: eq(articles.status, 'PUBLISHED'),
    orderBy: [desc(articles.publishedAt)],
    limit: 3,
  });

  return (
    <div className="bg-gray-50">
      {settings?.popupEnabled && settings?.popupImage && (
        <PopupBanner imageUrl={settings.popupImage} duration={settings.popupDuration} />
      )}
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-green-900 to-green-800 text-white">
        <div className="absolute inset-0 z-0 opacity-[0.15] bg-[url('https://res.cloudinary.com/gtlcl9a0/image/upload/v1/ldk-alhidayah/galleries/hero-placeholder')] bg-cover bg-center mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-green-50 font-semibold text-sm mb-4 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block mr-2"></span>
              UKM Kerohanian Islam STMIK IKMI
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Langkah Pasti Menuju <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-yellow-200">Kampus Madani</span>
            </h1>
            <p className="text-lg md:text-xl text-green-50/90 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Wadah pembinaan mahasiswa muslim STMIK IKMI Cirebon untuk mengembangkan potensi spiritual, intelektual, dan sosial.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/rekrutmen" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-green-900 font-bold hover:scale-105 hover:shadow-xl transition-all duration-300 active:scale-95 shadow-lg shadow-white/10">
                Bergabung Sekarang
              </Link>
              <Link href="/profil" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/10 border border-white/30 backdrop-blur-sm text-white font-semibold hover:bg-white/20 transition-all duration-300 active:scale-95">
                Kenali Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Jadwal Sholat */}
      <JadwalSholat />

      {/* Ticker / Running Text */}
      <section className="pt-12 pb-6 bg-gray-50 dark:bg-slate-900 border-b border-gray-200/60 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-bold px-3 py-1.5 rounded-md shrink-0 uppercase tracking-widest shadow-sm border border-green-200 dark:border-green-800">
              Update
            </div>
            <div className="relative flex overflow-x-hidden w-full whitespace-nowrap mask-linear-fade items-center">
              <div className="animate-marquee inline-block text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200">
                {activeRunningTexts.length > 0 
                  ? activeRunningTexts.map(t => t.text).join(' \u00A0\u00A0\u2022\u00A0\u00A0 ')
                  : "🚀 Selamat datang di Website Resmi LDK Al-Hidayah STMIK IKMI Cirebon"
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <FiturCepat />

      {/* Kegiatan Terbaru */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800/50 transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Kegiatan Terdekat</h2>
              <p className="text-gray-500 dark:text-gray-400">Ikuti berbagai kegiatan seru dari LDK Al-Hidayah.</p>
            </div>
            <Link href="/kegiatan" className="hidden sm:block text-green-600 dark:text-green-400 font-medium hover:underline">
              Lihat Semua &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestEvents.length > 0 ? latestEvents.map(event => (
              <div key={event.id} className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="p-6">
                  <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">{event.division?.name || 'UMUM'}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-700 transition-colors">{event.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {event.date ? new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }) : '-'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {event.location || '-'}
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                <p className="text-gray-500">Belum ada kegiatan yang dipublikasikan.</p>
              </div>
            )}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/kegiatan" className="text-green-600 font-medium hover:underline">
              Lihat Semua Kegiatan &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Berita Terbaru */}
      <section className="py-20 bg-gray-50 border-t">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Berita & Artikel</h2>
              <p className="text-gray-500">Kabar terbaru seputar organisasi dan artikel keislaman.</p>
            </div>
            <Link href="/berita" className="hidden sm:block text-green-600 font-medium hover:underline">
              Lihat Semua &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestArticles.length > 0 ? latestArticles.map(article => (
              <Link href={`/berita/${article.slug}`} key={article.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col">
                <div className="relative h-48 bg-gray-200 w-full">
                  {article.coverImage ? (
                    <Image src={article.coverImage} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="text-xs text-gray-500 mb-2">
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }) : '-'}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors line-clamp-2">{article.title}</h3>
                  <div className="text-sm text-gray-600 line-clamp-3 mb-4" dangerouslySetInnerHTML={{ __html: (article.content || "").substring(0, 150) + "..." }} />
                  <div className="mt-auto text-green-600 font-medium text-sm inline-flex items-center">
                    Baca selengkapnya <span className="ml-1 transition-transform group-hover:translate-x-1">&rarr;</span>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed">
                <p className="text-gray-500">Belum ada berita yang dipublikasikan.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

