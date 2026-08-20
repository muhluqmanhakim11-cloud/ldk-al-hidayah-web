import { auth } from "@/auth";
import { db } from "@/db";
import { redirect } from "next/navigation";
import JabatanClient from "./JabatanClient";

export default async function JabatanPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const positions = await db.query.positions.findMany({
    orderBy: (p, { asc }) => [asc(p.level)],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Data Jabatan</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola hierarki jabatan organisasi</p>
        </div>
      </div>
      <JabatanClient initialData={positions} userRole={session.user.role || ""} />
    </div>
  );
}
