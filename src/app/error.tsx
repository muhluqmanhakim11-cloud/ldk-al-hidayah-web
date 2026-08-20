"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-sm border max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Terjadi Kesalahan</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Maaf, terjadi kesalahan sistem pada halaman ini. Silakan coba lagi.</p>
        <button
          onClick={() => reset()}
          className="inline-block bg-red-600 text-white font-bold py-3 px-6 rounded-md hover:bg-red-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
