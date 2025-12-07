"use client";

import { useEffect, useRef, useState } from "react";

type YTPlayer = {
  loadVideoById: (videoId: string) => void;
  destroy: () => void;
  getDuration: () => number;
  getCurrentTime: () => number;
};

type YTNamespace = {
  Player: new (element: HTMLElement, options: any) => YTPlayer;
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
  };
};

type YoutubePlayerProps = {
  videoId: string;
  title?: string;
  /** 視聴率の閾値（0-1）。到達時に onReachedThreshold が1度だけ呼ばれる */
  watchThreshold?: number;
  onReachedThreshold?: () => void;
  onProgress?: (payload: { progress: number; current: number; duration: number }) => void;
  className?: string;
};

declare global {
  interface Window {
    YT: YTNamespace | undefined;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export function YoutubePlayer({
  videoId,
  title,
  watchThreshold = 0.8,
  onReachedThreshold,
  onProgress,
  className = "",
}: YoutubePlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const reachedRef = useRef(false);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadIframeApi().then(() => {
      if (cancelled) return;
      createPlayer();
    });

    return () => {
      cancelled = true;
      stopProgressTimer();
      playerRef.current?.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !playerRef.current) return;
    reachedRef.current = false;
    playerRef.current.loadVideoById(videoId);
  }, [videoId, ready]);

  const createPlayer = () => {
    if (!containerRef.current || !window.YT) return;
    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: () => setReady(true),
        onStateChange: handleStateChange,
      },
    });
  };

  const handleStateChange = (event: { data: number }) => {
    if (!playerRef.current) return;
    const PlayerState = window.YT?.PlayerState;
    if (!PlayerState) return;

    if (event.data === PlayerState.PLAYING) {
      startProgressTimer();
    } else if (event.data === PlayerState.PAUSED || event.data === PlayerState.ENDED) {
      stopProgressTimer();
      if (event.data === PlayerState.ENDED && onReachedThreshold && !reachedRef.current) {
        reachedRef.current = true;
        onReachedThreshold();
      }
    }
  };

  const startProgressTimer = () => {
    if (!playerRef.current) return;
    stopProgressTimer();
    progressTimer.current = setInterval(() => {
      if (!playerRef.current) return;
      const duration = playerRef.current.getDuration() || 0;
      const current = playerRef.current.getCurrentTime() || 0;
      if (!duration) return;
      const progress = Math.min(current / duration, 1);
      onProgress?.({ progress, current, duration });
      if (!reachedRef.current && progress >= watchThreshold) {
        reachedRef.current = true;
        onReachedThreshold?.();
      }
    }, 1000);
  };

  const stopProgressTimer = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-md bg-black aspect-video w-full ${className}`}>
      <div className="w-full h-full" ref={containerRef} aria-label={title ?? "YouTube動画プレーヤー"} />
    </div>
  );
}

let iframeApiPromise: Promise<void> | null = null;

function loadIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();

  if (!iframeApiPromise) {
    iframeApiPromise = new Promise<void>((resolve, reject) => {
      const finish = () => {
        if (window.YT?.Player) resolve();
      };

      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        finish();
      };

      const existingScript = document.querySelector<HTMLScriptElement>(
        "script[src=\"https://www.youtube.com/iframe_api\"]",
      );
      if (existingScript) {
        existingScript.addEventListener("error", () => reject(new Error("failed to load iframe api")), {
          once: true,
        });
        return;
      }

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      tag.onerror = () => reject(new Error("failed to load iframe api"));
      document.body.appendChild(tag);
    }).catch((error) => {
      iframeApiPromise = null; // allow retry on failure
      throw error;
    });
  }

  return iframeApiPromise;
}
