import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Organisasi",
};

export default function ProfilPage() {
  return (
    <div className="bg-white pb-20">
      {/* Page Header */}
      <div className="bg-green-800 text-white pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Profil Organisasi</h1>
          <p className="text-green-100 max-w-2xl mx-auto text-lg">Mengenal lebih dekat Lembaga Dakwah Kampus Al-Hidayah.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 mt-12 md:mt-16">
        <div className="max-w-4xl mx-auto space-y-12 text-gray-700 leading-relaxed text-lg">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Sejarah Singkat</h2>
            <p className="mb-4">
              LDK Al-Hidayah didirikan pada tahun 2005 dengan tujuan awal menjadi wadah silaturahmi mahasiswa Muslim di lingkungan kampus. Seiring berjalannya waktu, organisasi ini berkembang menjadi pusat kegiatan kerohanian dan pengembangan diri yang berlandaskan nilai-nilai keislaman.
            </p>
            <p>
              Dengan semangat mencetak generasi robbani, LDK Al-Hidayah terus berinovasi dalam menyebarkan nilai kebaikan, harmoni, dan prestasi akademik maupun non-akademik.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Visi</h2>
            <div className="bg-green-50 p-6 rounded-lg text-center font-semibold text-xl text-green-800 shadow-sm border border-green-100">
              "Terwujudnya Kampus Madani yang berlandaskan nilai-nilai keislaman dan mencetak generasi unggul yang berakhlak mulia."
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Misi</h2>
            <ul className="space-y-4 list-none pl-0">
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold mr-4">1</span>
                <span>Menyelenggarakan kegiatan pembinaan keislaman yang komprehensif bagi seluruh elemen kampus.</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold mr-4">2</span>
                <span>Membangun ukhuwah islamiyah dan solidaritas antar mahasiswa Muslim.</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold mr-4">3</span>
                <span>Menumbuhkan semangat kepedulian sosial dan advokasi kemahasiswaan.</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold mr-4">4</span>
                <span>Meningkatkan kapasitas kepemimpinan dan profesionalitas pengurus.</span>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
