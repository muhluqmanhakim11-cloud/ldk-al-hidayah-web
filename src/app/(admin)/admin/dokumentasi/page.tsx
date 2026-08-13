import { auth } from "@/auth";
import { db } from "@/db";
import { redirect } from "next/navigation";
import GalleriesClient from "./GalleriesClient";
import { eq } from "drizzle-orm";
import { events } from "@/db/schema";

export default async function GalleriesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userRole = session.user.role;
  const userDivisionId = session.user.divisionId;

  const periods = await db.query.periods.findMany({ orderBy: (p, { desc }) => [desc(p.id)] });
  const divisions = await db.query.divisions.findMany({ orderBy: (d, { asc }) => [asc(d.name)] });
  
  let allEvents = [];
  if (userRole === "ADMIN_BIDANG") {
    allEvents = await db.query.events.findMany({ 
      where: eq(events.divisionId, userDivisionId as number),
      orderBy: (p, { desc }) => [desc(p.id)] 
    });
  } else {
    allEvents = await db.query.events.findMany({ orderBy: (p, { desc }) => [desc(p.id)] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dokumentasi & Galeri</h1>
          <p className="text-gray-500">Kelola dokumentasi LDK berdasarkan kegiatan</p>
        </div>
      </div>
      <GalleriesClient 
        periods={periods}
        divisions={divisions}
        events={allEvents}
        userRole={userRole}
        userDivisionId={userDivisionId}
      />
    </div>
  );
}
