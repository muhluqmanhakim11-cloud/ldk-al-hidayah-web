"use client";

import { useState, useRef, useEffect } from "react";

type Section = {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  orderIndex: number;
};

// Icon mapping per judul section
function getSectionIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("visi"))
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M2 12C2 12 5 5 12 5s10 7 10 7-3 7-10 7S2 12 2 12z" />
      </svg>
    );
  if (t.includes("misi"))
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  if (t.includes("sejarah") || t.includes("latar"))
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  if (t.includes("nilai") || t.includes("value"))
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    );
  if (t.includes("tujuan") || t.includes("goal"))
    return (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function AccordionItem({
  section,
  index,
  isOpen,
  onToggle,
}: {
  section: Section;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(isOpen ? bodyRef.current.scrollHeight : 0);
    }
  }, [isOpen, section.content]);

  return (
    <div
      style={{
        animation: `accordionEntrance 0.55s ${index * 0.08}s cubic-bezier(0.16,1,0.3,1) both`,
        borderRadius: "1.25rem",
        overflow: "hidden",
        border: isOpen
          ? "1.5px solid rgba(22,163,74,0.35)"
          : "1.5px solid #f1f5f9",
        background: "white",
        boxShadow: isOpen
          ? "0 8px 40px rgba(22,163,74,0.12), 0 2px 10px rgba(0,0,0,0.06)"
          : "0 2px 8px rgba(0,0,0,0.05)",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      }}
      className="dark:bg-slate-900 dark:border-slate-800"
    >
      {/* ── Header / trigger ── */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1.25rem 1.5rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Number + Icon badge */}
        <div
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "14px",
            background: isOpen
              ? "linear-gradient(135deg, #16a34a, #34d399)"
              : "linear-gradient(135deg, #f0fdf4, #dcfce7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.35s ease",
            color: isOpen ? "white" : "#16a34a",
          }}
        >
          {getSectionIcon(section.title)}
        </div>

        {/* Title + subtitle hint */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="text-gray-900 dark:text-gray-100"
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              lineHeight: 1.3,
              color: isOpen ? "#15803d" : undefined,
              transition: "color 0.25s",
            }}
          >
            {section.title}
          </div>
          {!isOpen && (
            <div
              className="text-gray-400 dark:text-gray-500"
              style={{ fontSize: "0.78rem", marginTop: "2px" }}
            >
              Klik untuk membaca selengkapnya
            </div>
          )}
        </div>

        {/* Chevron */}
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: isOpen ? "rgba(22,163,74,0.1)" : "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.25s, transform 0.4s cubic-bezier(0.16,1,0.3,1)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke={isOpen ? "#16a34a" : "#94a3b8"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* ── Collapsible body ── */}
      <div
        style={{
          height: `${height}px`,
          overflow: "hidden",
          transition: "height 0.45s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div ref={bodyRef}>
          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "linear-gradient(90deg, rgba(22,163,74,0.2) 0%, rgba(52,211,153,0.1) 50%, transparent 100%)",
              margin: "0 1.5rem",
            }}
          />

          {/* Image (if any) */}
          {section.imageUrl && (
            <div style={{ padding: "1.25rem 1.5rem 0", overflow: "hidden", borderRadius: "0.5rem" }}>
              <img
                src={section.imageUrl}
                alt={section.title}
                style={{
                  width: "100%",
                  maxHeight: "260px",
                  objectFit: "cover",
                  borderRadius: "0.75rem",
                }}
              />
            </div>
          )}

          {/* Content */}
          <div
            style={{ padding: section.imageUrl ? "1.25rem 1.5rem 1.75rem" : "1.5rem 1.5rem 1.75rem" }}
          >
            <div
              className="text-gray-700 dark:text-gray-300"
              style={{
                fontSize: "0.975rem",
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
              }}
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilAccordion({ sections }: { sections: Section[] }) {
  // First section open by default
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2.5rem",
          animation: "accordionEntrance 0.5s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {[
          { label: "Total Seksi", value: sections.length, icon: "📄" },
          { label: "Informasi Tersedia", value: sections.filter((s) => s.content).length, icon: "✅" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-900 dark:text-gray-100"
            style={{
              borderRadius: "1rem",
              border: "1px solid",
              padding: "0.75rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
              <div className="text-gray-400 dark:text-gray-500" style={{ fontSize: "0.7rem", marginTop: "1px" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Accordion list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        {sections.map((section, i) => (
          <AccordionItem
            key={section.id}
            section={section}
            index={i}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>

      <style>{`
        @keyframes accordionEntrance {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
