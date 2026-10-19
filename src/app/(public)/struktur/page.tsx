export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/db";
import { periods, members, divisions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import PageHero from "@/components/public/PageHero";
import StrukturClient from "./StrukturClient";

export const metadata: Metadata = {
  title: "Struktur Pengurus",
  description: "Kenali para pengurus aktif Lembaga Dakwah Kampus Al-Hidayah.",
};

export default async function StrukturPage() {
  const activePeriod = await db.query.periods.findFirst({
    where: eq(periods.isActive, true),
    orderBy: (p, { desc }) => [desc(p.id)],
  });

  if (!activePeriod) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center py-20">
        <div style={{ textAlign: "center", padding: "2.5rem", background: "white", borderRadius: "1.25rem", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", maxWidth: "400px", width: "100%" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <svg width="28" height="28" fill="none" stroke="#86efac" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-gray-900 dark:text-gray-100" style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>Struktur Pengurus</h1>
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

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-24">
      <PageHero
        title="Struktur Organisasi"
        subtitle={`LDK Al-Hidayah — Periode ${activePeriod.name}`}
        badge="Kepengurusan"
      />
      <div className="container mx-auto px-4 max-w-6xl mt-14">
        <StrukturClient
          bphMembers={bphMembers}
          groupedByDivision={groupedByDivision}
          periodName={activePeriod.name}
        />
      </div>
    </div>
  );
}
