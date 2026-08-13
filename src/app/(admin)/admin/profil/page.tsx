import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfilClient from "./ProfilClient";

export default async function AdminProfilPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userRole = session.user.role;
  if (userRole !== "SUPER_ADMIN" && userRole !== "KETUA") {
    redirect("/admin");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Profil LDK</h1>
        <p className="text-gray-600 mt-2">Atur bagian-bagian yang akan ditampilkan di halaman Profil publik.</p>
      </div>
      <ProfilClient />
    </div>
  );
}
