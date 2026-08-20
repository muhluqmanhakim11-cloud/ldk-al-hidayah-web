import LogAktivitasClient from "./LogAktivitasClient";
import { db } from "@/db";
import { divisions } from "@/db/schema";

export const metadata = {
  title: "Log Aktivitas - Admin LDK Al-Hidayah",
};

export default async function LogAktivitasPage() {
  const allDivisions = await db.query.divisions.findMany();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Riwayat & Log Aktivitas</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Pantauan aktivitas terbaru dari seluruh bidang (Khusus SuperAdmin)</p>
      </div>

      <LogAktivitasClient divisions={allDivisions} />
    </div>
  );
}
