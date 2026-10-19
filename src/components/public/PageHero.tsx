import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
};

export default function PageHero({ title, subtitle, badge, children }: Props) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 70%, #16a34a 100%)",
        position: "relative",
        overflow: "hidden",
        paddingTop: "9rem",
        paddingBottom: "5rem",
        color: "white",
      }}
    >
      {/* Animated blobs */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          left: "-100px",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(74,222,128,0.18) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          animation: "blobFloat1 8s ease-in-out infinite",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "absolute",
          bottom: "-60px",
          right: "-80px",
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(50px)",
          animation: "blobFloat2 10s ease-in-out infinite",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          width: "250px",
          height: "250px",
          background: "radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          animation: "blobFloat3 6s ease-in-out infinite",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      {/* Dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      {/* Diagonal lines overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(255,255,255,0.02) 60px, rgba(255,255,255,0.02) 61px)",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "0 1.5rem",
          textAlign: "center",
          animation: "heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {badge && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "9999px",
              padding: "6px 18px",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(187,247,208,1)",
              marginBottom: "1.25rem",
              animation: "heroFadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#4ade80",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            {badge}
          </span>
        )}

        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: "1rem",
            textShadow: "0 2px 20px rgba(0,0,0,0.25)",
            animation: "heroFadeUp 0.7s 0.15s cubic-bezier(0.16,1,0.3,1) both",
            opacity: 0,
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              color: "rgba(187,247,208,0.9)",
              maxWidth: "42rem",
              margin: "0 auto",
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              lineHeight: 1.65,
              animation: "heroFadeUp 0.7s 0.25s cubic-bezier(0.16,1,0.3,1) both",
              opacity: 0,
            }}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>

      {/* Wave divider */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          lineHeight: 0,
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 70"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "50px", display: "block" }}
        >
          <defs>
            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f9fafb" />
              <stop offset="50%" stopColor="#f3f4f6" />
              <stop offset="100%" stopColor="#f9fafb" />
            </linearGradient>
          </defs>
          <path
            d="M0,35 C240,65 480,10 720,38 C960,66 1200,12 1440,35 L1440,70 L0,70 Z"
            fill="url(#waveGrad)"
            className="dark:fill-slate-950"
          />
        </svg>
      </div>

      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(30px, -20px) scale(1.05); }
          66%  { transform: translate(-15px, 15px) scale(0.97); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%  { transform: translate(-25px, -15px) scale(1.06); }
          70%  { transform: translate(20px, 10px) scale(0.95); }
        }
        @keyframes blobFloat3 {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50%  { transform: translate(-50%, -18px) scale(1.08); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
