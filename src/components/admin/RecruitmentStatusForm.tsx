"use client";

import { confirmDialog } from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  recruitmentId: number;
  currentStatus: string;
  userRole: string;
}

export default function RecruitmentStatusForm({ recruitmentId, currentStatus, userRole }: Props) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!(await confirmDialog(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`))) return;
    
    setIsUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/recruitments/${recruitmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Gagal mengubah status");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError("Kesalahan jaringan");
    } finally {
      setIsUpdating(false);
    }
  };

  const isAdminBidang = userRole === "ADMIN_BIDANG";

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border h-full">
      <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">Ubah Status</h3>
      
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4 border border-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {currentStatus === "PENDING" && (
           <button 
             onClick={() => handleStatusUpdate("REVIEWED")} 
             disabled={isUpdating}
             className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
           >
             Tandai Sedang Direview (REVIEWED)
           </button>
        )}
        
        {!isAdminBidang && currentStatus !== "ACCEPTED" && (
           <button 
             onClick={() => handleStatusUpdate("ACCEPTED")} 
             disabled={isUpdating}
             className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
           >
             Terima Pendaftar (ACCEPTED)
           </button>
        )}
        
        {!isAdminBidang && currentStatus !== "REJECTED" && (
           <button 
             onClick={() => handleStatusUpdate("REJECTED")} 
             disabled={isUpdating}
             className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
           >
             Tolak Pendaftar (REJECTED)
           </button>
        )}

        {isAdminBidang && (
           <div className="text-sm text-gray-500 mt-2 p-3 bg-gray-50 rounded-md border border-dashed">
             Admin Bidang hanya dapat merubah status menjadi REVIEWED.
           </div>
        )}
      </div>
    </div>
  );
}
