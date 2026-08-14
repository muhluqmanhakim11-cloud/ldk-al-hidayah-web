"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, UserCog, Briefcase, 
  CalendarDays, Image as ImageIcon, FileText, 
  Settings, Menu, X, Landmark, Flag, Globe, LogOut
} from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

function BMKGClockWidget() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />;

  const formatter = new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta"
  });
  
  const formatted = formatter.format(time).replace(/\./g, ":");

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-sm text-white">
      <span className="text-[10px] font-medium opacity-80 mb-0.5">Waktu Server (WIB)</span>
      <span className="text-sm font-bold tracking-wider">{formatted}</span>
    </div>
  );
}

interface SidebarProps {
  session: Session | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  vercelBadgeUrl?: string | null;
}

export default function Sidebar({ session, isOpen, setIsOpen, vercelBadgeUrl }: SidebarProps) {
  const pathname = usePathname();
  const role = session?.user?.role;
  const divisionId = session?.user?.divisionId;
  const [vercelStatus, setVercelStatus] = useState<"passing" | "building" | "failed" | "unknown">("unknown");

  useEffect(() => {
    if (!vercelBadgeUrl) return;
    
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/admin/vercel-status');
        if (res.ok) {
          const data = await res.json();
          setVercelStatus(data.status);
        }
      } catch (err) {
        // ignore
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [vercelBadgeUrl]);

  // Determine allowed menus based on role
  const getMenus = () => {
    const menus = [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard, show: true },
      { name: "Profil LDK", href: "/admin/profil", icon: Landmark, show: role === "SUPER_ADMIN" || role === "KETUA" },
      { name: "Periode", href: "/admin/periode", icon: CalendarDays, show: role === "SUPER_ADMIN" || role === "KETUA" },
      { name: "Struktur Organisasi", href: "/admin/struktur", icon: Briefcase, show: role === "SUPER_ADMIN" || role === "KETUA" },
      { name: "Bidang/Divisi", href: "/admin/bidang", icon: Flag, show: role === "SUPER_ADMIN" || role === "KETUA" },
      { name: "Pengurus", href: "/admin/pengurus", icon: Users, show: role === "SUPER_ADMIN" || role === "KETUA" },
      
      { name: "Program Kerja", href: "/admin/programs", icon: FileText, show: true },
      { name: "Agenda / Kegiatan", href: "/admin/events", icon: CalendarDays, show: true },
      
      { name: "Artikel & Berita", href: "/admin/artikel", icon: FileText, show: true },
      { name: "Dokumentasi & Galeri", href: "/admin/dokumentasi", icon: ImageIcon, show: true },
      
      { name: "Recruitment", href: "/admin/recruitment", icon: UserCog, show: true },
      
      { name: "Users", href: "/admin/users", icon: Users, show: role === "SUPER_ADMIN" },
      { name: "Pengaturan Situs", href: "/admin/settings", icon: Settings, show: role === "SUPER_ADMIN" },
    ];

    return menus.filter(menu => menu.show);
  };

  const menus = getMenus();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed flex flex-col inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <span className="text-lg font-bold text-blue-700">Admin LDK</span>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 pb-48 space-y-1">
          {menus.map((menu) => {
            const isActive = pathname === menu.href || (menu.href !== "/admin" && pathname.startsWith(menu.href));
            const Icon = menu.icon;
            return (
              <Link 
                key={menu.name}
                href={menu.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                <span>{menu.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer Area */}
        <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50 flex flex-col space-y-3">
          <Link href="/" className="flex items-center space-x-3 text-green-700 hover:text-green-800 font-medium text-sm transition-colors">
            <Globe size={18} />
            <span>Kembali ke Publik</span>
          </Link>

          <div className="flex flex-col p-3 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gray-700 leading-none">Status Server</span>
              <div className={`w-2 h-2 rounded-full ${
                vercelStatus === 'building' ? 'bg-yellow-500 animate-pulse' :
                vercelStatus === 'failed' ? 'bg-red-500' :
                'bg-green-500'
              } ${vercelStatus === 'passing' ? 'animate-pulse' : ''}`}></div>
            </div>
            <span className="text-[10px] text-gray-500 font-medium capitalize">
              {vercelStatus === 'unknown' ? 'Sistem Aktif' : vercelStatus === 'passing' ? 'Online & Ready' : vercelStatus}
            </span>
          </div>

          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center space-x-3 text-red-600 hover:text-red-700 font-medium text-sm transition-colors pt-2 border-t"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
