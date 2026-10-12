"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Session } from "next-auth";
import AnnouncementPopup from "./AnnouncementPopup";

interface AdminLayoutProps {
  children: React.ReactNode;
  session: Session | null;
  vercelBadgeUrl?: string | null;
}

export default function AdminLayout({ children, session, vercelBadgeUrl }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 overflow-hidden relative print:h-auto print:overflow-visible print:block print:bg-white print:text-black">
      <div className="print:hidden">
        <Sidebar session={session} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} vercelBadgeUrl={vercelBadgeUrl} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 print:block print:w-full">
        <div className="print:hidden">
          <Topbar session={session} setIsOpen={setIsSidebarOpen} />
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 print:p-0 print:m-0 print:overflow-visible print:h-auto print:w-full">
          {children}
        </main>
      </div>
      
      <div className="print:hidden">
        <AnnouncementPopup />
      </div>
    </div>
  );
}
