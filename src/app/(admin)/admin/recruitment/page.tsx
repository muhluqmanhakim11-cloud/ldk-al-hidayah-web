import { Metadata } from "next";
import { db } from "@/db";
import { recruitments, periods, divisions } from "@/db/schema";
import { eq, desc, asc, and, ilike, sql } from "drizzle-orm";
import Link from "next/link";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Admin - Rekrutmen",
};

export default async function AdminRecruitmentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth();
  if (!session?.user) return null;

  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status as string | undefined;
  const periodFilter = resolvedParams.periodId as string | undefined;
  const divisionFilter = resolvedParams.divisionId as string | undefined;
  const searchName = resolvedParams.name as string | undefined;
  const searchNim = resolvedParams.nim as string | undefined;

  // Fetch active period or use filter
  let targetPeriodId: number | undefined;
  if (periodFilter) {
    targetPeriodId = parseInt(periodFilter, 10);
  } else {
    const activePeriod = await db.query.periods.findFirst({
      where: eq(periods.isActive, true),
      orderBy: (p, { desc }) => [desc(p.id)],
    });
    if (activePeriod) targetPeriodId = activePeriod.id;
  }

  // Base Conditions
  const conditions = [];
  if (targetPeriodId) conditions.push(eq(recruitments.periodId, targetPeriodId));
  if (statusFilter) conditions.push(eq(recruitments.status, statusFilter as any));
  if (searchName) conditions.push(ilike(recruitments.name, `%${searchName}%`));
  if (searchNim) conditions.push(ilike(recruitments.nim, `%${searchNim}%`));
  
  // RBAC for division
  if (session.user.role === 'ADMIN_BIDANG' && session.user.divisionId) {
    conditions.push(eq(recruitments.interestedDivisionId, session.user.divisionId));
  } else if (divisionFilter) {
    conditions.push(eq(recruitments.interestedDivisionId, parseInt(divisionFilter, 10)));
  }

  const list = await db.query.recruitments.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      period: true,
      interestedDivision: true,
    },
    orderBy: [desc(recruitments.createdAt)],
  });

  // Calculate Stats
  const total = list.length;
  const pending = list.filter(r => r.status === 'PENDING').length;
  const reviewed = list.filter(r => r.status === 'REVIEWED').length;
  const accepted = list.filter(r => r.status === 'ACCEPTED').length;
  const rejected = list.filter(r => r.status === 'REJECTED').length;

  const allPeriods = await db.query.periods.findMany({ orderBy: [desc(periods.id)] });
  const allDivisions = await db.query.divisions.findMany({ orderBy: [asc(divisions.name)] });
  const currentPeriodInfo = allPeriods.find(p => p.id === targetPeriodId);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kelola Pendaftar</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Periode: {currentPeriodInfo?.name || 'Semua'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Total</p>
          <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-l-4 border-l-yellow-500">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Pending</p>
          <p className="text-2xl font-black text-yellow-600">{pending}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Reviewed</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{reviewed}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Accepted</p>
          <p className="text-2xl font-black text-green-600">{accepted}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Rejected</p>
          <p className="text-2xl font-black text-red-600 dark:text-red-400">{rejected}</p>
        </div>
      </div>

      {/* Control Status Pendaftaran (Super Admin / Ketua) */}
      {(session.user.role === 'SUPER_ADMIN' || session.user.role === 'KETUA') && currentPeriodInfo && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Status Pendaftaran Periode {currentPeriodInfo.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Buka atau tutup akses formulir pendaftaran untuk publik.</p>
          </div>
          <div>
             <form action={async () => {
                'use server';
                const { revalidatePath } = await import('next/cache');
                const newState = !currentPeriodInfo.isRecruitmentOpen;
                await db.update(periods).set({ isRecruitmentOpen: newState }).where(eq(periods.id, currentPeriodInfo.id));
                revalidatePath('/admin/recruitment');
                revalidatePath('/rekrutmen/daftar');
             }}>
                <button type="submit" className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${currentPeriodInfo.isRecruitmentOpen ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                  <div className={`w-3 h-3 rounded-full ${currentPeriodInfo.isRecruitmentOpen ? 'bg-green-300' : 'bg-red-300'}`}></div>
                  {currentPeriodInfo.isRecruitmentOpen ? "Status: BUKA (Klik untuk Tutup)" : "Status: TUTUP (Klik untuk Buka)"}
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border mb-6">
        <form className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Periode</label>
            <select name="periodId" defaultValue={targetPeriodId || ""} className="border rounded-md p-2 text-sm bg-gray-50 dark:bg-slate-950 min-w-[120px]">
              <option value="">Semua</option>
              {allPeriods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {session.user.role !== 'ADMIN_BIDANG' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Divisi</label>
              <select name="divisionId" defaultValue={divisionFilter || ""} className="border rounded-md p-2 text-sm bg-gray-50 dark:bg-slate-950 min-w-[150px]">
                <option value="">Semua Divisi</option>
                {allDivisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select name="status" defaultValue={statusFilter || ""} className="border rounded-md p-2 text-sm bg-gray-50 dark:bg-slate-950 min-w-[120px]">
              <option value="">Semua</option>
              <option value="PENDING">PENDING</option>
              <option value="REVIEWED">REVIEWED</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Cari Nama</label>
            <input type="text" name="name" defaultValue={searchName || ""} placeholder="Nama..." className="border rounded-md p-2 text-sm bg-gray-50 dark:bg-slate-950" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Cari NIM</label>
            <input type="text" name="nim" defaultValue={searchNim || ""} placeholder="NIM..." className="border rounded-md p-2 text-sm bg-gray-50 dark:bg-slate-950" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-800">Filter</button>
            <Link href="/admin/recruitment" className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-300">Reset</Link>
            
            <a 
              href={`/admin/recruitment/print?periodId=${targetPeriodId || ''}&divisionId=${divisionFilter || ''}&status=${statusFilter || ''}`} 
              target="_blank"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Cetak PDF
            </a>
          </div>
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-slate-950 border-b text-gray-600 dark:text-gray-400">
              <tr>
                <th className="p-4 font-semibold">NIM</th>
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">Divisi Diminati</th>
                <th className="p-4 font-semibold">Tanggal Daftar</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-800 dark:text-gray-200">
              {list.length > 0 ? list.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 dark:bg-slate-950">
                  <td className="p-4 font-medium">{item.nim}</td>
                  <td className="p-4">
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.studyProgram}</div>
                  </td>
                  <td className="p-4">{item.interestedDivision?.name || '-'}</td>
                  <td className="p-4">{new Date(item.createdAt).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                      ${item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${item.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700 dark:text-blue-400' : ''}
                      ${item.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 dark:text-green-400' : ''}
                      ${item.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:text-red-400' : ''}
                    `}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/recruitment/${item.id}`} className="text-green-600 font-semibold hover:underline">
                      Detail
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400 border-dashed">
                    Tidak ada data pendaftar yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
