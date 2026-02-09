"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/utils";
import { Icons } from "@/components/ui/Icons";
import { getVideoSource, VideoSourceType } from "@/utils/videoUtils";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  onError?: (error: Error) => void;
}

export function VideoPlayer({
  src,
  poster,
  title,
  className,
  autoPlay = false,
  onError,
}: VideoPlayerProps) {
  const [videoType, setVideoType] = useState<VideoSourceType>("unknown");
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!src) {
      setError("No video source provided");
      setIsLoading(false);
      return;
    }

    const sourceInfo = getVideoSource(src);
    setVideoType(sourceInfo.type);
    setEmbedUrl(sourceInfo.embedUrl || "");

    if (sourceInfo.type === "unknown") {
      setError("Unsupported video format");
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [src]);

  // Handle direct video files with native video element
  if (videoType === "direct") {
    return (
      <div
        className={cn(
          "relative aspect-video bg-[hsl(var(--background))] rounded-xl overflow-hidden",
          className,
        )}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          autoPlay={autoPlay}
          className="w-full h-full object-contain"
          preload="metadata"
          onError={() => {
            setError("Failed to load video");
            onError?.(new Error("Video load error"));
          }}
        />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--background))]">
            <div className="text-center text-[hsl(var(--text-muted))]">
              <Icons.Video size={48} className="mx-auto mb-2" />
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Handle YouTube, Vimeo, Dailymotion embeds
  if (
    videoType === "youtube" ||
    videoType === "vimeo" ||
    videoType === "dailymotion"
  ) {
    return (
      <div
        className={cn(
          "relative aspect-video bg-[hsl(var(--background))] rounded-xl overflow-hidden",
          className,
        )}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--background))]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
          </div>
        )}
        {embedUrl && (
          <iframe
            src={embedUrl}
            title={title || "Video player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full absolute inset-0"
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>
    );
  }

  // Fallback for unknown formats - show thumbnail with play button
  return (
    <div
      className={cn(
        "relative aspect-video bg-[hsl(var(--background))] rounded-xl overflow-hidden",
        className,
      )}
    >
      {poster ? (
        <>
          <img
            src={poster}
            alt={title || "Video thumbnail"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Icons.Play
                size={32}
                className="text-[hsl(var(--primary))] ml-1"
              />
            </div>
          </div>
          {title && (
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-semibold truncate">{title}</p>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Icons.Video size={48} className="text-[hsl(var(--text-muted))]" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-[hsl(var(--text-muted))]">
            <Icons.AlertCircle size={48} className="mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Simplified version for when we just need to detect video type without rendering
export function isOnlineVideo(url: string): boolean {
  const sourceInfo = getVideoSource(url);
  return sourceInfo.type !== "unknown";
}

export function getVideoTypeLabel(type: VideoSourceType): string {
  switch (type) {
    case "youtube":
      return "YouTube";
    case "vimeo":
      return "Vimeo";
    case "dailymotion":
      return "Dailymotion";
    case "direct":
      return "Direct Video";
    default:
      return "Unknown";
  }
}
