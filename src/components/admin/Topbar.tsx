"use client";

import { Menu } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";

interface TopbarProps {
  session: Session | null;
  setIsOpen: (open: boolean) => void;
}

export default function Topbar({ session, setIsOpen }: TopbarProps) {
  const user = session?.user;

  // Render division name based on ID for simplicity, in a real app this might be fetched or mapped
  const getDivisionName = (id?: number | null) => {
    if (id === 1) return "DKM";
    if (id === 2) return "Kominfo";
    if (id) return `Bidang ${id}`;
    return "";
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center">
        <button 
          onClick={() => setIsOpen(true)} 
          className="lg:hidden text-gray-600 hover:text-gray-900 p-1 mr-3"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">
            {user?.role} {user?.role === "ADMIN_BIDANG" && `- ${getDivisionName(user.divisionId)}`}
          </p>
        </div>
        
        {/* Simple Avatar */}
        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
          {user?.name?.charAt(0) || "U"}
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
