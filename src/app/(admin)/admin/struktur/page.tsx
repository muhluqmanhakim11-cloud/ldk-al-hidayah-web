import { auth } from "@/auth";
import { db } from "@/db";
import { redirect } from "next/navigation";
import StrukturClient from "./StrukturClient";
import { eq } from "drizzle-orm";
import { periods, members, divisions as divisionsSchema } from "@/db/schema";

export default async function StrukturPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Fetch active period structure
  const activePeriod = await db.query.periods.findFirst({ where: eq(periods.isActive, true) });

  let allMembers: any[] = [];
  let allDivisions: any[] = [];
  
  if (activePeriod) {
    allMembers = await db.query.members.findMany({
      where: eq(members.periodId, activePeriod.id),
      with: { position: true, division: true },
      orderBy: (m, { asc }) => [asc(m.positionId)],
    });

    allDivisions = await db.query.divisions.findMany({
      where: eq(divisionsSchema.periodId, activePeriod.id),
    });
  }

  const positions = await db.query.positions.findMany({
    orderBy: (p, { asc }) => [asc(p.level)],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Struktur Organisasi</h1>
          <p className="text-gray-500">Bagan pengurus LDK Al-Hidayah periode aktif ({activePeriod?.name || "Belum ada periode aktif"})</p>
        </div>
      </div>
      
      {activePeriod ? (
        <StrukturClient members={allMembers} divisions={allDivisions} positions={positions} />
      ) : (
        <div className="p-8 text-center text-gray-500 bg-white border rounded-lg shadow-sm">
          Harap aktifkan salah satu periode terlebih dahulu di menu Periode.
        </div>
      )}
    </div>
  );
}
