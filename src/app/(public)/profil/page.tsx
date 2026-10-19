export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Metadata } from "next";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import PageHero from "@/components/public/PageHero";
import ProfilAccordion from "./ProfilAccordion";

export const metadata: Metadata = {
  title: "Profil Organisasi",
  description:
    "Mengenal lebih dekat Lembaga Dakwah Kampus Al-Hidayah — visi, misi, dan sejarah organisasi.",
};

export default async function ProfilPage() {
  const profileSections = await db.query.profiles.findMany({
    where: eq(profiles.status, "PUBLISHED"),
    orderBy: [asc(profiles.orderIndex)],
  });

  return (
    <div className="bg-gray-50 dark:bg-slate-950 pb-28">
      <PageHero
        title="Profil Organisasi"
        subtitle="Mengenal lebih dekat Lembaga Dakwah Kampus Al-Hidayah — visi, misi, dan sejarah."
        badge="Tentang Kami"
      />

      <div className="container mx-auto px-4 lg:px-8 mt-16 max-w-3xl">
        {profileSections.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 1rem",
              animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}
            >
              <svg width="32" height="32" fill="none" stroke="#86efac" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: "1.05rem", fontWeight: 500 }}>
              Belum ada informasi profil yang dipublikasikan.
            </p>
          </div>
        ) : (
          <ProfilAccordion sections={profileSections} />
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
