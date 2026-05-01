import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Radio,
} from "lucide-react";

export interface VideoPlayerSectionProps {
  streamerName?: string;
  streamTitle?: string;
  category?: string;
  videoUrl?: string;
  platform?: "youtube" | "twitch" | "tiktok" | "instagram" | "own";
}

export function VideoPlayerSection({
  streamerName = "DJ Danny Hectic B",
  streamTitle = "Morning Vibes Mix",
  category = "Music / Electronic",
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
  platform = "youtube",
}: VideoPlayerSectionProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const renderVideoPlayer = () => {
    switch (platform) {
      case "youtube":
        return (
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/jNQXAC9IVRw?autoplay=1"
            title={streamTitle}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0"
          />
        );
      case "twitch":
        return (
          <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center">
            <div className="text-center">
              <Radio className="w-12 h-12 mx-auto mb-4 text-[#FF4444]" />
              <p className="text-sm font-bold mb-2">Twitch Stream</p>
              <p className="text-xs text-[#999999]">
                Stream would embed here
              </p>
            </div>
          </div>
        );
      case "tiktok":
        return (
          <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center">
            <div className="text-center">
              <Radio className="w-12 h-12 mx-auto mb-4 text-[#FF4444]" />
              <p className="text-sm font-bold mb-2">TikTok Live</p>
              <p className="text-xs text-[#999999]">
                Stream would embed here
              </p>
            </div>
          </div>
        );
      case "instagram":
        return (
          <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center">
            <div className="text-center">
              <Radio className="w-12 h-12 mx-auto mb-4 text-[#FF4444]" />
              <p className="text-sm font-bold mb-2">Instagram Live</p>
              <p className="text-xs text-[#999999]">
                Stream would embed here
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1F1F1F] to-[#0A0A0A] flex items-center justify-center">
            <div className="text-center">
              <Radio className="w-16 h-16 mx-auto mb-4 text-[#FF4444] animate-pulse" />
              <p className="text-lg font-bold mb-2">{streamTitle}</p>
              <p className="text-sm text-[#999999]">{streamerName}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      ref={videoContainerRef}
      className={`flex flex-col bg-[#0A0A0A] ${isFullscreen ? "h-screen" : "h-full"}`}
    >
      {/* Video Container */}
      <div className="relative w-full bg-[#0A0A0A] flex-1 overflow-hidden rounded-lg group">
        {/* Aspect Ratio Container (16:9) */}
        <div className="relative w-full pt-[56.25%]">
          {/* Video */}
          {renderVideoPlayer()}

          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 rounded-full bg-[#FF4444] hover:bg-[#FF5555] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 ml-1" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>
          </div>

          {/* Top Info Bar */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FF4444] animate-pulse" />
                <span className="text-xs font-bold text-white">LIVE</span>
              </div>
              <span className="text-xs text-white/80">{category}</span>
            </div>
          </div>

          {/* Bottom Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-black/40 rounded-full mb-3 cursor-pointer hover:h-2 transition-all">
              <div className="w-2/3 h-full bg-[#FF4444] rounded-full" />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Play/Pause */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 hover:bg-white/20 rounded transition"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-1 group/volume">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 hover:bg-white/20 rounded transition"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      if (Number(e.target.value) > 0) setIsMuted(false);
                    }}
                    className="w-0 group-hover/volume:w-20 transition-all duration-200 cursor-pointer"
                    title="Volume"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Settings */}
                <button
                  className="p-2 hover:bg-white/20 rounded transition"
                  title="Settings"
                >
                  <Settings className="w-4 h-4 text-white" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={handleFullscreen}
                  className="p-2 hover:bg-white/20 rounded transition"
                  title="Fullscreen"
                >
                  <Maximize className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Below Video Info - Not Fullscreen */}
      {!isFullscreen && (
        <div className="p-4 bg-[#1F1F1F] border-t border-[#333333]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white truncate">
                {streamTitle}
              </h2>
              <p className="text-sm text-[#999999]">
                by {streamerName}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="text-right text-xs text-[#999999] flex-shrink-0">
              <p className="font-bold text-white">Platform: {platform}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
