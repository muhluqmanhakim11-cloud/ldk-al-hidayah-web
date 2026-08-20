export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { periods, divisions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Pendaftaran Anggota Baru",
};

export default async function RecruitmentLandingPage() {
  const activePeriod = await db.query.periods.findFirst({
    where: eq(periods.isActive, true),
    orderBy: (p, { desc }) => [desc(p.id)],
  });

  const isRecruitmentOpen = activePeriod?.isRecruitmentOpen ?? false;

  const activeDivisions = activePeriod 
    ? await db.query.divisions.findMany({
        where: eq(divisions.periodId, activePeriod.id),
        orderBy: [asc(divisions.name)],
      })
    : [];

  return (
    <div className="bg-gray-50 dark:bg-slate-950 pb-20">
      {/* Hero Section */}
      <section className="relative bg-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 bg-[url('https://res.cloudinary.com/gtlcl9a0/image/upload/v1/ldk-alhidayah/galleries/hero-placeholder')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-green-900 to-transparent z-10" />
        
        <div className="container relative z-20 mx-auto px-4 lg:px-8 pt-32 pb-24 md:pt-40 md:pb-32 flex flex-col items-center text-center">
          <div className="inline-block bg-green-600/30 border border-green-500 rounded-full px-4 py-1 text-sm font-semibold mb-6 backdrop-blur-sm">
            {isRecruitmentOpen ? "🟢 PENDAFTARAN DIBUKA" : "🔴 PENDAFTARAN DITUTUP"}
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            Saatnya Ambil Peran.<br />
            <span className="text-green-400">Gabung LDK Al-Hidayah!</span>
          </h1>
          <p className="text-lg md:text-xl text-green-50 max-w-2xl mb-10 leading-relaxed opacity-90">
            Jadilah bagian dari pergerakan dakwah kampus. Kembangkan diri, raih prestasi, dan temukan keluarga baru yang akan membersamaimu dalam kebaikan.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {isRecruitmentOpen ? (
              <Link href="/rekrutmen/daftar" className="bg-white dark:bg-slate-900 text-green-900 px-8 py-4 rounded-full font-bold hover:bg-green-50 dark:bg-green-900/30 hover:scale-105 transition-all shadow-xl text-center">
                Daftar Sekarang &rarr;
              </Link>
            ) : (
              <button disabled className="bg-gray-600 text-gray-300 px-8 py-4 rounded-full font-bold cursor-not-allowed shadow-xl text-center">
                Pendaftaran Sedang Ditutup
              </button>
            )}
            <a href="#why-us" className="bg-green-800/80 border border-green-600 text-white px-8 py-4 rounded-full font-bold hover:bg-green-700 backdrop-blur-sm transition-all shadow-lg text-center">
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Mengapa Harus Bergabung?</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Bukan sekadar organisasi, kami menawarkan ekosistem pengembangan diri yang komprehensif.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-green-50 dark:bg-green-900/30 rounded-2xl border border-green-100 text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white rotate-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Tarbiyah & Kerohanian</h3>
              <p className="text-gray-600 dark:text-gray-400">Perkuat iman dan pengetahuan agama Islam melalui kajian rutin, tahsin, dan mentoring eksklusif.</p>
            </div>
            
            <div className="p-8 bg-green-50 dark:bg-green-900/30 rounded-2xl border border-green-100 text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white -rotate-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Networking Solid</h3>
              <p className="text-gray-600 dark:text-gray-400">Bangun relasi dengan mahasiswa berprestasi dari berbagai fakultas dan alumni yang tersebar luas.</p>
            </div>

            <div className="p-8 bg-green-50 dark:bg-green-900/30 rounded-2xl border border-green-100 text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white rotate-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Upgrade Kapasitas</h3>
              <p className="text-gray-600 dark:text-gray-400">Pelatihan kepemimpinan, public speaking, desain, jurnalistik, dan manajemen event.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Divisions Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-950 border-t">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Pilih Bidang Kesukaanmu</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Temukan wadah aktualisasi diri yang paling sesuai dengan passion dan potensimu.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDivisions.length > 0 ? activeDivisions.map(div => (
              <div key={div.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border hover:border-green-400 hover:shadow-md transition-all group">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 text-green-700 dark:text-green-400 rounded-full flex items-center justify-center font-bold mr-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    {div.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-700 dark:text-green-400 transition-colors">{div.name}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                  {div.description || "Bidang strategis yang berfokus pada eksekusi program unggulan organisasi secara profesional dan berdampak."}
                </p>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-500 dark:text-gray-400 p-8 border border-dashed rounded-xl">
                Belum ada data bidang.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Timeline & Persyaratan */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 border-b-4 border-green-500 inline-block pb-2">Timeline Rekrutmen</h2>
              <div className="relative border-l-2 border-green-200 ml-3 md:ml-6 mt-8 space-y-10">
                <div className="relative pl-8">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 ring-4 ring-white"></span>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Pendaftaran Online</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Mengisi formulir melalui website resmi.</p>
                </div>
                <div className="relative pl-8">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-300 ring-4 ring-white"></span>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Seleksi Berkas</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Peninjauan dan validasi oleh Admin Bidang.</p>
                </div>
                <div className="relative pl-8">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-300 ring-4 ring-white"></span>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Wawancara (Opsional)</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sesi pengenalan lebih lanjut via online/offline.</p>
                </div>
                <div className="relative pl-8">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-300 ring-4 ring-white"></span>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Pengumuman Kelulusan</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Disampaikan melalui WhatsApp dan Email.</p>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-gray-50 dark:bg-slate-950 p-8 rounded-2xl border">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Persyaratan Umum
              </h2>
              <ul className="space-y-4 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✔</span> Mahasiswa aktif STMIK IKMI Cirebon semester 1-4.
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✔</span> Beragama Islam.
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✔</span> Memiliki minat dan komitmen kuat dalam dakwah kampus.
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✔</span> Bersedia mengikuti rangkaian kaderisasi (Tarbiyah).
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3">✔</span> Pas foto terbaru (Formal / Bebas Rapi).
                </li>
              </ul>

              <div className="mt-10 pt-8 border-t text-center">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Punya pertanyaan lain?</h3>
                <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="text-green-600 font-bold hover:underline">Hubungi Narahubung Kami</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="bg-green-800 text-white py-20 text-center">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Tunggu Apa Lagi?</h2>
          <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto">Kesempatan ini tidak datang dua kali. Mulai langkah peradabanmu dari sekarang.</p>
          {isRecruitmentOpen ? (
            <Link href="/rekrutmen/daftar" className="inline-block bg-white dark:bg-slate-900 text-green-900 px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-2xl text-lg">
              Isi Formulir Pendaftaran
            </Link>
          ) : (
            <div className="inline-block bg-gray-500 text-gray-200 px-10 py-4 rounded-full font-bold shadow-2xl text-lg cursor-not-allowed">
              Pendaftaran Ditutup
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

