export type VideoEmbedInfo =
  | { type: "youtube"; embedUrl: string }
  | { type: "vimeo"; embedUrl: string }
  | { type: "video"; url: string };

export function parseVideoUrl(rawUrl?: string | null): VideoEmbedInfo | null {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  if (!url) return null;

  // If iframe passed
  const iframeMatch = url.match(/src=["']([^"']+)["']/i);
  const targetUrl = iframeMatch ? iframeMatch[1] : url;

  // YouTube match:
  // - youtu.be/ID
  // - youtube.com/watch?v=ID
  // - youtube.com/embed/ID
  // - youtube.com/v/ID
  // - youtube.com/shorts/ID
  const ytMatch = targetUrl.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
    };
  }

  // Vimeo match:
  const vimeoMatch = targetUrl.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/i
  );
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
    };
  }

  return {
    type: "video",
    url: targetUrl,
  };
}

