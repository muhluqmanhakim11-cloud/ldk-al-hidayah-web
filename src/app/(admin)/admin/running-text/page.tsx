import { Metadata } from "next";
import RunningTextClient from "./RunningTextClient";

export const metadata: Metadata = {
  title: "Kelola Running Text",
};

export default function RunningTextPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kelola Running Text</h1>
        <p className="text-gray-500 dark:text-gray-400">Atur teks berjalan yang akan ditampilkan di beranda website publik.</p>
      </div>

      <RunningTextClient />
    </div>
  );
}
