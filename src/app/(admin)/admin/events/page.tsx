import { auth } from "@/auth";
import { db } from "@/db";
import { redirect } from "next/navigation";
import EventsClient from "./EventsClient";
import { eq } from "drizzle-orm";
import { programs } from "@/db/schema";

export default async function EventsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userRole = session.user.role;
  const userDivisionId = session.user.divisionId;

  const periods = await db.query.periods.findMany({ orderBy: (p, { desc }) => [desc(p.id)] });
  const divisions = await db.query.divisions.findMany({ orderBy: (d, { asc }) => [asc(d.name)] });
  
  let allPrograms = [];
  if (userRole === "ADMIN_BIDANG") {
    allPrograms = await db.query.programs.findMany({ 
      where: eq(programs.divisionId, userDivisionId as number),
      orderBy: (p, { desc }) => [desc(p.id)] 
    });
  } else {
    allPrograms = await db.query.programs.findMany({ orderBy: (p, { desc }) => [desc(p.id)] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kegiatan / Agenda</h1>
          <p className="text-gray-500">Kelola kegiatan LDK berdasarkan program kerja</p>
        </div>
      </div>
      <EventsClient 
        periods={periods}
        divisions={divisions}
        programs={allPrograms}
        userRole={userRole}
        userDivisionId={userDivisionId}
      />
    </div>
  );
}
