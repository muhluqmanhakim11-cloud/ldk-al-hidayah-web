import { auth } from "@/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import { redirect } from "next/navigation";
import { db } from "@/db";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const settings = await db.query.siteSettings.findFirst();

  if (!session) {
    redirect("/login");
  }

  return <AdminLayout session={session} vercelBadgeUrl={settings?.vercelBadgeUrl}>{children}</AdminLayout>;
}
