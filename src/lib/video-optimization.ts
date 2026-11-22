/**
 * Video Optimization Helper
 * Mengoptimalkan URL video untuk Reels Dakwah (Cloudinary & Direct Stream)
 * Memastikan kompresi ukuran file minimal dengan kualitas HD tetap terjaga
 */

export function getOptimizedVideoUrl(url: string | null | undefined): string {
  if (!url) return "";

  // Jika URL Cloudinary Video
  if (url.includes("res.cloudinary.com") && url.includes("/video/upload/")) {
    // Cek apakah sudah ada parameter transformasi
    if (url.includes("/video/upload/q_auto") || url.includes("/video/upload/c_limit")) {
      return url;
    }
    // Sisipkan transformasi hemat kuota + kualitas jernih (720p HD, q_auto:good, vc_auto)
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

  // Jika Cloudinary, ekstrak snapshot detik ke-0 sebagai poster cover
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

