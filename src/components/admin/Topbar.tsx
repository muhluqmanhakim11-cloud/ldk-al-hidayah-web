"use client";

import { Menu } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";

interface TopbarProps {
  session: Session | null;
  setIsOpen: (open: boolean) => void;
}

import BMKGClockWidget from "./BMKGClockWidget";
import ThemeToggle from "@/components/ThemeToggle";

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

      <div className="flex items-center">
        <div className="hidden sm:block">
          <BMKGClockWidget />
        </div>
        
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-tight dark:text-white">{user?.name}</p>
            <p className="text-xs text-gray-500">
              {user?.role} {user?.role === "ADMIN_BIDANG" && `- ${getDivisionName(user.divisionId)}`}
            </p>
          </div>
          
          {/* Simple Avatar */}
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm">
            {user?.name?.charAt(0) || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
