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
          {/* BMKG Clock iframe */}
          <div className="w-full bg-white border rounded-lg overflow-hidden h-[40px] flex items-center justify-center">
            <iframe 
              src="https://jam.bmkg.go.id/JamServerFS.html" 
              width="100%" 
              height="40" 
              style={{ border: "none", overflow: "hidden" }} 
              title="Jam BMKG"
              scrolling="no"
            ></iframe>
          </div>

          <Link href="/" className="flex items-center space-x-3 text-green-700 hover:text-green-800 font-medium text-sm transition-colors">
            <Globe size={18} />
            <span>Kembali ke Publik</span>
          </Link>

          <div className="flex items-center p-2 bg-white border rounded-lg space-x-3 shadow-sm">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-700 leading-none">Status Server</span>
              <span className="text-[10px] text-gray-500 mt-1">Sistem Aktif</span>
            </div>
          </div>

          {vercelBadgeUrl && (
            <div className="flex justify-center mt-1">
              <img src={vercelBadgeUrl} alt="Vercel Status" className="h-4" />
            </div>
          )}

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
