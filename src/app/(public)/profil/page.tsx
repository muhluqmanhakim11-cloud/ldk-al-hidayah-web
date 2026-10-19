export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Metadata } from "next";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import PageHero from "@/components/public/PageHero";
import ScrollReveal from "@/components/public/ScrollReveal";

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
    <div className="bg-gray-50 dark:bg-slate-950 pb-24">
      <ScrollReveal />
      <PageHero
        title="Profil Organisasi"
        subtitle="Mengenal lebih dekat Lembaga Dakwah Kampus Al-Hidayah"
        badge="Tentang Kami"
      />

      <div className="container mx-auto px-4 lg:px-8 mt-16 max-w-4xl">
        {profileSections.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium">Belum ada informasi profil yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="space-y-14">
            {profileSections.map((section, i) => (
              <section
                key={section.id}
                className={`reveal ${i % 2 === 0 ? "" : "delay-100"}`}
              >
                {/* Section heading with accent bar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-1 h-10 rounded-full bg-gradient-to-b from-green-500 to-emerald-400" />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {section.title}
                  </h2>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                  {section.imageUrl && (
                    <div className="relative w-full overflow-hidden" style={{ maxHeight: 280 }}>
                      <img
                        src={section.imageUrl}
                        alt={section.title}
                        className="w-full object-cover transition-transform duration-700 hover:scale-105"
                        style={{ maxHeight: 280 }}
                      />
                      {/* Gradient overlay at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />
                    </div>
                  )}
                  <div className="p-7 md:p-10">
                    <div
                      className="prose prose-green max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-base md:text-lg whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
