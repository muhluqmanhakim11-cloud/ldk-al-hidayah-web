"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type MemberProps = {
  member: {
    id: number;
    name: string;
    photoUrl?: string | null;
    position?: { name: string } | null;
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
  const [show, setShow] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <div
        style={{
          background: accentBg,
          border: `1px solid ${accentColor}22`,
          borderRadius: "0.875rem",
          padding: "0.9rem 0.75rem",
          textAlign: "center",
          cursor: member.photoUrl ? "pointer" : "default",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${accentColor}22`;
          if (member.photoUrl) setShow(true);
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
          setShow(false);
        }}
        onTouchEnd={(e) => {
          if (!member.photoUrl) return;
          e.preventDefault();
          setIsMobileOpen((p) => !p);
        }}
      >
        {/* Avatar circle */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}66)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 0.6rem",
            fontSize: "1.3rem",
            fontWeight: 800,
            color: accentColor,
            overflow: "hidden",
            border: `2px solid ${accentColor}33`,
          }}
        >
          {member.photoUrl ? (
            <img src={member.photoUrl} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            member.name.charAt(0).toUpperCase()
          )}
        </div>

        <h3
          className="text-gray-900 dark:text-gray-100"
          style={{
            fontSize: "0.85rem",
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: "0.25rem",
            textDecoration: member.photoUrl ? "underline dotted" : "none",
            textDecorationColor: accentColor + "88",
            textUnderlineOffset: "3px",
          }}
        >
          {member.name}
        </h3>
        <p style={{ fontSize: "0.72rem", fontWeight: 600, color: accentColor, letterSpacing: "0.01em" }}>
          {member.position?.name ?? "—"}
        </p>

        {/* Desktop hover photo popup */}
        {show && member.photoUrl && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 12px)",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 99,
              pointerEvents: "none",
              animation: "popUp 0.2s cubic-bezier(0.16,1,0.3,1) both",
            }}
            className="hidden md:block"
          >
            <div style={{ background: "white", borderRadius: "1.25rem", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", border: "1px solid #f1f5f9", overflow: "hidden", width: "220px" }}>
              <div style={{ position: "relative", width: "220px", height: "280px" }}>
                <Image src={member.photoUrl} alt={member.name} fill style={{ objectFit: "cover" }} unoptimized />
              </div>
              <div style={{ padding: "0.6rem 0.75rem", textAlign: "center", background: "linear-gradient(to bottom, #f9fafb, white)" }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b" }}>{member.name}</p>
                <p style={{ fontSize: "0.68rem", color: accentColor }}>{member.position?.name}</p>
              </div>
            </div>
            <div style={{ width: "12px", height: "12px", background: "white", border: "1px solid #f1f5f9", transform: "rotate(45deg)", position: "absolute", bottom: "-6px", left: "50%", marginLeft: "-6px", borderTop: "none", borderLeft: "none" }} />
          </div>
        )}
      </div>

      {/* Mobile modal */}
      {mounted && isMobileOpen && member.photoUrl &&
        createPortal(
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease both" }}
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden"
          >
            <div style={{ background: "white", borderRadius: "1.5rem", overflow: "hidden", width: "280px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)", animation: "popUp 0.25s cubic-bezier(0.16,1,0.3,1) both" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ position: "relative", width: "280px", height: "350px" }}>
                <Image src={member.photoUrl} alt={member.name} fill style={{ objectFit: "cover" }} unoptimized />
              </div>
              <div style={{ padding: "1rem", textAlign: "center" }}>
                <p style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>{member.name}</p>
                <p style={{ fontSize: "0.78rem", color: accentColor, marginTop: "2px" }}>{member.position?.name}</p>
                <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "6px" }}>Ketuk di luar untuk menutup</p>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      <style>{`
        @keyframes popUp {
          from { opacity: 0; transform: translateX(-50%) scale(0.9) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
