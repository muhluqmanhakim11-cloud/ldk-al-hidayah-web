import { auth } from "@/auth";
import { db } from "@/db";
import { redirect } from "next/navigation";
import ProgramsClient from "./ProgramsClient";

export default async function ProgramsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const periods = await db.query.periods.findMany({ orderBy: (p, { desc }) => [desc(p.id)] });
  const divisions = await db.query.divisions.findMany({ orderBy: (d, { asc }) => [asc(d.name)] });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Kerja</h1>
          <p className="text-gray-500">Kelola program kerja LDK</p>
        </div>
      </div>
      <ProgramsClient 
        periods={periods}
        divisions={divisions}
        userRole={session.user.role}
        userDivisionId={session.user.divisionId}
      />
    </div>
  );
}
