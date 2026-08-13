export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import { db } from "@/db";
import { periods, divisions, positions, members } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Struktur Pengurus",
};

export default async function StrukturPage() {
  const activePeriod = await db.query.periods.findFirst({
    where: eq(periods.isActive, true),
    orderBy: (p, { desc }) => [desc(p.id)],
  });

  if (!activePeriod) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center p-8 bg-white border rounded-xl shadow-sm max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Struktur Pengurus</h1>
          <p className="text-gray-500">Belum ada periode kepengurusan yang aktif saat ini.</p>
        </div>
      </div>
    );
  }

  const periodId = activePeriod.id;

  const activeDivisions = await db.query.divisions.findMany({
    where: eq(divisions.periodId, periodId),
    orderBy: [asc(divisions.name)],
  });

  const activeMembers = await db.query.members.findMany({
    where: eq(members.periodId, periodId),
    with: { position: true, division: true },
    orderBy: [asc(members.name)],
  });

  // Sort activeMembers by position level
  activeMembers.sort((a, b) => {
    const levelA = a.position?.level ?? 99;
    const levelB = b.position?.level ?? 99;
    if (levelA !== levelB) return levelA - levelB;
    return a.name.localeCompare(b.name);
  });

  // Group members by division
  const bphMembers = activeMembers.filter(m => !m.divisionId);
  const groupedByDivision = activeDivisions.map(div => ({
    ...div,
    members: activeMembers.filter(m => m.divisionId === div.id)
  }));

  return (
    <div className="bg-gray-50 min-h-screen pb-20 overflow-x-hidden">
      <div className="bg-green-800 text-white pt-32 pb-16 md:pt-40 md:pb-24 mb-12">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Struktur Organisasi</h1>
          <p className="text-green-100 max-w-2xl mx-auto text-lg">LDK Al-Hidayah Periode {activePeriod.name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col items-center w-full">
          
          {/* BPH (Badan Pengurus Harian) */}
          {bphMembers.length > 0 && (
            <div className="w-full bg-white border border-gray-200 rounded-xl p-6 md:p-8 mb-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold text-blue-800 text-center mb-4">
                Badan Pengurus Harian & Penasehat
              </h2>
              <div className="w-full h-[2px] bg-blue-600 mb-8"></div>
              
              <div className="flex flex-col items-center gap-4">
                {bphMembers.map((member) => (
                  <div key={member.id} className="bg-blue-50 border border-blue-100 rounded-lg p-4 w-64 md:w-80 text-center">
                    <h3 className="font-bold text-gray-900 text-sm md:text-base">{member.name}</h3>
                    <p className="text-blue-700 text-xs font-semibold mt-1">{member.position?.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bidang / Divisi */}
          {groupedByDivision.length > 0 && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedByDivision.map((div) => (
                <div key={div.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-green-800 text-center mb-4 text-sm md:text-base">
                    {div.name}
                  </h3>
                  <div className="w-full h-[2px] bg-green-600 mb-6"></div>
                  
                  {div.members.length > 0 ? (
                    <div className="flex flex-col items-center gap-3">
                      {div.members.map(member => (
                        <div key={member.id} className="bg-green-50 border border-green-100 rounded-lg p-3 w-full text-center">
                          <h4 className="font-bold text-gray-900 text-sm leading-snug">{member.name}</h4>
                          <p className="text-green-600 text-xs font-semibold mt-1">{member.position?.name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic text-center">Belum ada pengurus</p>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

