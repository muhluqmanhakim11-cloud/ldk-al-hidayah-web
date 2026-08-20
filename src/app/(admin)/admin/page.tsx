import { auth } from "@/auth";
import StatCard from "@/components/admin/StatCard";
import QuickAction from "@/components/admin/QuickAction";
import { Users, Flag, FileText, CalendarDays, ImageIcon, UserCog, PlusCircle, CheckCircle, Clock } from "lucide-react";
import { db } from "@/db";
import { members, divisions, programs, events, articles, galleries, recruitments } from "@/db/schema";
import { count, eq, and } from "drizzle-orm";

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session) {
    return null;
  }

  const userRole = session.user.role;
  const userDivisionId = session.user.divisionId;

  // Helpers for filtering by division if ADMIN_BIDANG
  const divisionFilter = userRole === "ADMIN_BIDANG" ? eq(members.divisionId, userDivisionId as number) : undefined;
  const programDivisionFilter = userRole === "ADMIN_BIDANG" ? eq(programs.divisionId, userDivisionId as number) : undefined;
  const eventDivisionFilter = userRole === "ADMIN_BIDANG" ? eq(events.divisionId, userDivisionId as number) : undefined;

  // Fetch stats concurrently
  const [
    membersCount,
    divisionsCount,
    programsCount,
    programsPublishedCount,
    eventsCount,
    eventsUpcomingCount,
  ] = await Promise.all([
    db.select({ value: count() }).from(members).where(divisionFilter),
    db.select({ value: count() }).from(divisions),
    db.select({ value: count() }).from(programs).where(programDivisionFilter),
    db.select({ value: count() }).from(programs).where(and(eq(programs.status, "PUBLISHED"), programDivisionFilter)),
    db.select({ value: count() }).from(events).where(eventDivisionFilter),
    db.select({ value: count() }).from(events).where(and(eq(events.status, "UPCOMING"), eventDivisionFilter)),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Selamat datang kembali, {session.user.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Program Kerja" value={programsCount[0].value} icon={FileText} color="bg-green-500" />
        <StatCard title="Program Published" value={programsPublishedCount[0].value} icon={CheckCircle} color="bg-emerald-600" />
        <StatCard title="Total Kegiatan" value={eventsCount[0].value} icon={CalendarDays} color="bg-orange-500" />
        <StatCard title="Kegiatan Mendatang" value={eventsUpcomingCount[0].value} icon={Clock} color="bg-amber-500" />
        
        {/* Additional Stats */}
        {userRole !== "ADMIN_BIDANG" && (
          <StatCard title="Bidang/Divisi" value={divisionsCount[0].value} icon={Flag} color="bg-indigo-500" />
        )}
        <StatCard title="Total Pengurus" value={membersCount[0].value} icon={Users} color="bg-blue-500" />
      </div>

      {/* Quick Actions */}
      {userRole !== "KETUA" && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickAction title="Data Program" href="/admin/programs" icon={FileText} />
            <QuickAction title="Data Kegiatan" href="/admin/events" icon={CalendarDays} />
            <QuickAction title="Data Pengurus" href="/admin/pengurus" icon={Users} />
          </div>
        </div>
      )}
    </div>
  );
}
