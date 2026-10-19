import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  badge?: string;
  /** Optional extra children rendered below subtitle */
  children?: React.ReactNode;
};

/**
 * Shared modern hero section for public pages.
 * Keeps the green color palette while adding premium visual details.
 */
export default function PageHero({ title, subtitle, badge, children }: Props) {
  return (
    <div className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28">
      {/* ── Decorative blobs ── */}
      <div
        className="hero-blob w-72 h-72 bg-green-500/20 top-[-60px] left-[-80px]"
        aria-hidden="true"
      />
      <div
        className="hero-blob w-96 h-96 bg-emerald-400/10 bottom-[-80px] right-[-60px]"
        aria-hidden="true"
      />
      <div
        className="hero-blob w-48 h-48 bg-lime-400/10 top-[40%] left-[30%]"
        aria-hidden="true"
      />

      {/* ── Subtle dot grid overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* ── Content ── */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
        {badge && (
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-green-100 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {badge}
          </span>
        )}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-md">
          {title}
        </h1>
        {subtitle && (
          <p className="text-green-100 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            {subtitle}
          </p>
        )}
        {children}
      </div>

      {/* ── Bottom wave divider ── */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0]" aria-hidden="true">
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-[40px] md:h-[60px] fill-gray-50 dark:fill-slate-950"
        >
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </div>
  );
}
