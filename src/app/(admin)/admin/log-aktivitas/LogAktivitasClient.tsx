"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";

export default function LogAktivitasClient({ divisions }: { divisions: any[] }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDivision, setFilterDivision] = useState("");

  const formatter = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta"
  });

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterDivision) params.append("divisionId", filterDivision);
      
      const res = await fetch(`/api/admin/activity-logs?${params.toString()}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Realtime polling every 3 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [filterDivision]);

  const columns = [
    { 
      header: "Waktu", 
      accessor: (row: any) => (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formatter.format(new Date(row.createdAt)).replace(/\./g, ":")}
        </span>
      ) 
    },
    { header: "Pengguna", accessor: (row: any) => row.user?.name || "Sistem" },
    { header: "Bidang/Divisi", accessor: (row: any) => row.division?.name || "Umum/SuperAdmin" },
    { 
      header: "Aksi", 
      accessor: (row: any) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-md 
          ${row.action === 'CREATE' ? 'bg-green-100 text-green-700' : 
            row.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' : 
            row.action === 'DELETE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
          {row.action}
        </span>
      ) 
    },
    { 
      header: "Modul / Entitas", 
      accessor: (row: any) => {
        let entity = row.entityType.replace(/_/g, " ");
        // Mapping common backend entities to readable Indonesian text
        const map: Record<string, string> = {
          "ANNOUNCEMENTS [ID] ACKNOWLEDGE": "Konfirmasi Pengumuman",
          "ANNOUNCEMENTS": "Pengumuman",
          "KOMINFO CATATAN": "Catatan Kominfo",
          "GALLERIES": "Galeri / Dokumentasi",
          "DKM INVENTARIS": "Inventaris Masjid",
          "DKM PIKET": "Piket Kebersihan DKM",
          "DKM PETUGAS": "Jadwal Petugas DKM",
          "DKM CATATAN": "Catatan DKM",
          "PENSOS KUNJUNGAN": "Kunjungan Tokoh/Ulama",
          "PENSOS BANSOS": "Log Baksos Pensos",
          "PENSOS FSLDK": "Relasi FSLDK Pensos",
          "PENSOS KAJIAN": "Silabus Kajian Pensos",
          "PENSOS CATATAN": "Catatan Pensos",
          "SENI OLAHRAGA AGENDA": "Agenda Latihan",
          "SENI OLAHRAGA CATATAN": "Catatan Seni & Olahraga",
          "KADERISASI DATABASE": "Database Kader",
          "KADERISASI ABSENSI": "Absensi Mentoring",
          "KADERISASI CATATAN": "Catatan Kaderisasi",
          "KOMINFO PLANNER": "Content Planner",
          "KETUA CATATAN": "Catatan Ketua",
          "USERS": "Pengguna Sistem",
          "SETTINGS": "Pengaturan Situs",
          "ARTICLES": "Artikel & Berita",
          "EVENTS": "Agenda & Kegiatan",
          "PROGRAMS": "Program Kerja",
          "PROFILES": "Profil LDK",
          "PERIODS": "Periode Kepengurusan",
          "POSITIONS": "Struktur Organisasi",
          "DIVISIONS": "Bidang / Divisi",
          "RECRUITMENTS": "Pendaftaran Anggota (Recruitment)",
          "RUNNING TEXTS": "Running Text"
        };
        
        return (
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{map[entity] || entity}</p>
          </div>
        );
      } 
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <select 
            className="border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm w-full md:w-64 bg-gray-50 dark:bg-slate-800 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" 
            value={filterDivision} 
            onChange={e => setFilterDivision(e.target.value)}
          >
            <option value="">Semua Bidang / Divisi</option>
            {divisions.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button 
            onClick={() => fetchData(false)}
            className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Memuat log aktivitas...</p>
        </div>
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  );
}
