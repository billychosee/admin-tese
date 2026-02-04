export type VideoSourceType = "youtube" | "vimeo" | "dailymotion" | "direct" | "unknown";

export interface VideoSourceInfo {
  type: VideoSourceType;
  videoId?: string;
  embedUrl?: string;
}

export function getVideoSource(url: string): VideoSourceInfo {
  // YouTube patterns
  const youtubePatterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\s?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([^&\s]+)/,
  ];

  // Vimeo patterns
  const vimeoPatterns = [
    /(?:https?:\/\/)?(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|video\/|)(\d+)/,
  ];

  // Dailymotion patterns
  const dailymotionPatterns = [
    /(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/(?:video|embed)\/([^?\s]+)/,
  ];

  // Check YouTube
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      const videoId = match[1];
      return {
        type: "youtube",
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
      };
    }
  }

  // Check Vimeo
  const vimeoMatch = url.match(vimeoPatterns[0]);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: "vimeo",
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
    };
  }

  // Check Dailymotion
  const dailymotionMatch = url.match(dailymotionPatterns[0]);
  if (dailymotionMatch && dailymotionMatch[1]) {
    const videoId = dailymotionMatch[1];
    return {
      type: "dailymotion",
      videoId,
      embedUrl: `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`,
    };
  }

  // Check if it's a direct video file
  const videoExtensions = ["\.mp4", "\.webm", "\.ogg", "\.mov", "\.avi", "\.mkv", "\.m3u8"];
  const directPattern = new RegExp(`(${videoExtensions.join("|")})`, "i");
  
  if (directPattern.test(url)) {
    return {
      type: "direct",
      embedUrl: url,
    };
  }

  return {
    type: "unknown",
  };
}
