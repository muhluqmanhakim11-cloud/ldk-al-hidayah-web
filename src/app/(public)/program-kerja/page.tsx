import { Metadata } from "next";
import { db } from "@/db";
import { periods, programs } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProgramTimelineClient from "./ProgramTimelineClient";
import PageHero from "@/components/public/PageHero";
import ScrollReveal from "@/components/public/ScrollReveal";

export const metadata: Metadata = {
  title: "Program Kerja",
  description: "Inisiatif dan program kerja yang dijalankan LDK Al-Hidayah.",
};

export const dynamic = "force-dynamic";

export default async function ProgramKerjaPage() {
  const activePeriod = await db.query.periods.findFirst({
    where: eq(periods.isActive, true),
    orderBy: (p, { desc }) => [desc(p.id)],
  });

  if (!activePeriod) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center py-20">
        <div className="text-center p-10 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Program Kerja</h1>
          <p className="text-gray-500 dark:text-gray-400">Belum ada periode aktif.</p>
        </div>
      </div>
    );
  }

  const activePrograms = await db.query.programs.findMany({
    where: eq(programs.periodId, activePeriod.id),
    with: { division: true },
    orderBy: (programs, { asc, desc }) => [asc(programs.orderIndex), desc(programs.id)],
  });

  const publishedPrograms = activePrograms.filter((p) => p.status === "PUBLISHED");

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-24">
      <ScrollReveal />
      <PageHero
        title="Program Kerja"
        subtitle={`Inisiatif dan program yang kami jalankan pada periode ${activePeriod.name}`}
        badge="Program Unggulan"
      />

      <div className="container mx-auto px-4 lg:px-8 mt-14">
        <ProgramTimelineClient programs={publishedPrograms} />
      </div>
    </div>
  );
}
