export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import PageHero from "@/components/public/PageHero";

export const metadata: Metadata = {
  title: "Kegiatan & Agenda",
  description: "Informasi terbaru mengenai agenda dan kegiatan LDK Al-Hidayah.",
};

const statusConfig: Record<string, { label: string; bg: string; dot: string }> = {
  UPCOMING:  { label: "Mendatang",   bg: "rgba(245,158,11,0.12)",  dot: "#f59e0b" },
  ONGOING:   { label: "Berlangsung", bg: "rgba(34,197,94,0.12)",   dot: "#22c55e" },
  DONE:      { label: "Selesai",     bg: "rgba(148,163,184,0.12)", dot: "#94a3b8" },
  PUBLISHED: { label: "Publik",      bg: "rgba(59,130,246,0.12)",  dot: "#3b82f6" },
  COMPLETED: { label: "Selesai",     bg: "rgba(148,163,184,0.12)", dot: "#94a3b8" },
};

export default async function KegiatanPage() {
  const publishedEvents = await db.query.events.findMany({
    where: eq(events.status, "PUBLISHED"),
    with: { division: true },
    orderBy: [desc(events.date)],
  });

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-24">
      <PageHero
        title="Kegiatan & Agenda"
        subtitle="Informasi terbaru mengenai agenda kegiatan LDK Al-Hidayah"
        badge="Agenda"
      />

      <div className="container mx-auto px-4 lg:px-8 mt-14">
        {publishedEvents.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.75rem",
            }}
          >
            {publishedEvents.map((event, idx) => {
              const st = statusConfig[event.status];
              return (
                <article
                  key={event.id}
                  className="bg-white dark:bg-slate-900 dark:border-slate-800 group"
                  style={{
                    borderRadius: "1.25rem",
                    border: "1px solid #f1f5f9",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    transition: "box-shadow 0.3s ease, transform 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    animation: `cardReveal 0.55s ${Math.min(idx * 0.08, 0.4)}s cubic-bezier(0.16,1,0.3,1) both`,
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.13)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                  }}
                >
                  {/* Gradient top stripe */}
                  <div
                    style={{
                      height: "5px",
                      background: "linear-gradient(90deg, #16a34a, #34d399, #22c55e)",
                    }}
                  />

                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    {/* Top row: division + status */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.9rem", gap: "0.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "#16a34a",
                          background: "rgba(22,163,74,0.1)",
                          borderRadius: "9999px",
                          padding: "4px 12px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {event.division?.name || "Umum"}
                      </span>
                      {st && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            color: st.dot,
                            background: st.bg,
                            borderRadius: "9999px",
                            padding: "4px 10px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: st.dot, display: "inline-block" }} />
                          {st.label}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      className="text-gray-900 dark:text-gray-100"
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        lineHeight: 1.35,
                        marginBottom: "0.6rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        transition: "color 0.2s",
                      }}
                    >
                      {event.name}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-gray-500 dark:text-gray-400"
                      style={{
                        fontSize: "0.875rem",
                        lineHeight: 1.6,
                        marginBottom: "1rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        flex: 1,
                      }}
                    >
                      {event.description}
                    </p>

                    {/* Meta */}
                    <div
                      className="border-gray-100 dark:border-slate-800"
                      style={{ borderTop: "1px solid", marginTop: "auto", paddingTop: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}
                    >
                      {[
                        {
                          icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                          text: event.date
                            ? new Date(event.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })
                            : "—",
                        },
                        ...(event.time ? [{ icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", text: event.time }] : []),
                        { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", text: event.location || "—" },
                      ].map((item, mi) => (
                        <div key={mi} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <span
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "8px",
                              background: "rgba(22,163,74,0.08)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <svg width="13" height="13" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d={item.icon} />
                            </svg>
                          </span>
                          <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <svg width="36" height="36" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-gray-700 dark:text-gray-300" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Belum ada kegiatan</h3>
            <p className="text-gray-400 dark:text-gray-500">Tidak ada agenda kegiatan yang dipublikasikan saat ini.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
