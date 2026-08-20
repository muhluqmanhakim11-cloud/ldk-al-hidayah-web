import Link from "next/link";

export default function FiturCepat() {
  return (
    <section className="pt-12 pb-24 bg-gray-50 dark:bg-slate-950 relative z-10">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">Akses Cepat</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Pilih layanan atau informasi yang ingin Anda akses dengan cepat dan mudah.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Card (Spans 2 columns on desktop) */}
          <Link href="/rekrutmen" className="md:col-span-2 group relative overflow-hidden bg-gradient-to-br from-green-600 to-green-800 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-green-900/10 transition-all duration-300 hover:shadow-2xl hover:shadow-green-900/20 hover:-translate-y-1">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white dark:bg-slate-900/10 blur-3xl rounded-full transition-transform duration-700 group-hover:scale-150"></div>
            <div className="absolute bottom-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity duration-300 group-hover:scale-110 transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-900/20 backdrop-blur-sm rounded-xl mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold mb-3">Gabung LDK</h3>
                <p className="text-green-50 text-lg md:text-xl max-w-md font-light">
                  Mari bergabung bersama kami menjadi bagian dari penggerak dakwah kampus.
                </p>
              </div>
              <div className="mt-8">
                <span className="inline-flex items-center font-bold text-green-900 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-full text-sm group-hover:pl-6 transition-all">
                  Daftar Sekarang
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Vertical Stack of 2 Smaller Cards */}
          <div className="grid grid-cols-1 gap-6">
            <a href="https://quran.kemenag.go.id/" target="_blank" rel="noopener noreferrer" className="group bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 text-gray-50 opacity-50 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
              </div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v16"></path><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"></path></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg group-hover:text-blue-600 dark:text-blue-400 transition-colors">Al-Qur'an Online</h3>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm relative z-10">Baca Al-Qur'an dan terjemahannya dari portal resmi Kemenag RI.</p>
            </a>

            <Link href="/kegiatan" className="group bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 text-gray-50 opacity-50 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
              </div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg group-hover:text-yellow-600 transition-colors">Agenda</h3>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm relative z-10">Jadwal kegiatan dan kajian rutin yang akan datang.</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
