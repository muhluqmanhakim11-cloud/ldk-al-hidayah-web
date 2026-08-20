import { auth } from "@/auth";
import { db } from "@/db";
import { redirect } from "next/navigation";
import PeriodeClient from "./PeriodeClient";

export default async function PeriodePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const periods = await db.query.periods.findMany({
    orderBy: (p, { desc }) => [desc(p.id)],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Data Periode</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola periode kepengurusan LDK</p>
        </div>
      </div>
      <PeriodeClient initialData={periods} userRole={session.user.role || ""} />
    </div>
  );
}
