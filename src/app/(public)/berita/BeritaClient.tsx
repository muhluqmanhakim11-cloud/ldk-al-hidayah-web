"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Article = {
  id: number;
  title: string;
  slug: string;
  content?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | string | null;
  author?: { name: string } | null;
  division?: { id: number; name: string } | null;
};

type Props = {
  articles: Article[];
  divisions: { id: number; name: string }[];
};

export default function BeritaClient({ articles, divisions }: Props) {
  const [search, setSearch] = useState("");
  const [activeDivision, setActiveDivision] = useState<number | "ALL">("ALL");

  const filtered = articles.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || (a.author?.name ?? "").toLowerCase().includes(q);
    const matchDiv = activeDivision === "ALL" || a.division?.id === activeDivision;
    return matchSearch && matchDiv;
  });

  if (articles.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
        <div className="bg-gray-100 dark:bg-slate-800" style={{ width: "80px", height: "80px", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <svg width="36" height="36" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-gray-700 dark:text-gray-300" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Belum ada artikel</h3>
        <p className="text-gray-400">Belum ada tulisan atau berita yang dipublikasikan.</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1.25rem", animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <svg style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="15" height="15" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau penulis..."
            className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-slate-700"
            style={{ width: "100%", paddingLeft: "2.5rem", paddingRight: "1rem", paddingTop: "0.65rem", paddingBottom: "0.65rem", border: "1.5px solid", borderRadius: "0.875rem", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s" }}
            onFocus={(e) => { e.target.style.borderColor = "#16a34a"; e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Division filter tabs */}
        {divisions.length > 0 && (
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {[{ id: "ALL" as const, name: "Semua" }, ...divisions].map((div) => {
              const isActive = activeDivision === div.id;
              const cnt = div.id === "ALL" ? articles.length : articles.filter((a) => a.division?.id === div.id).length;
              if (div.id !== "ALL" && cnt === 0) return null;
              return (
                <button
                  key={String(div.id)}
                  onClick={() => setActiveDivision(div.id)}
                  style={{ padding: "0.5rem 0.9rem", borderRadius: "9999px", border: isActive ? "1.5px solid #16a34a" : "1.5px solid transparent", background: isActive ? "#16a34a" : "transparent", color: isActive ? "white" : "#64748b", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.3rem" }}
                  className={!isActive ? "hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-slate-400" : ""}
                >
                  {div.name}
                  <span style={{ background: isActive ? "rgba(255,255,255,0.25)" : "#e2e8f0", color: isActive ? "white" : "#64748b", borderRadius: "9999px", padding: "0 6px", fontSize: "0.68rem", fontWeight: 700 }}>{cnt}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: "0.8rem", marginBottom: "1.25rem" }}>
        Menampilkan <strong>{filtered.length}</strong> dari {articles.length} artikel
      </p>

      {/* ── Grid ── */}
      {filtered.length > 0 ? (
        <div key={String(activeDivision) + search} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "1.5rem" }}>
          {filtered.map((article, idx) => (
            <Link
              key={article.id}
              href={`/berita/${article.slug}`}
              className="group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800"
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: "1.25rem",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                textDecoration: "none",
                animation: `fadeUp 0.45s ${idx * 0.05}s cubic-bezier(0.16,1,0.3,1) both`,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 40px rgba(0,0,0,0.1)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
            >
              {/* Cover */}
              <div className="bg-gray-100 dark:bg-slate-800" style={{ position: "relative", height: "210px", overflow: "hidden", flexShrink: 0 }}>
                {article.coverImage ? (
                  <Image src={article.coverImage} alt={article.title} fill sizes="33vw"
                    style={{ objectFit: "cover", transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)" }}
                    className="group-hover:scale-105"
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #dcfce7, #bbf7d0)" }}>
                    <svg width="36" height="36" fill="none" stroke="#86efac" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                )}
                {/* Bottom gradient */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 55%)", pointerEvents: "none" }} />
                {article.division && (
                  <span style={{ position: "absolute", top: "10px", left: "10px", background: "#16a34a", color: "white", fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", padding: "3px 10px", borderRadius: "9999px", zIndex: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
                    {article.division.name}
                  </span>
                )}
              </div>

              {/* Body */}
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 className="text-gray-900 dark:text-gray-100 group-hover:text-green-700" style={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1.4, marginBottom: "0.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", transition: "color 0.2s" }}>
                  {article.title}
                </h3>
                <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: "0.85rem", lineHeight: 1.6, flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "1rem" }}
                  dangerouslySetInnerHTML={{ __html: (article.content || "").substring(0, 200) + "…" }}
                />
                {/* Author row */}
                <div className="border-gray-100 dark:border-slate-800" style={{ borderTop: "1px solid", paddingTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#16a34a,#34d399)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>
                    {article.author?.name?.charAt(0).toUpperCase() ?? "A"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-gray-900 dark:text-gray-100" style={{ fontSize: "0.78rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{article.author?.name ?? "Admin"}</p>
                    <p className="text-gray-400" style={{ fontSize: "0.71rem" }}>
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }) : "—"}
                    </p>
                  </div>
                  <span className="text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100" style={{ fontSize: "0.75rem", fontWeight: 700, transition: "opacity 0.2s", whiteSpace: "nowrap" }}>Baca →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <p className="text-gray-400 dark:text-gray-500" style={{ fontWeight: 500 }}>Tidak ada artikel yang sesuai filter.</p>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .group:hover .group-hover\\:scale-105 { transform: scale(1.05); }
        .group:hover .group-hover\\:text-green-700 { color: #15803d; }
        .group:hover .group-hover\\:opacity-100 { opacity: 1; }
      `}</style>
    </div>
  );
}
