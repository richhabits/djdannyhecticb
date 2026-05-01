import { useState } from "react";
import { Settings } from "lucide-react";

interface Quality {
  label: string;
  value: string;
  bitrate: string;
  fps: string;
}

interface QualitySelectorProps {
  qualities?: Quality[];
  currentQuality?: string;
  onQualityChange?: (quality: string) => void;
}

export function QualitySelector({
  qualities = [
    { label: "Auto", value: "auto", bitrate: "Adaptive", fps: "60" },
    { label: "1080p60", value: "1080p60", bitrate: "5000-8000", fps: "60" },
    { label: "1080p30", value: "1080p30", bitrate: "3000-5000", fps: "30" },
    { label: "720p60", value: "720p60", bitrate: "2500-4000", fps: "60" },
    { label: "720p30", value: "720p30", bitrate: "1500-2500", fps: "30" },
    { label: "480p30", value: "480p30", bitrate: "800-1500", fps: "30" },
    { label: "Audio", value: "audio", bitrate: "128", fps: "N/A" },
  ],
  currentQuality = "auto",
  onQualityChange,
}: QualitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#2F2F2F] hover:bg-[#3F3F3F] transition text-xs font-bold text-white"
      >
        <Settings className="w-3 h-3" />
        {qualities.find((q) => q.value === currentQuality)?.label}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#1F1F1F] border border-[#333333] rounded-lg shadow-xl z-50">
          <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
            {qualities.map((quality) => (
              <button
                key={quality.value}
                onClick={() => {
                  onQualityChange?.(quality.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-xs transition ${
                  currentQuality === quality.value
                    ? "bg-[#FF4444] text-white"
                    : "bg-[#2F2F2F] text-[#999999] hover:bg-[#3F3F3F] hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{quality.label}</span>
                  {currentQuality === quality.value && (
                    <span className="text-xs">✓</span>
                  )}
                </div>
                <div className="text-xs opacity-75">
                  {quality.bitrate} kbps @ {quality.fps} fps
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
