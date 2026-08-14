import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Metadata } from "next";
import { db } from "@/db";

export const metadata: Metadata = {
  title: {
    template: "%s | LDK Al-Hidayah",
    default: "LDK Al-Hidayah - Unit Kegiatan Mahasiswa Islam",
  },
  description: "Unit Kegiatan Mahasiswa tingkat Universitas yang bergerak di bidang kerohanian Islam untuk mewujudkan kampus madani.",
};

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await db.query.siteSettings.findFirst();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar logoUrl={settings?.logoUrl} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
