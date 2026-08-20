"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecruitmentForm({ divisions }: { divisions: { id: number, name: string }[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/public/recruitments", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Gagal mengirim pendaftaran");
        if (data.errors && data.errors.length > 0) {
           console.error("Validation errors:", data.errors);
        }
        setIsSubmitting(false);
        return;
      }

      router.push("/rekrutmen/sukses");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan, silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border max-w-2xl mx-auto my-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center border-b pb-4">Formulir Pendaftaran</h2>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 text-sm border border-red-200">
          <strong>Pendaftaran Gagal:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></label>
          <input type="text" id="name" name="name" required className="w-full border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border" placeholder="John Doe" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1" htmlFor="nim">NIM <span className="text-red-500">*</span></label>
            <input type="text" id="nim" name="nim" required pattern="[0-9]+" title="Hanya angka" className="w-full border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border" placeholder="1301234567" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1" htmlFor="semester">Semester Saat Ini <span className="text-red-500">*</span></label>
            <input type="number" id="semester" name="semester" required min="1" max="14" className="w-full border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border" placeholder="1" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1" htmlFor="studyProgram">Program Studi <span className="text-red-500">*</span></label>
          <input type="text" id="studyProgram" name="studyProgram" required className="w-full border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border" placeholder="S1 Informatika" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">Email <span className="text-red-500">*</span></label>
            <input type="email" id="email" name="email" required className="w-full border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border" placeholder="john@student.telkomuniversity.ac.id" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1" htmlFor="whatsapp">Nomor WhatsApp <span className="text-red-500">*</span></label>
            <input type="tel" id="whatsapp" name="whatsapp" required pattern="[0-9]+" title="Hanya angka (contoh: 08123456789)" className="w-full border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border" placeholder="08123456789" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1" htmlFor="interestedDivisionId">Bidang yang Diminati <span className="text-red-500">*</span></label>
          <select id="interestedDivisionId" name="interestedDivisionId" required className="w-full border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border bg-white dark:bg-slate-900">
            <option value="">-- Pilih Bidang --</option>
            {divisions.map(div => (
              <option key={div.id} value={div.id}>{div.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1" htmlFor="reason">Alasan Bergabung <span className="text-red-500">*</span></label>
          <textarea id="reason" name="reason" rows={4} required className="w-full border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border" placeholder="Tuliskan motivasi kamu bergabung di LDK Al-Hidayah..."></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1" htmlFor="photo">Pas Foto Terbaru (Max 2MB, JPG/PNG) <span className="text-red-500">*</span></label>
          <input type="file" id="photo" name="photo" required accept="image/jpeg,image/png,image/webp" className="w-full border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border text-sm" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pastikan wajah terlihat jelas. Format gambar akan dioptimasi otomatis.</p>
        </div>

        <div className="pt-4 border-t">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-green-700 text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengirim Pendaftaran...
              </>
            ) : "Kirim Pendaftaran"}
          </button>
        </div>

      </form>
    </div>
  );
}
