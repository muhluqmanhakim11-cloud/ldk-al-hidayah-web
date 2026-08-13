import { Metadata } from "next";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Profil Organisasi",
};

export const revalidate = 0; // Ensure data is always fresh

export default async function ProfilPage() {
  const profileSections = await db.query.profiles.findMany({
    where: eq(profiles.status, "PUBLISHED"),
    orderBy: [asc(profiles.orderIndex)],
  });

  return (
    <div className="bg-white pb-20">
      {/* Page Header */}
      <div className="bg-green-800 text-white pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Profil Organisasi</h1>
          <p className="text-green-100 max-w-2xl mx-auto text-lg">Mengenal lebih dekat Lembaga Dakwah Kampus Al-Hidayah.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 mt-12 md:mt-16">
        <div className="max-w-4xl mx-auto space-y-12 text-gray-700 leading-relaxed text-lg">
          
          {profileSections.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Belum ada informasi profil yang dipublikasikan.
            </div>
          ) : (
            profileSections.map((section) => (
              <section key={section.id}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">{section.title}</h2>
                <div 
                  className="prose max-w-none text-gray-700 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </section>
            ))
          )}

        </div>
      </div>
    </div>
  );
}
