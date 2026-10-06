import { auth } from "@/auth";
import StatCard from "@/components/admin/StatCard";
import QuickAction from "@/components/admin/QuickAction";
import { Users, Flag, FileText, CalendarDays, CheckCircle, Clock, ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { db } from "@/db";
import { members, divisions, programs, events, transactions } from "@/db/schema";
import { count, eq, and, sum } from "drizzle-orm";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session) {
    return null;
  }

  const realRole = (session.user as any).realRole || session.user.role;
  const userDivisionId = session.user.divisionId;

  // === BENDAHARA DASHBOARD ===
  if (realRole === "admin_bendahara") {
    const [totalInResult, totalOutResult, txCountResult] = await Promise.all([
      db.select({ total: sum(transactions.amount) }).from(transactions).where(eq(transactions.type, "IN")),
      db.select({ total: sum(transactions.amount) }).from(transactions).where(eq(transactions.type, "OUT")),
      db.select({ value: count() }).from(transactions),
    ]);

    const totalIn = Number(totalInResult[0]?.total ?? 0);
    const totalOut = Number(totalOutResult[0]?.total ?? 0);
    const balance = totalIn - totalOut;
    const txCount = txCountResult[0].value;

    const formatRupiah = (n: number) =>
      new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

    const recentTx = await db.select().from(transactions).orderBy(transactions.date).limit(5);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Keuangan</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Selamat datang kembali, {session.user.name}!</p>
        </div>

        {/* Saldo Highlight */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-blue-100 text-sm font-medium">Saldo Kas Saat Ini</p>
          <h2 className="text-4xl font-bold mt-1">{formatRupiah(balance)}</h2>
          <p className="text-blue-200 text-xs mt-2">Total {txCount} transaksi tercatat</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard title="Total Pemasukan" value={formatRupiah(totalIn)} icon={ArrowDownCircle} color="bg-green-500" />
          <StatCard title="Total Pengeluaran" value={formatRupiah(totalOut)} icon={ArrowUpCircle} color="bg-red-500" />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Transaksi Terbaru</h2>
            <Link href="/admin/bendahara/transactions" className="text-sm text-blue-600 hover:underline">Lihat Semua →</Link>
          </div>
          {recentTx.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Belum ada transaksi. <Link href="/admin/bendahara/transactions" className="text-blue-500 hover:underline">Catat sekarang</Link></p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tx.type === "IN" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                      {tx.type === "IN" ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{tx.description}</p>
                      <p className="text-xs text-gray-400">{tx.category} · {new Date(tx.date).toLocaleDateString("id-ID")}</p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${tx.type === "IN" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "IN" ? "+" : "-"}{formatRupiah(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <QuickAction title="Buku Kas" href="/admin/bendahara/transactions" icon={Wallet} />
          </div>
        </div>
      </div>
    );
  }

  // === DEFAULT DASHBOARD (super_admin & other roles) ===
  const divisionFilter = undefined;
  const programDivisionFilter = undefined;
  const eventDivisionFilter = undefined;

  const [
    membersCount,
    divisionsCount,
    programsCount,
    programsPublishedCount,
    eventsCount,
    eventsUpcomingCount,
  ] = await Promise.all([
    db.select({ value: count() }).from(members),
    db.select({ value: count() }).from(divisions),
    db.select({ value: count() }).from(programs),
    db.select({ value: count() }).from(programs).where(eq(programs.status, "PUBLISHED")),
    db.select({ value: count() }).from(events),
    db.select({ value: count() }).from(events).where(eq(events.status, "UPCOMING")),
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
        <StatCard title="Bidang/Divisi" value={divisionsCount[0].value} icon={Flag} color="bg-indigo-500" />
        <StatCard title="Total Pengurus" value={membersCount[0].value} icon={Users} color="bg-blue-500" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickAction title="Data Program" href="/admin/programs" icon={FileText} />
          <QuickAction title="Data Kegiatan" href="/admin/events" icon={CalendarDays} />
          <QuickAction title="Data Pengurus" href="/admin/pengurus" icon={Users} />
        </div>
      </div>
    </div>
  );
}
