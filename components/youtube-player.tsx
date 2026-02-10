'use client';

import React from "react"

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: Record<string, (event: YouTubeEvent) => void>;
        }
      ) => YouTubePlayerInstance;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubeEvent {
  data: number;
  target: YouTubePlayerInstance;
}

interface YouTubePlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  destroy: () => void;
}

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  startTime?: number;
  onProgressUpdate?: (currentTime: number, duration: number, percentage: number) => void;
  onComplete?: () => void;
  className?: string;
}

export function YouTubePlayer({
  videoId,
  title,
  startTime = 0,
  onProgressUpdate,
  onComplete,
  className = '',
}: YouTubePlayerProps) {
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const playerId = `yt-player-${videoId}`;

  const trackProgress = useCallback(() => {
    if (!playerRef.current) return;

    try {
      const time = playerRef.current.getCurrentTime();
      const dur = playerRef.current.getDuration();

      if (dur > 0) {
        const pct = Math.min((time / dur) * 100, 100);
        setCurrentTime(time);
        setDuration(dur);
        setWatchedPercentage(pct);
        onProgressUpdate?.(time, dur, pct);

        if (pct >= 95 && !hasCompleted) {
          setHasCompleted(true);
          onComplete?.();
        }
      }
    } catch {
      // Player might not be ready
    }
  }, [onProgressUpdate, onComplete, hasCompleted]);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!document.getElementById(playerId)) return;

      playerRef.current = new window.YT.Player(playerId, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          start: Math.floor(startTime),
          playsinline: 1,
        },
        events: {
          onReady: () => {
            setIsReady(true);
            if (startTime > 0 && playerRef.current) {
              playerRef.current.seekTo(startTime, true);
            }
          },
          onStateChange: (event: YouTubeEvent) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              intervalRef.current = setInterval(trackProgress, 1000);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              if (intervalRef.current) clearInterval(intervalRef.current);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              setHasCompleted(true);
              onComplete?.();
              if (intervalRef.current) clearInterval(intervalRef.current);
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Player already destroyed
        }
      }
    };
  }, [videoId, startTime, trackProgress, onComplete, playerId]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const seekTime = pct * duration;
    playerRef.current.seekTo(seekTime, true);
    setCurrentTime(seekTime);
    setWatchedPercentage(pct * 100);
  };

  const restart = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0, true);
    playerRef.current.playVideo();
    setHasCompleted(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className={`relative rounded-xl overflow-hidden bg-black ${className}`}>
      {/* Video container */}
      <div className="relative" style={{ paddingBottom: '56.25%' }}>
        <div id={playerId} className="absolute inset-0 w-full h-full" />

        {/* Overlay for play/pause click */}
        {isReady && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 w-full h-full z-10 cursor-pointer bg-transparent"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          />
        )}

        {/* Loading state */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-600 border-t-blue-500" />
              <p className="text-sm text-slate-400">Loading video...</p>
            </div>
          </div>
        )}
      </div>

      {/* Custom controls */}
      {isReady && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-3 px-4">
          {/* Progress bar */}
          <div
            className="w-full h-1.5 bg-slate-700 rounded-full cursor-pointer mb-3 group hover:h-2.5 transition-all"
            onClick={handleSeek}
            role="slider"
            aria-label="Video progress"
            aria-valuenow={watchedPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
          >
            <div
              className="h-full bg-blue-500 rounded-full relative transition-all"
              style={{ width: `${watchedPercentage}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={restart}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <span className="text-xs text-slate-300 ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{Math.round(watchedPercentage)}% watched</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Title overlay */}
      {title && isReady && !isPlaying && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4">
          <h3 className="text-white text-sm font-medium">{title}</h3>
        </div>
      )}
    </div>
  );
}

// Simple progress display component
export function VideoProgressBar({
  percentage,
  className = '',
}: {
  percentage: number;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between text-xs text-slate-400">
        <span>Video Progress</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  );
}
