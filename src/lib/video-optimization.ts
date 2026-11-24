/**
 * Video Optimization & Embed Helper
 * Mendukung Cloudinary, TikTok Embed Player, YouTube Shorts, dan Direct MP4
 * Menghemat 100% storage Cloudinary saat menggunakan link TikTok / Shorts
 */

export type VideoSourceType = "direct" | "tiktok" | "youtube" | "instagram";

export function getVideoSourceType(url: string | null | undefined): VideoSourceType {
  if (!url) return "direct";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("instagram.com")) return "instagram";
  return "direct";
}

export function extractTikTokId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:video|photo|v|player\/v1|embed\/v2)\/(\d+)/i) || url.match(/[?&]item_id=(\d+)/i);
  return match ? match[1] : null;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:shorts\/|youtu\.be\/|v\/|watch\?v=|embed\/)([a-zA-Z0-9_-]{11})/i);
  return match ? match[1] : null;
}

export function extractInstagramId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:reel|p)\/([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
}

/**
 * Format URL video untuk iframe player (TikTok, YouTube, IG) atau Cloudinary
 */
export function formatEmbedUrl(
  url: string | null | undefined, 
  options?: { autoplay?: boolean; muted?: boolean; loop?: boolean }
): string {
  if (!url) return "";
  const type = getVideoSourceType(url);
  const autoplay = options?.autoplay ?? true;
  const muted = options?.muted ?? false;
  const loop = options?.loop ?? true;

  if (type === "tiktok") {
    const id = extractTikTokId(url);
    if (id) {
      return `https://www.tiktok.com/player/v1/${id}?autoplay=${autoplay ? 1 : 0}&muted=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&controls=0&description=0&music_info=0&rel=0&progress_bar=0&volume_control=0&play_button=0`;
    }
    // Jika sudah embed player URL
    if (url.includes("/player/v1/")) return url;
    return url;
  }

  if (type === "youtube") {
    const id = extractYouTubeId(url);
    if (id) {
      return `https://www.youtube.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&playlist=${id}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1`;
    }
    return url;
  }

  if (type === "instagram") {
    const id = extractInstagramId(url);
    if (id) {
      return `https://www.instagram.com/reel/${id}/embed`;
    }
    return url;
  }

  return getOptimizedVideoUrl(url);
}

export function getOptimizedVideoUrl(url: string | null | undefined): string {
  if (!url) return "";

  // Jika URL Cloudinary Video
  if (url.includes("res.cloudinary.com") && url.includes("/video/upload/")) {
    if (url.includes("/video/upload/q_auto") || url.includes("/video/upload/c_limit")) {
      return url;
    }
    return url.replace(
      "/video/upload/",
      "/video/upload/f_auto,q_auto:good,vc_auto,w_720,c_limit/"
    );
  }

  return url;
}

export function getVideoPosterUrl(videoUrl: string | null | undefined, customPoster?: string | null): string {
  if (customPoster) return customPoster;
  if (!videoUrl) return "";

  // Jika YouTube
  if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
    const ytId = extractYouTubeId(videoUrl);
    if (ytId) return `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
  }

  // Jika Cloudinary
  if (videoUrl.includes("res.cloudinary.com") && videoUrl.includes("/video/upload/")) {
    const posterUrl = videoUrl
      .replace("/video/upload/", "/video/upload/so_0,w_720,c_limit,q_auto,f_jpg/")
      .replace(/\.(mp4|webm|mov|m4v)(\?.*)?$/i, ".jpg");
    return posterUrl;
  }

  return "";
}

/**
 * Format durasi detik ke format MM:SS
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
