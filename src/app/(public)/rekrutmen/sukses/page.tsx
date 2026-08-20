import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pendaftaran Sukses",
};

export default function SuksesPage() {
  return (
    <div className="bg-gray-50 min-h-[70vh] flex items-center justify-center py-20">
      <div className="bg-white p-10 rounded-2xl shadow-sm border max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Pendaftaran Berhasil!</h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Terima kasih telah mendaftar. Data kamu telah berhasil kami terima. 
          Silakan tunggu informasi lebih lanjut yang akan dikirimkan melalui WhatsApp atau Email kamu.
        </p>

        <div className="space-y-4">
          <Link href="/" className="block w-full bg-green-700 text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 transition-colors">
            Kembali ke Beranda
          </Link>
          <Link href="/rekrutmen" className="block w-full bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-md hover:bg-gray-200 transition-colors">
            Lihat Informasi Rekrutmen
          </Link>
        </div>
      </div>
    </div>
  );
}
