"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, UserCog, Briefcase, 
  CalendarDays, Image as ImageIcon, FileText, 
  Settings, Menu, X, Landmark, Flag, Globe, LogOut, Megaphone,
  Layers, ChevronDown, ChevronRight
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
  const role = (session?.user as any)?.realRole || session?.user?.role;
  const divisionId = session?.user?.divisionId;
  const [vercelStatus, setVercelStatus] = useState<"passing" | "building" | "failed" | "unknown">("unknown");
  
  // State for Accordion
  const [isDivisionsOpen, setIsDivisionsOpen] = useState(false);

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

  const isSuperAdmin = role === "super_admin";
  const isDkm = role === "admin_dkm";
  const isKader = role === "admin_kaderisasi";
  const isKominfo = role === "admin_kominfo";
  const isPensos = role === "admin_pensos";
  const isSeni = role === "admin_seni_olahraga";

  // General Menus
  const mainMenus = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, show: true },
    { name: "Profil LDK", href: "/admin/profil", icon: Landmark, show: isSuperAdmin },
    { name: "Pengumuman & Instruksi", href: "/admin/pengumuman", icon: Megaphone, show: isSuperAdmin },
    { name: "Periode", href: "/admin/periode", icon: CalendarDays, show: isSuperAdmin },
    { name: "Struktur Organisasi", href: "/admin/struktur", icon: Briefcase, show: isSuperAdmin },
    { name: "Bidang/Divisi", href: "/admin/bidang", icon: Flag, show: isSuperAdmin },
    { name: "Pengurus", href: "/admin/pengurus", icon: Users, show: isSuperAdmin },
    { name: "Program Kerja", href: "/admin/programs", icon: FileText, show: isSuperAdmin },
    { name: "Agenda / Kegiatan", href: "/admin/events", icon: CalendarDays, show: isSuperAdmin || isKader },
    { name: "Artikel & Berita", href: "/admin/artikel", icon: FileText, show: isSuperAdmin || isKominfo },
    { name: "Dokumentasi & Galeri", href: "/admin/dokumentasi", icon: ImageIcon, show: isSuperAdmin || isKominfo },
    { name: "Recruitment", href: "/admin/recruitment", icon: UserCog, show: isSuperAdmin || isKader },
    { name: "Running Text", href: "/admin/running-text", icon: FileText, show: isSuperAdmin || isKominfo },
  ].filter(m => m.show);

  // Division Specific Menus
  const divisionMenus = [
    // DKM
    { name: "Jadwal Petugas", href: "/admin/dkm/petugas", icon: CalendarDays, show: isSuperAdmin || isDkm, group: "DKM" },
    { name: "Inventaris Musala", href: "/admin/dkm/inventaris", icon: FileText, show: isSuperAdmin || isDkm, group: "DKM" },
    { name: "Piket Kebersihan", href: "/admin/dkm/piket", icon: FileText, show: isSuperAdmin || isDkm, group: "DKM" },
    { name: "Catatan DKM", href: "/admin/dkm/catatan", icon: FileText, show: isSuperAdmin || isDkm, group: "DKM" },
    
    // Kaderisasi
    { name: "Database Kader", href: "/admin/kaderisasi/database", icon: Users, show: isSuperAdmin || isKader, group: "Kaderisasi" },
    { name: "Absensi Mentoring", href: "/admin/kaderisasi/absensi", icon: FileText, show: isSuperAdmin || isKader, group: "Kaderisasi" },
    { name: "Catatan Kaderisasi", href: "/admin/kaderisasi/catatan", icon: FileText, show: isSuperAdmin || isKader, group: "Kaderisasi" },

    // Kominfo
    { name: "Content Planner", href: "/admin/kominfo/planner", icon: FileText, show: isSuperAdmin || isKominfo, group: "Kominfo" },
    { name: "Catatan Kominfo", href: "/admin/kominfo/catatan", icon: FileText, show: isSuperAdmin || isKominfo, group: "Kominfo" },

    // Pensos
    { name: "Silabus Kajian & IT", href: "/admin/pensos/kajian", icon: FileText, show: isSuperAdmin || isPensos, group: "Pensos" },
    { name: "Log Baksos", href: "/admin/pensos/bansos", icon: FileText, show: isSuperAdmin || isPensos, group: "Pensos" },
    { name: "Kunjungan Tokoh/Ulama", href: "/admin/pensos/kunjungan", icon: Users, show: isSuperAdmin || isPensos, group: "Pensos" },
    { name: "Relasi FSLDK", href: "/admin/pensos/fsldk", icon: Users, show: isSuperAdmin || isPensos, group: "Pensos" },
    { name: "Catatan Pensos", href: "/admin/pensos/catatan", icon: FileText, show: isSuperAdmin || isPensos, group: "Pensos" },

    // Seni & Olahraga
    { name: "Agenda Latihan", href: "/admin/seni-olahraga/agenda", icon: CalendarDays, show: isSuperAdmin || isSeni, group: "Seni & Olahraga" },
    { name: "Catatan Seni & Olahraga", href: "/admin/seni-olahraga/catatan", icon: FileText, show: isSuperAdmin || isSeni, group: "Seni & Olahraga" },
  ].filter(m => m.show);

  const systemMenus = [
    { name: "Users", href: "/admin/users", icon: Users, show: isSuperAdmin },
    { name: "Pengaturan Situs", href: "/admin/settings", icon: Settings, show: isSuperAdmin },
  ].filter(m => m.show);

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

        <div className="overflow-y-auto flex-1 p-4 pb-48 space-y-4">
          
          {/* Main Menus */}
          <div className="space-y-1">
            {mainMenus.map((menu) => {
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

          {/* Division Menus */}
          {divisionMenus.length > 0 && (
            <div className="space-y-1">
              {isSuperAdmin ? (
                // Accordion for Super Admin
                <div className="pt-2 border-t">
                  <button 
                    onClick={() => setIsDivisionsOpen(!isDivisionsOpen)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Layers size={20} className="text-gray-500" />
                      <span className="font-semibold text-sm">Modul Bidang / Divisi</span>
                    </div>
                    {isDivisionsOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  
                  {isDivisionsOpen && (
                    <div className="mt-1 ml-4 pl-3 border-l-2 border-gray-100 space-y-1">
                      {divisionMenus.map((menu) => {
                        const isActive = pathname === menu.href || pathname.startsWith(menu.href);
                        const Icon = menu.icon;
                        return (
                          <Link 
                            key={menu.name}
                            href={menu.href}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                          >
                            <Icon size={16} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                            <span>{menu.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                // Flat List for Admin Divisi
                <div className="pt-2 border-t space-y-1">
                  <div className="px-3 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Modul Divisi
                  </div>
                  {divisionMenus.map((menu) => {
                    const isActive = pathname === menu.href || pathname.startsWith(menu.href);
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
              )}
            </div>
          )}

          {/* System Settings */}
          {systemMenus.length > 0 && (
            <div className="pt-2 border-t space-y-1">
              {systemMenus.map((menu) => {
                const isActive = pathname === menu.href || pathname.startsWith(menu.href);
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
          )}

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
