"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Session } from "next-auth";

interface AdminLayoutProps {
  children: React.ReactNode;
  session: Session | null;
  vercelBadgeUrl?: string | null;
}

export default function AdminLayout({ children, session, vercelBadgeUrl }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar session={session} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} vercelBadgeUrl={vercelBadgeUrl} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar session={session} setIsOpen={setIsSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
