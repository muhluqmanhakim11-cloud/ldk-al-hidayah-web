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

  const fetchData = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterDivision]);

  const columns = [
    { 
      header: "Waktu", 
      accessor: (row: any) => (
        <span className="text-sm font-medium text-gray-700">
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
      accessor: (row: any) => (
        <div>
          <p className="font-semibold text-gray-800">{row.entityType.replace(/_/g, " ")}</p>
        </div>
      ) 
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <select 
            className="border-gray-300 rounded-lg px-4 py-2 text-sm w-full md:w-64 bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
            value={filterDivision} 
            onChange={e => setFilterDivision(e.target.value)}
          >
            <option value="">Semua Bidang / Divisi</option>
            {divisions.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button 
            onClick={fetchData}
            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white border rounded-xl shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat log aktivitas...</p>
        </div>
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  );
}
