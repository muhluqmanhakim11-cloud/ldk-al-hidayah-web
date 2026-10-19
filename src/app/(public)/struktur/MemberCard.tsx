"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type MemberProps = {
  member: {
    id: number;
    name: string;
    photoUrl?: string | null;
    position?: { name: string } | null;
    fromRecruitment?: boolean;
  };
  className?: string;
  nameClassName?: string;
  positionClassName?: string;
  accentColor?: string;
  accentBg?: string;
};

export default function MemberCard({
  member,
  accentColor = "#16a34a",
  accentBg = "rgba(22,163,74,0.07)",
}: MemberProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Close on Escape key
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setModalOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen]);

  return (
    <>
      {/* ── Card ── */}
      <div
        onClick={() => { if (member.photoUrl) setModalOpen(true); }}
        style={{
          background: accentBg,
          border: `1px solid ${accentColor}22`,
          borderRadius: "0.875rem",
          padding: "0.9rem 0.75rem 0.75rem",
          textAlign: "center",
          cursor: member.photoUrl ? "pointer" : "default",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          position: "relative",
          userSelect: "none",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${accentColor}22`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        {/* Badge Anggota Baru */}
        {member.fromRecruitment && (
          <div
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              background: "linear-gradient(135deg, #f59e0b, #f97316)",
              color: "white",
              fontSize: "0.5rem",
              fontWeight: 800,
              padding: "2px 7px",
              borderRadius: "9999px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
              lineHeight: 1.6,
              zIndex: 2,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            ✦ Baru
          </div>
        )}

        {/* Avatar */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}66)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 0.6rem",
            fontSize: "1.4rem",
            fontWeight: 800,
            color: accentColor,
            overflow: "hidden",
            border: `2.5px solid ${accentColor}44`,
            position: "relative",
          }}
        >
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
              }}
            />
          ) : (
            member.name.charAt(0).toUpperCase()
          )}
          {/* Zoom hint */}
          {member.photoUrl && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s",
                borderRadius: "50%",
              }}
              className="zoom-hint"
            >
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          )}
        </div>

        <h3
          className="text-gray-900 dark:text-gray-100"
          style={{
            fontSize: "0.82rem",
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: "0.25rem",
          }}
        >
          {member.name}
        </h3>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, color: accentColor, letterSpacing: "0.01em" }}>
          {member.position?.name ?? "—"}
        </p>
      </div>

      {/* ── Full Photo Modal (unified for all devices) ── */}
      {mounted && modalOpen && member.photoUrl &&
        createPortal(
          <div
            onClick={() => setModalOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              padding: "1rem",
              boxSizing: "border-box",
              animation: "fadeOverlay 0.2s ease both",
            }}
          >
            {/* Modal card — stop propagation */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#0f172a",
                borderRadius: "1.5rem",
                overflow: "hidden",
                width: "min(340px, calc(100vw - 2rem))",
                maxHeight: "calc(100vh - 3rem)",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
                animation: "popModal 0.28s cubic-bezier(0.16,1,0.3,1) both",
                position: "relative",
              }}
              className="dark:bg-slate-800"
            >
              {/* Close button */}
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  zIndex: 10,
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.5)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Photo — contain agar tidak terpotong */}
              <div
                style={{
                  width: "100%",
                  background: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "calc(100vh - 12rem)",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>

              {/* Info */}
              <div
                style={{ padding: "0.875rem 1.25rem 1.125rem", textAlign: "center", background: "#0f172a" }}
              >
                <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "4px", color: "#f1f5f9" }}>
                  {member.name}
                </p>
                <p style={{ fontSize: "0.8rem", color: "#4ade80", fontWeight: 600 }}>
                  {member.position?.name}
                </p>
                {member.fromRecruitment && (
                  <span style={{
                    display: "inline-block",
                    marginTop: "6px",
                    background: "linear-gradient(135deg, #f59e0b, #f97316)",
                    color: "white",
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    padding: "2px 10px",
                    borderRadius: "9999px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    ✦ Anggota Baru via Rekrutmen
                  </span>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      }

      <style>{`
        @keyframes fadeOverlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes popModal {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        [data-card]:hover .zoom-hint {
          opacity: 1 !important;
        }
      `}</style>
    </>
  );
}
