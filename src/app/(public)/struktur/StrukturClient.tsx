"use client";

import { useState } from "react";
import MemberCard from "./MemberCard";

type Member = {
  id: number;
  name: string;
  photoUrl?: string | null;
  position?: { name: string; level?: number | null } | null;
  division?: { id: number; name: string } | null;
  divisionId?: number | null;
};

type Division = {
  id: number;
  name: string;
  members: Member[];
};

type Props = {
  bphMembers: Member[];
  groupedByDivision: Division[];
  periodName: string;
};

const ACCENT_COLORS = [
  { line: "#16a34a", bg: "rgba(22,163,74,0.07)", dot: "#16a34a", text: "#15803d", darkText: "#4ade80" },
  { line: "#0d9488", bg: "rgba(13,148,136,0.07)", dot: "#0d9488", text: "#0f766e", darkText: "#2dd4bf" },
  { line: "#7c3aed", bg: "rgba(124,58,237,0.07)", dot: "#7c3aed", text: "#6d28d9", darkText: "#a78bfa" },
  { line: "#ea580c", bg: "rgba(234,88,12,0.07)",  dot: "#ea580c", text: "#c2410c", darkText: "#fb923c" },
  { line: "#0284c7", bg: "rgba(2,132,199,0.07)",  dot: "#0284c7", text: "#0369a1", darkText: "#38bdf8" },
  { line: "#db2777", bg: "rgba(219,39,119,0.07)", dot: "#db2777", text: "#be185d", darkText: "#f472b6" },
];

export default function StrukturClient({ bphMembers, groupedByDivision, periodName }: Props) {
  const [activeTab, setActiveTab] = useState<"bph" | number>("bph");
  const [search, setSearch] = useState("");

  const allTabs = [
    { id: "bph" as const, label: "BPH & Penasehat", count: bphMembers.length },
    ...groupedByDivision.map((d) => ({ id: d.id as number, label: d.name, count: d.members.length })),
  ];

  const currentMembers: Member[] =
    activeTab === "bph"
      ? bphMembers
      : groupedByDivision.find((d) => d.id === activeTab)?.members ?? [];

  const filtered = search.trim()
    ? currentMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.position?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : currentMembers;

  const currentDivIndex = activeTab === "bph" ? -1 : groupedByDivision.findIndex((d) => d.id === activeTab);
  const accent = currentDivIndex >= 0 ? ACCENT_COLORS[currentDivIndex % ACCENT_COLORS.length] : null;
  const isBph = activeTab === "bph";

  return (
    <div>
      {/* ── Stats summary ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.75rem",
          animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {[
          { label: "Total Pengurus", value: bphMembers.length + groupedByDivision.reduce((s, d) => s + d.members.length, 0), icon: "👥" },
          { label: "Bidang/Divisi", value: groupedByDivision.length, icon: "🏛️" },
          { label: "Periode", value: periodName, icon: "📅" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800"
            style={{
              borderRadius: "0.875rem",
              border: "1px solid",
              padding: "0.6rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <span style={{ fontSize: "1rem" }}>{s.icon}</span>
            <div>
              <div className="text-gray-900 dark:text-gray-100" style={{ fontSize: "1rem", fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
              <div className="text-gray-400 dark:text-gray-500" style={{ fontSize: "0.68rem", marginTop: "1px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search bar ── */}
      <div
        style={{
          position: "relative",
          marginBottom: "1.5rem",
          animation: "fadeUp 0.55s 0.05s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <svg
          style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau jabatan pengurus..."
          className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-slate-700 placeholder-gray-400"
          style={{
            width: "100%",
            paddingLeft: "2.75rem",
            paddingRight: search ? "2.75rem" : "1rem",
            paddingTop: "0.7rem",
            paddingBottom: "0.7rem",
            border: "1.5px solid",
            borderRadius: "0.875rem",
            fontSize: "0.9rem",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => { e.target.style.borderColor = "#16a34a"; e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.12)"; }}
          onBlur={(e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = "none"; }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "50%" }}
          >
            <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Tab bar ── */}
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          overflowX: "auto",
          paddingBottom: "0.25rem",
          marginBottom: "1.75rem",
          scrollbarWidth: "none",
          animation: "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {allTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const tabIdx = tab.id === "bph" ? -1 : groupedByDivision.findIndex((d) => d.id === tab.id);
          const tabColor = tabIdx >= 0 ? ACCENT_COLORS[tabIdx % ACCENT_COLORS.length].line : "#3b82f6";
          return (
            <button
              key={String(tab.id)}
              onClick={() => { setActiveTab(tab.id); setSearch(""); }}
              style={{
                flexShrink: 0,
                padding: "0.55rem 1.1rem",
                borderRadius: "9999px",
                border: isActive ? `1.5px solid ${tabColor}` : "1.5px solid transparent",
                background: isActive ? tabColor : "transparent",
                color: isActive ? "white" : "#64748b",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.22s ease",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
              className={!isActive ? "hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-slate-400" : ""}
            >
              {tab.label}
              <span
                style={{
                  background: isActive ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                  color: isActive ? "white" : "#64748b",
                  borderRadius: "9999px",
                  padding: "1px 7px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Member grid ── */}
      <div key={String(activeTab) + search} style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
        {/* Section header bar */}
        <div
          className="bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800"
          style={{
            borderRadius: "1rem",
            border: "1px solid",
            padding: "1rem 1.25rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            borderLeft: `4px solid ${isBph ? "#3b82f6" : (accent?.line ?? "#16a34a")}`,
          }}
        >
          <div>
            <h2 className="text-gray-900 dark:text-gray-100" style={{ fontSize: "1.05rem", fontWeight: 700 }}>
              {isBph ? "Badan Pengurus Harian & Penasehat" : allTabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: "0.75rem", marginTop: "2px" }}>
              {search ? `${filtered.length} dari ${currentMembers.length} pengurus ditemukan` : `${currentMembers.length} pengurus`}
            </p>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: "1rem",
            }}
          >
            {filtered.map((member, idx) => (
              <div
                key={member.id}
                style={{ animation: `fadeUp 0.4s ${idx * 0.04}s cubic-bezier(0.16,1,0.3,1) both` }}
              >
                <MemberCard
                  member={member}
                  className=""
                  nameClassName=""
                  positionClassName=""
                  accentColor={isBph ? "#3b82f6" : (accent?.line ?? "#16a34a")}
                  accentBg={isBph ? "rgba(59,130,246,0.07)" : (accent?.bg ?? "rgba(22,163,74,0.07)")}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <svg width="28" height="28" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400" style={{ fontWeight: 500 }}>
              {search ? `Tidak ada pengurus bernama "${search}"` : "Belum ada pengurus di bidang ini."}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
