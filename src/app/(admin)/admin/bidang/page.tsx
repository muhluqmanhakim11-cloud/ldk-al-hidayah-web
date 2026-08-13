import { auth } from "@/auth";
import { db } from "@/db";
import { redirect } from "next/navigation";
import BidangClient from "./BidangClient";

export default async function BidangPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const divisions = await db.query.divisions.findMany({
    with: { period: true },
    orderBy: (d, { asc }) => [asc(d.name)],
  });
  
  const periods = await db.query.periods.findMany({ orderBy: (p, { desc }) => [desc(p.id)] });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Bidang / Divisi</h1>
          <p className="text-gray-500">Kelola bidang dalam organisasi</p>
        </div>
      </div>
      <BidangClient initialData={divisions} periods={periods} userRole={session.user.role} />
    </div>
  );
}
