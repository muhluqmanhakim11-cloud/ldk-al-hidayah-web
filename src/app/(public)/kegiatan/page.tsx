export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import PageHero from "@/components/public/PageHero";
import ScrollReveal from "@/components/public/ScrollReveal";

export const metadata: Metadata = {
  title: "Kegiatan & Agenda",
  description: "Informasi terbaru mengenai agenda dan kegiatan LDK Al-Hidayah.",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  UPCOMING:  { label: "Mendatang",  color: "bg-amber-500" },
  ONGOING:   { label: "Berlangsung", color: "bg-green-500" },
  DONE:      { label: "Selesai",    color: "bg-gray-400" },
  PUBLISHED: { label: "Publik",     color: "bg-blue-500" },
  COMPLETED: { label: "Selesai",    color: "bg-gray-400" },
};

export default async function KegiatanPage() {
  const publishedEvents = await db.query.events.findMany({
    where: eq(events.status, "PUBLISHED"),
    with: { division: true },
    orderBy: [desc(events.date)],
  });

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-24">
      <ScrollReveal />
      <PageHero
        title="Kegiatan & Agenda"
        subtitle="Informasi terbaru mengenai agenda kegiatan LDK Al-Hidayah"
        badge="Agenda"
      />

      <div className="container mx-auto px-4 lg:px-8 mt-14">
        {publishedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedEvents.map((event, idx) => (
              <article
                key={event.id}
                className={`reveal delay-${Math.min((idx % 3) * 100 + 100, 500)} group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300`}
              >
                {/* Top colored stripe */}
                <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-400" />

                <div className="p-6 flex flex-col h-full">
                  {/* Badge row */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                      {event.division?.name || "Umum"}
                    </span>
                    {statusConfig[event.status] && (
                      <span className={`flex items-center gap-1.5 text-xs font-semibold text-white px-2.5 py-1 rounded-full ${statusConfig[event.status].color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                        {statusConfig[event.status].label}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-snug group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                    {event.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 line-clamp-3 flex-grow leading-relaxed">
                    {event.description}
                  </p>

                  {/* Meta info */}
                  <div className="space-y-2 mt-auto pt-4 border-t border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span>
                        {event.date
                          ? new Date(event.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              timeZone: "Asia/Jakarta",
                            })
                          : "—"}
                      </span>
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span>{event.time}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="truncate">{event.location || "—"}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Belum ada kegiatan</h3>
            <p className="text-gray-400 dark:text-gray-500">Tidak ada agenda kegiatan yang dipublikasikan saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
