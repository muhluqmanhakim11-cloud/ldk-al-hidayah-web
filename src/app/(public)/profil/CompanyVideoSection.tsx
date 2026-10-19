"use client";

type Props = {
  videoUrl?: string | null;
};

export default function CompanyVideoSection({ videoUrl }: Props) {
  if (!videoUrl) return null;

  return (
    <section
      style={{
        marginBottom: "2.5rem",
        animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      {/* Section label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #16a34a, #34d399)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </div>
        <div>
          <h2
            className="text-gray-900 dark:text-gray-100"
            style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.2 }}
          >
            Video Company Profile
          </h2>
          <p
            className="text-gray-400 dark:text-gray-500"
            style={{ fontSize: "0.75rem", marginTop: "1px" }}
          >
            Kenali LDK Al-Hidayah lebih dekat
          </p>
        </div>
      </div>

      {/* Video container — responsive 16:9 */}
      <div
        className="bg-black"
        style={{
          borderRadius: "1.25rem",
          overflow: "hidden",
          position: "relative",
          width: "100%",
          paddingBottom: "56.25%", /* 16:9 aspect ratio */
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <video
          src={videoUrl}
          controls
          playsInline
          preload="metadata"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: "1.25rem",
          }}
        >
          Browser Anda tidak mendukung pemutar video.
        </video>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
