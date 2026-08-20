import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Halaman Tidak Ditemukan",
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-sm border max-w-lg w-full text-center">
        <h1 className="text-6xl font-black text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
        <Link href="/" className="inline-block bg-green-700 text-white font-bold py-3 px-6 rounded-md hover:bg-green-600 transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
