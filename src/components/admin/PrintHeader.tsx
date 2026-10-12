import Image from "next/image";

interface PrintHeaderProps {
  title: string;
}

export default function PrintHeader({ title }: PrintHeaderProps) {
  return (
    <div className="hidden print:block mb-6">
      {/* KOP SURAT RESMI */}
      <div className="flex items-center gap-5 pb-3">
        <div className="w-20 h-20 shrink-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-stmik.png"
            alt="Logo STMIK IKMI"
            className="w-18 h-18 object-contain"
          />
        </div>
        <div className="flex-1 text-center pr-12">
          <h3 className="text-sm font-semibold tracking-wider text-gray-700 uppercase">
            Unit Kegiatan Mahasiswa
          </h3>
          <h1 className="text-lg font-black tracking-wide text-gray-900 uppercase">
            Lembaga Dakwah Kampus (LDK) Al-Hidayah
          </h1>
          <h2 className="text-base font-bold text-gray-800 uppercase">
            STMIK IKMI Cirebon
          </h2>
          <p className="text-[11px] text-gray-600 mt-1 leading-tight">
            Gedung Student Center STMIK IKMI Cirebon | Jl. Perjuangan No. 10B, Kesambi, Cirebon
          </p>
          <p className="text-[10px] text-gray-500 leading-tight">
            Email: halo@ldkalhidayah.com | Instagram: @ldkalhidayah
          </p>
        </div>
      </div>

      {/* GARIS GANDA KHAS KOP SURAT RESMI */}
      <div className="border-b-2 border-black"></div>
      <div className="border-b border-black mt-[1.5px] mb-4"></div>

      {/* JUDUL DOKUMEN LAPORAN */}
      <div className="text-center mb-4">
        <h2 className="text-base font-bold text-gray-900 underline uppercase tracking-wide">
          {title}
        </h2>
        <p className="text-xs text-gray-600 mt-0.5">
          Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
