import { Metadata } from "next";
import ClientPage from "./ClientPage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Agenda Latihan | Admin LDK Al-Hidayah",
};

export default async function Page() {
  const session = await auth();
  if (!session || (session.user.realRole !== "super_admin" && session.user.realRole !== "admin_seni_olahraga")) {
    redirect("/admin");
  }

  return <ClientPage />;
}
