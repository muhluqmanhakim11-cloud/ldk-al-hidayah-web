import { auth } from "@/auth";
import { db } from "@/db";
import { redirect } from "next/navigation";
import ArticlesClient from "./ArticlesClient";

export const metadata = {
  title: "Kelola Artikel & Berita - Admin LDK",
};

export default async function ArticlesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const divisions = await db.query.divisions.findMany({
    orderBy: (d, { asc }) => [asc(d.name)],
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Artikel & Berita</h1>
          <p className="text-gray-500 mt-1">Kelola berita, press release, dan artikel LDK</p>
        </div>
      </div>

      <ArticlesClient 
        divisions={divisions} 
        userRole={session.user.role} 
        userDivisionId={session.user.divisionId}
      />
    </div>
  );
}
