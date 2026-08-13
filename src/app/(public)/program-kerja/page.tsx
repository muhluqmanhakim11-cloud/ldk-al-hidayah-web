import { Metadata } from "next";
import { db } from "@/db";
import { periods, programs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center p-8 bg-white border rounded-xl shadow-sm max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Program Kerja</h1>
          <p className="text-gray-500">Belum ada periode aktif.</p>
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
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-green-800 text-white pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Program Kerja</h1>
          <p className="text-green-100 max-w-2xl mx-auto text-lg">Inisiatif dan program yang kami jalankan pada periode {activePeriod.name}.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 mt-12 md:mt-16">
        {publishedPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedPrograms.map(program => (
              <div key={program.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border p-6 flex flex-col h-full border-t-4 border-t-green-600">
                <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">
                  {program.division?.name || 'Umum'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{program.name}</h3>
                <p className="text-gray-600 mb-4 flex-grow text-sm leading-relaxed whitespace-pre-wrap">
                  {program.description}
                </p>
                {program.objective && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Tujuan:</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{program.objective}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white border border-dashed rounded-xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">Belum ada program</h3>
            <p className="mt-1 text-gray-500">Program kerja untuk periode ini belum dipublikasikan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
