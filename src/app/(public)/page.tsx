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
    with: { author: true },
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
      <section className="py-20 bg-gradient-to-b from-white to-green-50/50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full mb-3">Agenda Organisasi</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Kegiatan Terdekat</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg">Ikuti berbagai kegiatan seru dan bermanfaat dari LDK Al-Hidayah.</p>
            </div>
            <Link href="/kegiatan" className="group flex items-center text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300 transition-colors">
              Lihat Semua <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestEvents.length > 0 ? latestEvents.map(event => (
              <div key={event.id} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="p-6 md:p-8">
                  <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3">{event.division?.name || 'UMUM'}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">{event.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 line-clamp-2 leading-relaxed">{event.description}</p>
                  
                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg">
                      <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {event.date ? new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }) : '-'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg">
                      <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="line-clamp-1">{event.location || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full flex flex-col items-center justify-center text-center py-16 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Belum Ada Kegiatan</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">Saat ini belum ada agenda kegiatan yang dipublikasikan. Pantau terus info selanjutnya!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Berita Terbaru */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-full mb-3">Informasi Terkini</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Berita & Artikel</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg">Kabar terbaru seputar pergerakan organisasi dan bacaan keislaman inspiratif.</p>
            </div>
            <Link href="/berita" className="group flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              Lihat Semua <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestArticles.length > 0 ? latestArticles.map(article => (
              <Link href={`/berita/${article.slug}`} key={article.id} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                <div className="relative h-56 bg-gray-200 dark:bg-slate-700 w-full overflow-hidden">
                  {article.coverImage ? (
                    <Image src={article.coverImage} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-800/80">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                </div>
                <div className="p-6 md:p-8 flex-grow flex flex-col">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }) : '-'}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">{article.title}</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4" dangerouslySetInnerHTML={{ __html: (article.content || "").substring(0, 150) + "..." }} />
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 mr-2 text-xs font-bold">
                        {(article.author?.name || 'A').charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{article.author?.name || 'Admin'}</span>
                    </div>
                    <div className="text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center">
                      Baca <span className="ml-1 transition-transform group-hover:translate-x-1">&rarr;</span>
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-full flex flex-col items-center justify-center text-center py-16 bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-.586-1.414l-4.586-4.586A2 2 0 0012.586 3H12" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Belum Ada Berita</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">Belum ada berita atau artikel yang dipublikasikan saat ini.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

