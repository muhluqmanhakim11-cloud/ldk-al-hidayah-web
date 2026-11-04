import { db } from "@/db";
import { recruitments, periods } from "@/db/schema";
import { eq, desc, and, ilike } from "drizzle-orm";
import { auth } from "@/auth";
import PrintButton from "./PrintButton";

export default async function RecruitmentPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status as string | undefined;
  const periodFilter = resolvedParams.periodId as string | undefined;
  const divisionFilter = resolvedParams.divisionId as string | undefined;
  const searchName = resolvedParams.name as string | undefined;
  const searchNim = resolvedParams.nim as string | undefined;

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

  const conditions = [];
  if (targetPeriodId) conditions.push(eq(recruitments.periodId, targetPeriodId));
  if (statusFilter) conditions.push(eq(recruitments.status, statusFilter as any));
  if (divisionFilter) conditions.push(eq(recruitments.interestedDivisionId, parseInt(divisionFilter, 10)));
  if (searchName) conditions.push(ilike(recruitments.name, `%${searchName}%`));
  if (searchNim) conditions.push(ilike(recruitments.nim, `%${searchNim}%`));

  if (session.user.role === "ADMIN_BIDANG" && session.user.divisionId) {
    conditions.push(eq(recruitments.interestedDivisionId, session.user.divisionId));
  }

  const list = await db.query.recruitments.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      period: true,
      interestedDivision: true,
    },
    orderBy: [desc(recruitments.createdAt)],
  });

  return (
    <div className="bg-white dark:bg-slate-900 text-black dark:text-white p-8 max-w-4xl mx-auto min-h-screen">
      <div className="text-center mb-8 border-b-2 border-black dark:border-white pb-4">
        <h1 className="text-2xl font-bold uppercase">Laporan Pendaftar LDK Al-Hidayah</h1>
        <p className="text-sm mt-1">
          Dicetak pada:{" "}
          {new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Jakarta",
          })}
        </p>
      </div>

      <div className="flex items-center gap-3 mb-6 print:hidden">
        <PrintButton />
        <a
          href={`/api/admin/recruitments/export-excel?periodId=${targetPeriodId || ""}&divisionId=${divisionFilter || ""}&status=${statusFilter || ""}${searchName ? `&name=${encodeURIComponent(searchName)}` : ""}${searchNim ? `&nim=${encodeURIComponent(searchNim)}` : ""}`}
          className="bg-emerald-600 text-white px-4 py-2 rounded shadow hover:bg-emerald-700 flex items-center gap-2 text-sm font-semibold"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Unduh Excel (.xlsx)
        </a>
      </div>

      <table className="w-full text-left text-sm border-collapse border border-black dark:border-white">
        <thead>
          <tr className="bg-gray-100 dark:bg-slate-800 text-black dark:text-white">
            <th className="border border-black dark:border-white p-2 font-bold">No</th>
            <th className="border border-black dark:border-white p-2 font-bold">NIM</th>
            <th className="border border-black dark:border-white p-2 font-bold">Nama Lengkap</th>
            <th className="border border-black dark:border-white p-2 font-bold">Program Studi</th>
            <th className="border border-black dark:border-white p-2 font-bold">Divisi Pilihan</th>
            <th className="border border-black dark:border-white p-2 font-bold">Status</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item, index) => (
            <tr key={item.id} className="text-black dark:text-gray-100">
              <td className="border border-black dark:border-white p-2 text-center">{index + 1}</td>
              <td className="border border-black dark:border-white p-2">{item.nim}</td>
              <td className="border border-black dark:border-white p-2 uppercase">{item.name}</td>
              <td className="border border-black dark:border-white p-2">{item.studyProgram || "-"}</td>
              <td className="border border-black dark:border-white p-2">{item.interestedDivision?.name || "-"}</td>
              <td className="border border-black dark:border-white p-2">{item.status}</td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan={6} className="border border-black dark:border-white p-4 text-center">
                Tidak ada data pendaftar
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-12 flex justify-end">
        <div className="text-center text-black dark:text-white">
          <p className="mb-16 text-sm">Mengetahui,</p>
          <p className="font-bold underline uppercase">{session.user.name}</p>
          <p className="text-sm">Admin LDK Al-Hidayah</p>
        </div>
      </div>
    </div>
  );
}
