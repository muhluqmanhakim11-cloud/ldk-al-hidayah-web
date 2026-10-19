export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Metadata } from "next";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import PageHero from "@/components/public/PageHero";

export const metadata: Metadata = {
  title: "Profil Organisasi",
  description: "Mengenal lebih dekat Lembaga Dakwah Kampus Al-Hidayah.",
};

export default async function ProfilPage() {
  const profileSections = await db.query.profiles.findMany({
    where: eq(profiles.status, "PUBLISHED"),
    orderBy: [asc(profiles.orderIndex)],
  });

  return (
    <div className="bg-gray-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Profil Organisasi"
        subtitle="Mengenal lebih dekat Lembaga Dakwah Kampus Al-Hidayah — visi, misi, dan sejarah organisasi."
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
          <div className="space-y-12">
            {profileSections.map((section, i) => (
              <section
                key={section.id}
                style={{
                  animation: `cardReveal 0.6s ${i * 0.12}s cubic-bezier(0.16,1,0.3,1) both`,
                }}
              >
                {/* Section heading */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    style={{
                      width: "4px",
                      minHeight: "40px",
                      borderRadius: "9999px",
                      background: "linear-gradient(to bottom, #16a34a, #34d399)",
                      flexShrink: 0,
                    }}
                  />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {section.title}
                  </h2>
                </div>

                {/* Card */}
                <div
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden"
                  style={{ transition: "box-shadow 0.3s ease, transform 0.3s ease" }}
                  onMouseEnter={undefined}
                >
                  {section.imageUrl && (
                    <div className="relative w-full overflow-hidden" style={{ maxHeight: 300 }}>
                      <img
                        src={section.imageUrl}
                        alt={section.title}
                        className="w-full object-cover"
                        style={{ maxHeight: 300, transition: "transform 0.6s ease" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "80px",
                          background: "linear-gradient(to top, rgba(255,255,255,1) 0%, transparent 100%)",
                          pointerEvents: "none",
                        }}
                        className="dark:bg-gradient-to-t dark:from-slate-900"
                      />
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

      <style>{`
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
