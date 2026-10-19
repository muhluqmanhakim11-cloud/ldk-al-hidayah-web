"use client";

import { useState } from "react";

type Event = {
  id: number;
  name: string;
  description?: string | null;
  date?: Date | string | null;
  time?: string | null;
  location?: string | null;
  status: string;
  division?: { name: string } | null;
};

type Props = { events: Event[] };

const STATUS_TABS = [
  { key: "ALL", label: "Semua" },
  { key: "UPCOMING", label: "Mendatang" },
  { key: "ONGOING", label: "Berlangsung" },
  { key: "DONE", label: "Selesai" },
];

const STATUS_STYLE: Record<string, { bg: string; dot: string; label: string }> = {
  UPCOMING:  { bg: "rgba(245,158,11,0.12)",  dot: "#f59e0b",  label: "Mendatang" },
  ONGOING:   { bg: "rgba(34,197,94,0.12)",   dot: "#22c55e",  label: "Berlangsung" },
  DONE:      { bg: "rgba(148,163,184,0.12)", dot: "#94a3b8",  label: "Selesai" },
  PUBLISHED: { bg: "rgba(59,130,246,0.12)",  dot: "#3b82f6",  label: "Publik" },
  COMPLETED: { bg: "rgba(148,163,184,0.12)", dot: "#94a3b8",  label: "Selesai" },
};

export default function KegiatanClient({ events }: Props) {
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = events.filter((e) => {
    const matchStatus = activeStatus === "ALL" || e.status === activeStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || e.name.toLowerCase().includes(q) || (e.location ?? "").toLowerCase().includes(q) || (e.division?.name ?? "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const countByStatus = (key: string) => key === "ALL" ? events.length : events.filter((e) => e.status === key).length;

  if (events.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <svg width="36" height="36" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-gray-700 dark:text-gray-300" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Belum ada kegiatan</h3>
        <p className="text-gray-400">Tidak ada agenda kegiatan yang dipublikasikan saat ini.</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Search + Filter row ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1.5rem", animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: "220px" }}>
          <svg style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="15" height="15" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kegiatan, lokasi, bidang..."
            className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-slate-700"
            style={{ width: "100%", paddingLeft: "2.5rem", paddingRight: "1rem", paddingTop: "0.65rem", paddingBottom: "0.65rem", border: "1.5px solid", borderRadius: "0.875rem", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s" }}
            onFocus={(e) => { e.target.style.borderColor = "#16a34a"; e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Status filter tabs */}
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {STATUS_TABS.map((tab) => {
            const cnt = countByStatus(tab.key);
            if (tab.key !== "ALL" && cnt === 0) return null;
            const isActive = activeStatus === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveStatus(tab.key)}
                style={{
                  padding: "0.5rem 0.9rem",
                  borderRadius: "9999px",
                  border: isActive ? "1.5px solid #16a34a" : "1.5px solid transparent",
                  background: isActive ? "#16a34a" : "transparent",
                  color: isActive ? "white" : "#64748b",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
                className={!isActive ? "hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-slate-400" : ""}
              >
                {tab.label}
                <span style={{ background: isActive ? "rgba(255,255,255,0.25)" : "#e2e8f0", color: isActive ? "white" : "#64748b", borderRadius: "9999px", padding: "0 6px", fontSize: "0.68rem", fontWeight: 700 }}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Result count ── */}
      <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: "0.8rem", marginBottom: "1.25rem" }}>
        Menampilkan <strong>{filtered.length}</strong> dari {events.length} kegiatan
      </p>

      {/* ── Cards ── */}
      {filtered.length > 0 ? (
        <div key={activeStatus + search} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "1.5rem" }}>
          {filtered.map((event, idx) => {
            const st = STATUS_STYLE[event.status] ?? STATUS_STYLE["DONE"];
            return (
              <article
                key={event.id}
                className="bg-white dark:bg-slate-900"
                style={{
                  borderRadius: "1.25rem",
                  border: "1px solid #f1f5f9",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  display: "flex",
                  flexDirection: "column",
                  animation: `fadeUp 0.45s ${idx * 0.05}s cubic-bezier(0.16,1,0.3,1) both`,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 40px rgba(0,0,0,0.1)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
              >
                <div style={{ height: "5px", background: "linear-gradient(90deg, #16a34a, #34d399, #22c55e)" }} />
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#16a34a", background: "rgba(22,163,74,0.1)", borderRadius: "9999px", padding: "3px 10px" }}>
                      {event.division?.name || "Umum"}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.67rem", fontWeight: 600, color: st.dot, background: st.bg, borderRadius: "9999px", padding: "3px 9px", whiteSpace: "nowrap" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: st.dot, display: "inline-block" }} />
                      {st.label}
                    </span>
                  </div>
                  <h3 className="text-gray-900 dark:text-gray-100" style={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1.35, marginBottom: "0.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {event.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: "0.85rem", lineHeight: 1.6, flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "1rem" }}>
                    {event.description}
                  </p>
                  <div className="border-gray-100 dark:border-slate-800" style={{ borderTop: "1px solid", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                    {[
                      { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", text: event.date ? new Date(event.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }) : "—" },
                      ...(event.time ? [{ icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", text: event.time }] : []),
                      { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", text: event.location || "—" },
                    ].map((item, mi) => (
                      <div key={mi} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "rgba(22,163,74,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="12" height="12" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={item.icon} /></svg>
                        </span>
                        <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <p className="text-gray-400 dark:text-gray-500" style={{ fontWeight: 500 }}>Tidak ada kegiatan yang sesuai filter.</p>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
