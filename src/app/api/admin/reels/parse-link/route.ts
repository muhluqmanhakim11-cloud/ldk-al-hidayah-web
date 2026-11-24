import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { 
  getVideoSourceType, 
  extractTikTokId, 
  extractYouTubeId, 
  extractInstagramId, 
  formatEmbedUrl 
} from "@/lib/video-optimization";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let url = (body?.url || "").trim();

    if (!url) {
      return NextResponse.json({ error: "URL video tidak boleh kosong" }, { status: 400 });
    }

    // Resolusi short link jika vt.tiktok.com atau vm.tiktok.com
    if (url.includes("vt.tiktok.com") || url.includes("vm.tiktok.com")) {
      try {
        const resolveRes = await fetch(url, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
          },
          redirect: "manual",
        });
        const location = resolveRes.headers.get("location");
        if (location && location.includes("tiktok.com")) {
          url = location;
        }
      } catch (err) {
        // Abaikan jika gagal, lanjut dengan URL asli
      }
    }

    const type = getVideoSourceType(url);
    let title = "";
    let speaker = "";
    let thumbnailUrl = "";
    let embedUrl = "";
    let videoId = "";

    if (type === "tiktok") {
      const id = extractTikTokId(url);
      videoId = id || "";
      embedUrl = id ? `https://www.tiktok.com/player/v1/${id}?autoplay=1&muted=0&loop=1&controls=1&description=1&music_info=1` : url;

      // Ambil metadata dari TikTok oEmbed API (Resmi & Gratis)
      try {
        const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
          next: { revalidate: 3600 },
        });
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          title = data.title || "";
          speaker = data.author_name || "";
          thumbnailUrl = data.thumbnail_url || "";
        }
      } catch (e) {
        // Fallback jika oEmbed tidak merespons
      }

      // Jika oEmbed tidak mengembalikan author, coba ambil dari URL path (@username)
      if (!speaker) {
        const userMatch = url.match(/@([a-zA-Z0-9_.-]+)/);
        if (userMatch) speaker = `@${userMatch[1]}`;
      }
    } else if (type === "youtube") {
      const id = extractYouTubeId(url);
      videoId = id || "";
      embedUrl = id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&loop=1&playlist=${id}&controls=1&modestbranding=1&rel=0&enablejsapi=1` : url;
      thumbnailUrl = id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";

      // Ambil metadata dari YouTube oEmbed API
      try {
        const ytRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        if (ytRes.ok) {
          const data = await ytRes.json();
          title = data.title || "";
          speaker = data.author_name || "";
          if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
        }
      } catch (e) {
        // Fallback
      }
    } else if (type === "instagram") {
      const id = extractInstagramId(url);
      videoId = id || "";
      embedUrl = id ? `https://www.instagram.com/reel/${id}/embed` : url;
    } else {
      embedUrl = url;
    }

    return NextResponse.json({
      type,
      originalUrl: url,
      embedUrl,
      videoId,
      title,
      speaker,
      thumbnailUrl,
    });
  } catch (error: any) {
    console.error("Parse link error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memproses link video" },
      { status: 500 }
    );
  }
}

