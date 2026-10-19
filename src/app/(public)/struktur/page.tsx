export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/db";
import { periods, members, divisions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import MemberCard from "./MemberCard";
import PageHero from "@/components/public/PageHero";
import ScrollReveal from "@/components/public/ScrollReveal";

export const metadata: Metadata = {
  title: "Struktur Pengurus",
  description: "Kenali para pengurus aktif Lembaga Dakwah Kampus Al-Hidayah beserta bidang & jabatannya.",
};

export default async function StrukturPage() {
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Struktur Pengurus</h1>
          <p className="text-gray-500 dark:text-gray-400">Belum ada periode kepengurusan yang aktif saat ini.</p>
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

  // Sort by position level
  activeMembers.sort((a, b) => {
    const levelA = a.position?.level ?? 99;
    const levelB = b.position?.level ?? 99;
    if (levelA !== levelB) return levelA - levelB;
    return a.name.localeCompare(b.name);
  });

  const bphMembers = activeMembers.filter((m) => !m.divisionId);
  const groupedByDivision = activeDivisions.map((div) => ({
    ...div,
    members: activeMembers.filter((m) => m.divisionId === div.id),
  }));

  // Division accent colours cycling
  const divColors = [
    { border: "border-green-500", bg: "bg-green-50 dark:bg-green-900/20", badge: "bg-green-600", text: "text-green-700 dark:text-green-400", line: "bg-green-500" },
    { border: "border-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", badge: "bg-emerald-600", text: "text-emerald-700 dark:text-emerald-400", line: "bg-emerald-500" },
    { border: "border-teal-500", bg: "bg-teal-50 dark:bg-teal-900/20", badge: "bg-teal-600", text: "text-teal-700 dark:text-teal-400", line: "bg-teal-500" },
  ];

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-24 overflow-x-hidden">
      <ScrollReveal />
      <PageHero
        title="Struktur Organisasi"
        subtitle={`LDK Al-Hidayah — Periode ${activePeriod.name}`}
        badge="Kepengurusan"
      />

      <div className="container mx-auto px-4 max-w-7xl mt-14">
        <div className="flex flex-col items-center w-full gap-8">

          {/* ── BPH ── */}
          {bphMembers.length > 0 && (
            <div className="reveal w-full">
              {/* Section label */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Badan Pengurus Harian &amp; Penasehat
                </h2>
              </div>

              <div className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 md:p-10 shadow-sm">
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-transparent rounded-full mb-8" />
                <div className="flex flex-wrap justify-center gap-4">
                  {bphMembers.map((member, idx) => (
                    <div
                      key={member.id}
                      className={`reveal-scale delay-${Math.min(idx * 100, 600)}`}
                    >
                      <MemberCard
                        member={member}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl p-4 w-56 md:w-64 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                        nameClassName="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base"
                        positionClassName="text-blue-700 dark:text-blue-400 text-xs font-semibold mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Bidang/Divisi ── */}
          {groupedByDivision.length > 0 && (
            <div className="w-full">
              <div className="flex items-center gap-3 mb-6 reveal">
                <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Bidang &amp; Divisi</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedByDivision.map((div, idx) => {
                  const c = divColors[idx % divColors.length];
                  return (
                    <div
                      key={div.id}
                      className={`reveal delay-${Math.min((idx % 3) * 100 + 100, 500)} bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
                    >
                      {/* Division header */}
                      <div className={`h-1 w-full ${c.line} rounded-full mb-5`} />
                      <div className="flex items-center gap-3 mb-5">
                        <span className={`w-2.5 h-2.5 rounded-full ${c.badge} flex-shrink-0`} />
                        <h3 className={`font-bold ${c.text} text-sm md:text-base leading-snug`}>
                          {div.name}
                        </h3>
                      </div>

                      {div.members.length > 0 ? (
                        <div className="flex flex-col items-center gap-3">
                          {div.members.map((member) => (
                            <MemberCard
                              key={member.id}
                              member={member}
                              className={`${c.bg} border ${c.border.replace("border-", "border-")}/20 rounded-xl p-3 w-full text-center hover:shadow-sm transition-shadow duration-200`}
                              nameClassName="font-bold text-gray-900 dark:text-gray-100 text-sm leading-snug"
                              positionClassName={`${c.text} text-xs font-semibold mt-0.5`}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic text-center py-4">Belum ada pengurus</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
