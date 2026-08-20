import { auth } from "@/auth";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { members } from "@/db/schema";
import { redirect } from "next/navigation";
import PengurusClient from "./PengurusClient";

export default async function PengurusPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userRole = session.user.role;
  const userDivisionId = session.user.divisionId;

  let allMembers;
  if (userRole === "ADMIN_BIDANG") {
    allMembers = await db.query.members.findMany({
      where: eq(members.divisionId, userDivisionId as number),
      with: { period: true, position: true, division: true },
      orderBy: (m, { asc }) => [asc(m.name)],
    });
  } else {
    allMembers = await db.query.members.findMany({
      with: { period: true, position: true, division: true },
      orderBy: (m, { asc }) => [asc(m.name)],
    });
  }

  const periods = await db.query.periods.findMany({ orderBy: (p, { desc }) => [desc(p.id)] });
  const divisions = await db.query.divisions.findMany({ orderBy: (d, { asc }) => [asc(d.name)] });
  const positions = await db.query.positions.findMany({ orderBy: (p, { asc }) => [asc(p.level)] });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Pengurus</h1>
          <p className="text-gray-500">Kelola data anggota kepengurusan LDK</p>
        </div>
      </div>
      <PengurusClient 
        initialData={allMembers} 
        periods={periods}
        divisions={divisions}
        positions={positions}
        userRole={userRole}
        userDivisionId={userDivisionId}
      />
    </div>
  );
}
