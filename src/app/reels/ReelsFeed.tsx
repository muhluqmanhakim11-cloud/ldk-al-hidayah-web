"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Heart, Volume2, VolumeX, Share2, Play, Pause, 
  ChevronUp, ChevronDown, ArrowLeft, Sparkles, Check, Music2, ExternalLink
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getVideoSourceType, formatEmbedUrl, getVideoPosterUrl } from "@/lib/video-optimization";

interface ReelItem {
  id: number;
  title: string;
  description: string | null;
  speaker: string | null;
  isLdkDai: boolean;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  likesCount: number;
  viewsCount: number;
  createdAt: Date;
}

interface Props {
  initialReels: ReelItem[];
}

export default function ReelsFeed({ initialReels }: Props) {
  const [reels, setReels] = useState<ReelItem[]>(initialReels);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedReels, setLikedReels] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showHeartBurst, setShowHeartBurst] = useState<{ id: number; key: number } | null>(null);
  const [expandedDesc, setExpandedDesc] = useState<Record<number, boolean>>({});
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const viewLoggedRefs = useRef<Record<number, boolean>>({});
  const lastTapRef = useRef<number>(0);

  // Lock body scroll while in Reels view
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Keyboard navigation (Desktop UX)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (reels.length === 0) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToIndex(Math.min(activeIndex + 1, reels.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToIndex(Math.max(activeIndex - 1, 0));
      } else if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlayCurrent();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, reels.length]);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const targetElement = container.children[index] as HTMLElement;
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // IntersectionObserver to detect which reel is in full view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.65, // reel must be at least 65% visible
      }
    );

    const items = container.querySelectorAll(".reel-card");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [reels]);

  // Video playback sync with activeIndex (for direct video files)
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === activeIndex) {
        video.muted = isMuted;
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Browser blocked autoplay with sound, fall back to muted
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
      } else {
        video.pause();
        video.currentTime = 0; // Rewind inactive video
      }
    });
  }, [activeIndex, isMuted, reels]);

  // Log view after 3 seconds of watching activeIndex (supports both direct & embed reels)
  useEffect(() => {
    const currentReel = reels[activeIndex];
    if (currentReel && !viewLoggedRefs.current[currentReel.id]) {
      viewLoggedRefs.current[currentReel.id] = true;
      const timer = setTimeout(() => {
        fetch(`/api/public/reels/${currentReel.id}/view`, { method: "POST" }).catch(() => {});
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, reels]);

  // Update mute across all video elements
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) video.muted = isMuted;
    });
  }, [isMuted]);

  const togglePlayCurrent = () => {
    const currentVideo = videoRefs.current[activeIndex];
    if (!currentVideo) return;

    if (currentVideo.paused) {
      currentVideo.play();
      setIsPlaying(true);
    } else {
      currentVideo.pause();
      setIsPlaying(false);
    }
  };

  // Double tap handler (heart effect + like)
  const handleVideoTap = (reelId: number) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap triggered
      triggerHeartBurst(reelId);
      if (!likedReels[reelId]) {
        handleLike(reelId);
      }
    } else {
      // Single tap -> toggle play/pause
      togglePlayCurrent();
    }
    lastTapRef.current = now;
  };

  const triggerHeartBurst = (reelId: number) => {
    setShowHeartBurst({ id: reelId, key: Date.now() });
    setTimeout(() => {
      setShowHeartBurst((prev) => (prev?.id === reelId ? null : prev));
    }, 900);
  };

  const handleLike = async (reelId: number) => {
    const isCurrentlyLiked = likedReels[reelId];

    // Optimistic UI update
    setLikedReels((prev) => ({ ...prev, [reelId]: !isCurrentlyLiked }));
    setReels((prev) =>
      prev.map((r) =>
        r.id === reelId
          ? { ...r, likesCount: isCurrentlyLiked ? r.likesCount - 1 : r.likesCount + 1 }
          : r
      )
    );

    if (!isCurrentlyLiked) {
      triggerHeartBurst(reelId);
      try {
        await fetch(`/api/public/reels/${reelId}/like`, { method: "POST" });
      } catch (err) {
        // Rollback if failed
      }
    }
  };

  const handleShare = async (reel: ReelItem) => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: `${reel.title} - Reels Dakwah LDK Al-Hidayah`,
      text: `Saksikan reels dakwah "${reel.title}" oleh ${reel.speaker || "LDK Al-Hidayah STMIK IKMI Cirebon"}`,
      url: shareUrl,
    };

    if (navigator.share && typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    // Fallback: Copy link
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(reel.id);
      toast.success("Tautan reels berhasil disalin!");
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      toast.error("Gagal menyalin tautan");
    }
  };

  const handleTimeUpdate = (index: number, e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration) {
      const pct = (video.currentTime / video.duration) * 100;
      setProgressMap((prev) => ({ ...prev, [index]: pct }));
    }
  };

  if (reels.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <Toaster position="top-center" />
        <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 text-green-400 rounded-3xl flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center">Belum Ada Reels Dakwah</h2>
        <p className="text-gray-400 text-sm text-center max-w-sm mb-6">
          Video tausiyah dan reels dakwah sedang dipersiapkan oleh tim Kominfo. Silakan kembali lagi nanti!
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const currentReel = reels[activeIndex];

  return (
    <div className="fixed inset-0 bg-slate-950 text-white overflow-hidden select-none flex items-center justify-center">
      <Toaster position="top-center" />

      {/* ── AMBIENT BLURRED BACKDROP (Desktop Luxury) ── */}
      {currentReel && (
        <div
          className="absolute inset-0 hidden md:block opacity-30 filter blur-3xl scale-125 transition-all duration-700 pointer-events-none"
          style={{
            backgroundImage: `url(${currentReel.thumbnailUrl || ""})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      )}

      {/* ── TOP HEADER (Mobile & Desktop) ── */}
      <header className="absolute top-0 inset-x-0 z-40 px-4 py-3.5 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/90 hover:text-white px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Beranda</span>
        </Link>

        {/* Center Title Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase text-green-400">
            Reels Dakwah
          </span>
        </div>

        {/* Sound Toggle (Top corner) */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 hover:text-white hover:bg-black/60 transition-colors"
          title={isMuted ? "Aktifkan Suara" : "Matikan Suara"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
        </button>
      </header>

      {/* ── MAIN VERTICAL SNAP SCROLL CONTAINER ── */}
      <main
        ref={containerRef}
        className="relative w-full h-[100dvh] md:max-w-[420px] md:h-[calc(100dvh-2.5rem)] md:rounded-3xl md:overflow-hidden md:shadow-2xl md:border md:border-white/15 overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar z-20 bg-black"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {reels.map((reel, index) => {
          const isLiked = likedReels[reel.id];
          const isExpanded = expandedDesc[reel.id];
          const progress = progressMap[index] || 0;
          const isCurrentActive = index === activeIndex;
          const sourceType = getVideoSourceType(reel.videoUrl);
          const isEmbed = sourceType !== "direct";
          const isNearActive = Math.abs(index - activeIndex) <= 1;

          return (
            <section
              key={reel.id}
              data-index={index}
              className="reel-card relative w-full h-[100dvh] md:h-[calc(100dvh-2.5rem)] snap-start snap-always flex items-center justify-center bg-black overflow-hidden"
            >
              {/* Embed Player (TikTok / YouTube Shorts) or Direct Video */}
              {isEmbed ? (
                isNearActive ? (
                  <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black">
                    <iframe
                      src={formatEmbedUrl(reel.videoUrl, {
                        autoplay: isCurrentActive,
                        muted: isMuted,
                      })}
                      title={reel.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0 object-cover"
                    />
                  </div>
                ) : (
                  <img
                    src={reel.thumbnailUrl || getVideoPosterUrl(reel.videoUrl) || "/hero-pattern.png"}
                    alt={reel.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )
              ) : (
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={reel.videoUrl}
                  poster={reel.thumbnailUrl || undefined}
                  loop
                  playsInline
                  muted={isMuted}
                  preload={isNearActive ? "auto" : "none"}
                  onTimeUpdate={(e) => handleTimeUpdate(index, e)}
                  onClick={() => handleVideoTap(reel.id)}
                  className="w-full h-full object-cover cursor-pointer"
                />
              )}

              {/* Play / Pause Animated Icon Overlay (Direct Video Only) */}
              {!isEmbed && !isPlaying && isCurrentActive && (
                <div 
                  onClick={togglePlayCurrent}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer pointer-events-auto z-20"
                >
                  <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-110 transition-transform">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                </div>
              )}

              {/* Double Tap Floating Heart Burst (TikTok/IG Effect) */}
              {showHeartBurst?.id === reel.id && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30 animate-in zoom-in-50 fade-in duration-300">
                  <Heart className="w-28 h-28 text-rose-500 fill-rose-500 drop-shadow-[0_10px_25px_rgba(244,63,94,0.6)] animate-bounce" />
                </div>
              )}

              {/* Gradient Vignette Overlays for Maximum Readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none z-10" />

              {/* Mute Tap-to-Unmute Banner (if muted on active) */}
              {isMuted && isCurrentActive && (
                <button
                  onClick={() => setIsMuted(false)}
                  className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-xs font-semibold text-white flex items-center gap-2 animate-bounce shadow-lg"
                >
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  <span>Ketuk untuk suara</span>
                </button>
              )}

              {/* ── RIGHT ACTION BAR (TikTok / Reels Style) ── */}
              <aside className="absolute right-3.5 bottom-24 sm:bottom-20 z-30 flex flex-col items-center gap-4 sm:gap-5 pointer-events-auto">
                {/* LDK Avatar */}
                <div className="relative group">
                  <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-green-600 to-emerald-400 shadow-lg">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      <img
                        src="/logo-ldk.png"
                        alt="Logo LDK Al-Hidayah"
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-green-500 border border-black flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </div>
                </div>

                {/* Like Button */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleLike(reel.id)}
                    aria-label="Like Reels"
                    className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-75 transition-all text-white hover:bg-black/70"
                  >
                    <Heart
                      className={`w-6 h-6 transition-all ${
                        isLiked
                          ? "fill-rose-500 text-rose-500 scale-110"
                          : "text-white"
                      }`}
                    />
                  </button>
                  <span className="text-[11px] font-bold text-white drop-shadow mt-1">
                    {(reel.likesCount || 0).toLocaleString()}
                  </span>
                </div>

                {/* Sound Toggle Button */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    aria-label="Mute / Unmute"
                    className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-75 transition-all text-white hover:bg-black/70"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-rose-400" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-green-400" />
                    )}
                  </button>
                  <span className="text-[11px] font-medium text-white/80 drop-shadow mt-1">
                    {isMuted ? "Bisu" : "Suara"}
                  </span>
                </div>

                {/* Share Button */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleShare(reel)}
                    aria-label="Share Reels"
                    className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-75 transition-all text-white hover:bg-black/70"
                  >
                    {copiedId === reel.id ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Share2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <span className="text-[11px] font-medium text-white/80 drop-shadow mt-1">
                    {copiedId === reel.id ? "Disalin" : "Bagi"}
                  </span>
                </div>
              </aside>

              {/* ── BOTTOM INFO OVERLAY (Speaker, Title, Caption, Music) ── */}
              <div className="absolute left-4 right-20 bottom-8 sm:bottom-6 z-20 pointer-events-auto space-y-2 pb-[env(safe-area-inset-bottom,0px)]">
                {/* Speaker Badge */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white drop-shadow-md tracking-tight">
                    @{reel.speaker ? reel.speaker.replace(/^@/, "") : "ldkalhidayah"}
                  </span>
                  {reel.isLdkDai && (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/30 border border-green-500/40 text-[10px] font-bold text-green-300">
                      Da&apos;i LDK
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-base text-white drop-shadow-md leading-tight line-clamp-2">
                  {reel.title}
                </h3>

                {/* Caption / Description with Expand */}
                {reel.description && (
                  <div>
                    <p
                      className={`text-xs text-white/90 drop-shadow transition-all ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}
                    >
                      {reel.description}
                    </p>
                    {reel.description.length > 80 && (
                      <button
                        onClick={() =>
                          setExpandedDesc((prev) => ({
                            ...prev,
                            [reel.id]: !isExpanded,
                          }))
                        }
                        className="text-[11px] text-green-400 font-semibold hover:underline mt-0.5"
                      >
                        {isExpanded ? "Sembunyikan" : "Lihat selengkapnya"}
                      </button>
                    )}
                  </div>
                )}

                {/* Audio Ticker & Platform Link */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <div className="flex items-center gap-2 text-[11px] text-white/70 min-w-0">
                    <Music2 className="w-3 h-3 text-green-400 flex-shrink-0 animate-spin" />
                    <span className="truncate">Suara Asli • LDK Al-Hidayah IKMI Cirebon</span>
                  </div>

                  {isEmbed && (
                    <a
                      href={reel.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/90 hover:text-white bg-black/60 hover:bg-black/80 px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-md transition-colors flex-shrink-0"
                    >
                      <ExternalLink className="w-3 h-3 text-green-400" />
                      <span>{sourceType === "tiktok" ? "TikTok" : "YouTube"}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* ── THIN PLAYBACK PROGRESS BAR AT BOTTOM (Direct Video) ── */}
              {!isEmbed && (
                <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-30">
                  <div
                    className="h-full bg-green-500 transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </section>
          );
        })}
      </main>

      {/* ── DESKTOP FLOATING NAVIGATION CONTROLS (Right Side) ── */}
      <div className="hidden lg:flex fixed right-8 bottom-1/2 translate-y-1/2 flex-col items-center gap-3 z-40 pointer-events-auto">
        <button
          onClick={() => scrollToIndex(Math.max(activeIndex - 1, 0))}
          disabled={activeIndex === 0}
          className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl hover:scale-105"
          title="Video Sebelumnya (Arrow Up ↑)"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        {/* Counter Pill */}
        <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-gray-300">
          {activeIndex + 1} / {reels.length}
        </div>

        <button
          onClick={() => scrollToIndex(Math.min(activeIndex + 1, reels.length - 1))}
          disabled={activeIndex === reels.length - 1}
          className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl hover:scale-105"
          title="Video Selanjutnya (Arrow Down ↓)"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Keyboard Helper Card */}
        <div className="mt-4 p-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-[11px] text-gray-400 text-center max-w-[130px] space-y-1">
          <p className="font-semibold text-gray-300">Shortcut:</p>
          <p>↑ / ↓ : Ganti Video</p>
          <p>Spasi : Pause / Play</p>
          <p>M : Mute / Suara</p>
        </div>
      </div>
    </div>
  );
}
