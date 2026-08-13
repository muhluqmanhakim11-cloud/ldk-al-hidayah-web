import { auth } from "@/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <AdminLayout session={session}>{children}</AdminLayout>;
}
