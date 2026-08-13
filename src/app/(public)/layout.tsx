import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | LDK Al-Hidayah",
    default: "LDK Al-Hidayah - Unit Kegiatan Mahasiswa Islam",
  },
  description: "Unit Kegiatan Mahasiswa tingkat Universitas yang bergerak di bidang kerohanian Islam untuk mewujudkan kampus madani.",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
