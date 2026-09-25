import { Metadata } from "next";
import { db } from "@/db";
import { periods, programs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ProgramTimelineClient from "./ProgramTimelineClient";

export const metadata: Metadata = {
  title: "Program Kerja",
};

export default async function ProgramKerjaPage() {
  const activePeriod = await db.query.periods.findFirst({
    where: eq(periods.isActive, true),
    orderBy: (p, { desc }) => [desc(p.id)],
  });

  if (!activePeriod) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center py-20">
        <div className="text-center p-8 bg-white dark:bg-slate-900 border rounded-xl shadow-sm max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Program Kerja</h1>
          <p className="text-gray-500 dark:text-gray-400">Belum ada periode aktif.</p>
        </div>
      </div>
    );
  }

  const activePrograms = await db.query.programs.findMany({
    where: eq(programs.periodId, activePeriod.id),
    with: { division: true },
    orderBy: [desc(programs.id)],
  });

  const publishedPrograms = activePrograms.filter(p => p.status === 'PUBLISHED');

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20">
      <div className="bg-green-800 text-white pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Program Kerja</h1>
          <p className="text-green-100 max-w-2xl mx-auto text-lg">Inisiatif dan program yang kami jalankan pada periode {activePeriod.name}.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 mt-12 md:mt-16">
        <ProgramTimelineClient programs={publishedPrograms} />
      </div>
    </div>
  );
}


export const dynamic = 'force-dynamic';
