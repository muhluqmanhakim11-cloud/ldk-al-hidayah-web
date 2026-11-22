"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Search, Calendar, Target, Info, X, ChevronRight, Sparkles, Filter } from "lucide-react";

// ─── Keyword matcher ─────────────────────────────────────────────────────────
const ACTIVE_KEYWORDS = ["berjalan", "aktif", "ongoing", "berlangsung", "rutin"];
const SOON_KEYWORDS = ["segera", "menjelang", "akan datang", "dekat", "coming"];

function getCategory(customStatus: string | null | undefined): "active" | "soon" | "upcoming" {
  if (!customStatus || customStatus.trim() === "-" || customStatus.trim() === "") return "upcoming";
  const s = customStatus.toLowerCase();
  if (ACTIVE_KEYWORDS.some(k => s.includes(k))) return "active";
  if (SOON_KEYWORDS.some(k => s.includes(k))) return "soon";
  return "upcoming";
}

function isValidStatusText(status: string | null | undefined): boolean {
  if (!status) return false;
  const s = status.trim();
  return s !== "" && s !== "-" && s !== "--" && s.toLowerCase() !== "null";
}

// ─── Modal Detail Program ─────────────────────────────────────────────────────
function ProgramModal({ program, onClose }: { program: any; onClose: () => void }) {
  const category = getCategory(program.customStatus);
  const showBadge = isValidStatusText(program.customStatus);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider block mb-2">
              {program.division?.name || "Umum"}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
              {program.name}
            </h2>

            {showBadge && (
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${badge.bg} ${badge.border} ${badge.text}`}>
                <span className="relative flex h-2.5 w-2.5">
                  {category === "active" && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${badge.ping} opacity-75`}></span>}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${badge.dot}`}></span>
                </span>
                <span>{program.customStatus}</span>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {program.schedule && (
              <div className="flex items-start gap-3 p-3.5 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                <div className="w-9 h-9 bg-blue-100 dark:bg-blue-800/60 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Jadwal Pelaksanaan</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{program.schedule}</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-green-500" />
                Deskripsi Program
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {program.description || "Belum ada rincian deskripsi untuk program ini."}
              </p>
            </div>

            {program.objective && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-green-500" />
                  Tujuan & Target
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {program.objective}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-5 border-t border-gray-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
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
function SectionHeader({ 
  icon, 
  title, 
  desc, 
  badgeColor,
  count
}: { 
  icon: React.ReactNode; 
  title: string; 
  desc: string; 
  badgeColor: string;
  count: number;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-gray-50 dark:bg-slate-800">
          {icon}
        </div>
        <div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
        </div>
      </div>
      <span className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
        {count} Program
      </span>
    </div>
  );
}

// ─── Timeline Item (Flex Layout: Guarantee 100% Exact Alignment) ──────────────
function TimelineItem({
  program,
  dotColor,
  lineColor,
  isLast,
  onSelect,
}: {
  program: any;
  dotColor: string;
  lineColor: string;
  isLast: boolean;
  onSelect: (p: any) => void;
}) {
  const cat = getCategory(program.customStatus);
  const showBadge = isValidStatusText(program.customStatus);

  return (
    <div className="flex gap-4 sm:gap-5 group">
      {/* Timeline Track: dot centered on top of line */}
      <div className="flex flex-col items-center shrink-0 pt-4">
        {/* Dot */}
        <div
          className={`w-5 h-5 rounded-full ${dotColor} border-2 border-white dark:border-slate-950 shadow flex items-center justify-center cursor-pointer group-hover:scale-125 transition-transform relative z-10`}
          onClick={() => onSelect(program)}
        >
          {cat === "active" && (
            <span className="absolute inset-0 rounded-full animate-ping opacity-60 bg-green-400"></span>
          )}
        </div>
        {/* Vertical Line */}
        {!isLast && (
          <div className={`w-0.5 flex-1 ${lineColor} my-1.5 rounded-full`}></div>
        )}
      </div>

      {/* Card Content */}
      <div
        className="flex-1 pb-6 cursor-pointer"
        onClick={() => onSelect(program)}
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-green-200 dark:hover:border-green-900/40 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[11px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider block mb-1">
                {program.division?.name || "Umum"}
              </span>
              <h4 className="font-bold text-base text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {program.name}
              </h4>
            </div>

            {showBadge && (
              <div
                className={`self-start shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  cat === "active"
                    ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300"
                    : cat === "soon"
                    ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300"
                    : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                }`}
              >
                {cat === "active" && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
                <span>{program.customStatus}</span>
              </div>
            )}
          </div>

          {program.schedule && (
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1.5">
              <Calendar className="w-3.5 h-3.5 text-green-500 shrink-0" />
              <span>{program.schedule}</span>
            </p>
          )}

          {program.description && (
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-2.5 line-clamp-2 leading-relaxed">
              {program.description}
            </p>
          )}

          <div className="mt-3.5 pt-3 border-t border-gray-50 dark:border-slate-800/80 text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-1">
            <span>Rincian Program</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProgramTimelineClient({ programs }: { programs: any[] }) {
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "soon" | "upcoming">("all");
  const [divisionFilter, setDivisionFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => { setMounted(true); }, []);

  // Ambil daftar divisi unik untuk opsi filter
  const divisions = useMemo(() => {
    const map = new Map<string, string>();
    programs.forEach(p => {
      if (p.division?.id && p.division?.name) {
        map.set(String(p.division.id), p.division.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [programs]);

  // Filter programs
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const cat = getCategory(p.customStatus);
      const matchTab = activeTab === "all" || cat === activeTab;
      const matchDiv = divisionFilter === "ALL" || String(p.division?.id) === divisionFilter;
      const matchSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
        (p.division?.name && p.division.name.toLowerCase().includes(search.toLowerCase()));
      return matchTab && matchDiv && matchSearch;
    });
  }, [programs, activeTab, divisionFilter, search]);

  // Grouping
  const activeList   = useMemo(() => filteredPrograms.filter(p => getCategory(p.customStatus) === "active"), [filteredPrograms]);
  const soonList     = useMemo(() => filteredPrograms.filter(p => getCategory(p.customStatus) === "soon"), [filteredPrograms]);
  const upcomingList = useMemo(() => filteredPrograms.filter(p => getCategory(p.customStatus) === "upcoming"), [filteredPrograms]);

  // Counts (unfiltered by tab)
  const totalActive   = programs.filter(p => getCategory(p.customStatus) === "active").length;
  const totalSoon     = programs.filter(p => getCategory(p.customStatus) === "soon").length;
  const totalUpcoming = programs.filter(p => getCategory(p.customStatus) === "upcoming").length;

  if (programs.length === 0) {
    return (
      <div className="text-center p-12 bg-white dark:bg-slate-900 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <Sparkles className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Belum Ada Program Kerja</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Program kerja untuk periode aktif ini sedang dipersiapkan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Toolbar & Filter Tabs ── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-4">
        {/* Search & Division Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari program kerja atau divisi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
            />
          </div>

          {divisions.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="w-full sm:w-52 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="ALL">Semua Bidang / Divisi</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-slate-800/80">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-green-600 text-white shadow-sm shadow-green-600/30"
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            Semua ({programs.length})
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "active"
                ? "bg-green-600 text-white shadow-sm shadow-green-600/30"
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Sedang Berjalan ({totalActive})
          </button>

          <button
            onClick={() => setActiveTab("soon")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "soon"
                ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30"
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Segera Berjalan ({totalSoon})
          </button>

          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "upcoming"
                ? "bg-slate-700 text-white shadow-sm"
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Mendatang ({totalUpcoming})
          </button>
        </div>
      </div>

      {/* ── Content Sections ── */}
      {filteredPrograms.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Tidak ada program kerja yang cocok dengan filter yang dipilih.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* ── 1. Sedang Berjalan ── */}
          {activeList.length > 0 && (
            <div>
              <SectionHeader
                icon={
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                }
                title="Sedang Berjalan"
                desc="Program yang aktif berjalan pada periode ini"
                badgeColor="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                count={activeList.length}
              />
              <div className="space-y-0">
                {activeList.map((p, idx) => (
                  <TimelineItem
                    key={p.id}
                    program={p}
                    dotColor="bg-green-500"
                    lineColor="bg-green-200 dark:bg-green-900/60"
                    isLast={idx === activeList.length - 1}
                    onSelect={setSelectedProgram}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── 2. Segera Berjalan ── */}
          {soonList.length > 0 && (
            <div>
              <SectionHeader
                icon={
                  <span className="w-4 h-4 rounded-full bg-amber-500 block" />
                }
                title="Segera Berjalan"
                desc="Program yang akan dimulai dalam waktu dekat"
                badgeColor="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                count={soonList.length}
              />
              <div className="space-y-0">
                {soonList.map((p, idx) => (
                  <TimelineItem
                    key={p.id}
                    program={p}
                    dotColor="bg-amber-500"
                    lineColor="bg-amber-200 dark:bg-amber-900/60"
                    isLast={idx === soonList.length - 1}
                    onSelect={setSelectedProgram}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── 3. Mendatang ── */}
          {upcomingList.length > 0 && (
            <div>
              <SectionHeader
                icon={
                  <span className="w-4 h-4 rounded-full bg-slate-400 block" />
                }
                title="Mendatang"
                desc="Program yang dijadwalkan pada waktu yang akan datang"
                badgeColor="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                count={upcomingList.length}
              />
              <div className="space-y-0">
                {upcomingList.map((p, idx) => (
                  <TimelineItem
                    key={p.id}
                    program={p}
                    dotColor="bg-slate-400"
                    lineColor="bg-slate-200 dark:bg-slate-800"
                    isLast={idx === upcomingList.length - 1}
                    onSelect={setSelectedProgram}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Portal Modal */}
      {mounted && selectedProgram && (
        <ProgramModal program={selectedProgram} onClose={() => setSelectedProgram(null)} />
      )}
    </div>
  );
}
