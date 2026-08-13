"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, UserCog, Briefcase, 
  CalendarDays, Image as ImageIcon, FileText, 
  Settings, Menu, X, Landmark, Flag
} from "lucide-react";
import { Session } from "next-auth";

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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <span className="text-lg font-bold text-blue-700">Admin LDK</span>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-4rem)] p-4 space-y-1">
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

        {vercelBadgeUrl && (
          <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50 flex flex-col items-center justify-center space-y-2">
            <span className="text-xs text-gray-500 font-medium">Server Status (Vercel)</span>
            <img src={vercelBadgeUrl} alt="Vercel Deployment Status" className="h-6" />
          </div>
        )}
      </div>
    </>
  );
}
