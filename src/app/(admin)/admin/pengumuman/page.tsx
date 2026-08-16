import { Metadata } from "next";
import PengumumanClient from "./PengumumanClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Pengumuman & Instruksi | Admin LDK Al-Hidayah",
};

export default async function PengumumanPage() {
  const session = await auth();
  if (!session || session.user.realRole !== "super_admin") {
    redirect("/admin");
  }

  return <PengumumanClient />;
}
