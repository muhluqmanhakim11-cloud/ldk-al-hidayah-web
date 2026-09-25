"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// ─── Keyword matcher ─────────────────────────────────────────────────────────
const ACTIVE_KEYWORDS = ["berjalan", "aktif", "ongoing", "berlangsung", "rutin"];
const SOON_KEYWORDS = ["segera", "menjelang", "akan datang", "dekat", "coming"];

function getCategory(customStatus: string | null | undefined): "active" | "soon" | "upcoming" {
  if (!customStatus) return "upcoming";
  const s = customStatus.toLowerCase();
  if (ACTIVE_KEYWORDS.some(k => s.includes(k))) return "active";
  if (SOON_KEYWORDS.some(k => s.includes(k))) return "soon";
  return "upcoming";
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function ProgramModal({ program, onClose }: { program: any; onClose: () => void }) {
  const category = getCategory(program.customStatus);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const badgeConfig = {
    active: { bg: "bg-green-50 dark:bg-green-900/30", border: "border-green-200 dark:border-green-800", text: "text-green-800 dark:text-green-300", dot: "bg-green-500", ping: "bg-green-400" },
    soon:   { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", text: "text-amber-800 dark:text-amber-300", dot: "bg-amber-500", ping: "bg-amber-400" },
    upcoming:{ bg: "bg-slate-50 dark:bg-slate-800/50", border: "border-slate-200 dark:border-slate-700", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-400", ping: "bg-slate-300" },
  };
  const badge = badgeConfig[category];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative"
        style={{ animation: "modalIn 0.22s cubic-bezier(.22,1,.36,1) both" }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.93) translateY(18px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          <div className="mb-6">
            <div className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">
              {program.division?.name || "Umum"}
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
              {program.name}
            </h2>

            {program.customStatus && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${badge.bg} ${badge.border}`}>
                <span className="relative flex h-3 w-3">
                  {category === "active" && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${badge.ping} opacity-75`}></span>}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${badge.dot}`}></span>
                </span>
                <span className={`text-sm font-semibold ${badge.text}`}>
                  {program.customStatus}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {program.schedule && (
              <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Waktu Pelaksanaan</h4>
                  <p className="text-gray-600 dark:text-gray-400">{program.schedule}</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Deskripsi Program
              </h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {program.description || "Belum ada deskripsi."}
              </p>
            </div>

            {program.objective && (
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Tujuan
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {program.objective}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 px-8 py-3 rounded-full font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, desc, accent }: { icon: React.ReactNode; title: string; desc: string; accent: string }) {
  return (
    <div className={`flex items-center gap-4 mb-8 p-4 rounded-2xl border ${accent}`}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm bg-white dark:bg-slate-900">
        {icon}
      </div>
      <div>
        <h2 className="font-extrabold text-lg text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

// ─── Timeline Column (single vertical list) ───────────────────────────────────
function TimelineColumn({
  programs,
  dotColor,
  lineColor,
  onSelect,
}: {
  programs: any[];
  dotColor: string;
  lineColor: string;
  onSelect: (p: any) => void;
}) {
  const category = programs.length > 0 ? getCategory(programs[0].customStatus) : "upcoming";

  return (
    <div className="relative pl-10">
      {/* Vertical line */}
      <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${lineColor} rounded-full pointer-events-none`}></div>

      <div className="space-y-6">
        {programs.map(program => {
          const cat = getCategory(program.customStatus);
          return (
            <div key={program.id} className="relative">
              {/* Dot */}
              <div
                className={`absolute -left-[22px] top-5 w-5 h-5 rounded-full ${dotColor} border-2 border-white dark:border-slate-950 shadow flex items-center justify-center cursor-pointer hover:scale-125 transition-transform`}
                onClick={() => onSelect(program)}
              >
                {cat === "active" && (
                  <span className="absolute inset-0 rounded-full animate-ping opacity-60 bg-green-400"></span>
                )}
              </div>

              {/* Card */}
              <div
                className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => onSelect(program)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
                      {program.division?.name || "Umum"}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {program.name}
                    </h3>
                  </div>

                  {program.customStatus && (
                    <div className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border
                      ${cat === "active" ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300" :
                        cat === "soon"   ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300" :
                        "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"}`}
                    >
                      {cat === "active" && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      )}
                      {program.customStatus}
                    </div>
                  )}
                </div>

                {program.schedule && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {program.schedule}
                  </p>
                )}

                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 line-clamp-2">{program.description}</p>

                <div className="mt-3 text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-1">
                  Lihat Detail
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProgramTimelineClient({ programs }: { programs: any[] }) {
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (programs.length === 0) {
    return (
      <div className="text-center p-12 bg-white dark:bg-slate-900 border border-dashed rounded-xl shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Belum ada program</h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Program kerja untuk periode ini belum dipublikasikan.</p>
      </div>
    );
  }

  // Sort into groups
  const active   = programs.filter(p => getCategory(p.customStatus) === "active");
  const soon     = programs.filter(p => getCategory(p.customStatus) === "soon");
  const upcoming = programs.filter(p => getCategory(p.customStatus) === "upcoming");

  return (
    <>
      <div className="space-y-16 pb-16">

        {/* ── Sedang Berjalan ── */}
        {active.length > 0 && (
          <div>
            <SectionHeader
              icon={
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                </span>
              }
              title="Sedang Berjalan"
              desc="Program yang aktif berjalan pada periode ini"
              accent="bg-green-50/80 border-green-200 dark:bg-green-900/20 dark:border-green-800"
            />
            <TimelineColumn programs={active} dotColor="bg-green-500" lineColor="bg-green-300 dark:bg-green-800" onSelect={setSelectedProgram} />
          </div>
        )}

        {/* ── Segera Berjalan ── */}
        {soon.length > 0 && (
          <div>
            <SectionHeader
              icon={
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Segera Berjalan"
              desc="Program yang akan dimulai dalam waktu dekat"
              accent="bg-amber-50/80 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
            />
            <TimelineColumn programs={soon} dotColor="bg-amber-500" lineColor="bg-amber-300 dark:bg-amber-800" onSelect={setSelectedProgram} />
          </div>
        )}

        {/* ── Mendatang ── */}
        {upcoming.length > 0 && (
          <div>
            <SectionHeader
              icon={
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title="Mendatang"
              desc="Program yang dijadwalkan pada waktu yang akan datang"
              accent="bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
            />
            <TimelineColumn programs={upcoming} dotColor="bg-slate-400" lineColor="bg-slate-200 dark:bg-slate-700" onSelect={setSelectedProgram} />
          </div>
        )}
      </div>

      {/* Portal Modal */}
      {mounted && selectedProgram && (
        <ProgramModal program={selectedProgram} onClose={() => setSelectedProgram(null)} />
      )}
    </>
  );
}
