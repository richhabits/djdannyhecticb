import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Quality {
  label: string;
  value: string;
  bitrate: string;
  fps: string;
  recommended?: boolean;
}

interface QualitySelectorProps {
  qualities?: Quality[];
  currentQuality?: string;
  onQualityChange?: (quality: string) => void;
}

const qualityGroups = {
  hd: ["Auto", "1080p60", "1080p30", "720p60", "720p30"],
  sd: ["480p30", "360p30"],
  audio: ["Audio"],
};

export function QualitySelector({
  qualities = [
    { label: "Auto", value: "auto", bitrate: "Adaptive", fps: "60", recommended: true },
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
  const currentLabel = qualities.find((q) => q.value === currentQuality)?.label;

  const getGroupedQualities = () => {
    const groups: Record<string, Quality[]> = { hd: [], sd: [], audio: [] };
    qualities.forEach((q) => {
      if (qualityGroups.hd.includes(q.label)) groups.hd.push(q);
      else if (qualityGroups.sd.includes(q.label)) groups.sd.push(q);
      else if (qualityGroups.audio.includes(q.label)) groups.audio.push(q);
    });
    return groups;
  };

  const grouped = getGroupedQualities();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-sm px-md py-sm rounded bg-dark-bg hover:bg-dark-surface transition-all duration-base text-caption font-semibold text-text-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span>Quality: {currentLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-base ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-sm w-64 bg-dark-surface border border-border-primary rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="max-h-96 overflow-y-auto">
            {/* HD Group */}
            {grouped.hd.length > 0 && (
              <div>
                <label className="text-micro text-text-tertiary font-semibold px-md py-sm block bg-dark-bg/50 sticky top-0 uppercase tracking-wider">
                  HD Quality
                </label>
                <div className="space-y-xs p-xs">
                  {grouped.hd.map((quality) => (
                    <button
                      key={quality.value}
                      onClick={() => {
                        onQualityChange?.(quality.value);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-md py-sm rounded transition-all duration-base flex items-center justify-between group ${
                        currentQuality === quality.value
                          ? "bg-accent-primary text-white shadow-md"
                          : "bg-dark-bg text-text-secondary hover:bg-dark-surface hover:text-white"
                      }`}
                    >
                      <div>
                        <p className="text-caption font-semibold">{quality.label}</p>
                        <p className="text-micro text-current/70 mt-xs">
                          {quality.bitrate} kbps @ {quality.fps} fps
                        </p>
                      </div>
                      {currentQuality === quality.value && (
                        <span className="text-lg">✓</span>
                      )}
                      {quality.recommended && currentQuality !== quality.value && (
                        <span className="text-micro font-bold text-emerald-400">Rec.</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SD Group */}
            {grouped.sd.length > 0 && (
              <div className="border-t border-border-primary">
                <label className="text-micro text-text-tertiary font-semibold px-md py-sm block bg-dark-bg/50 sticky top-10 uppercase tracking-wider">
                  SD Quality
                </label>
                <div className="space-y-xs p-xs">
                  {grouped.sd.map((quality) => (
                    <button
                      key={quality.value}
                      onClick={() => {
                        onQualityChange?.(quality.value);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-md py-sm rounded transition-all duration-base flex items-center justify-between group ${
                        currentQuality === quality.value
                          ? "bg-accent-primary text-white shadow-md"
                          : "bg-dark-bg text-text-secondary hover:bg-dark-surface hover:text-white"
                      }`}
                    >
                      <div>
                        <p className="text-caption font-semibold">{quality.label}</p>
                        <p className="text-micro text-current/70 mt-xs">
                          {quality.bitrate} kbps @ {quality.fps} fps
                        </p>
                      </div>
                      {currentQuality === quality.value && (
                        <span className="text-lg">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Group */}
            {grouped.audio.length > 0 && (
              <div className="border-t border-border-primary">
                <label className="text-micro text-text-tertiary font-semibold px-md py-sm block bg-dark-bg/50 sticky top-20 uppercase tracking-wider">
                  Audio Only
                </label>
                <div className="space-y-xs p-xs">
                  {grouped.audio.map((quality) => (
                    <button
                      key={quality.value}
                      onClick={() => {
                        onQualityChange?.(quality.value);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-md py-sm rounded transition-all duration-base flex items-center justify-between group ${
                        currentQuality === quality.value
                          ? "bg-accent-primary text-white shadow-md"
                          : "bg-dark-bg text-text-secondary hover:bg-dark-surface hover:text-white"
                      }`}
                    >
                      <div>
                        <p className="text-caption font-semibold">{quality.label}</p>
                        <p className="text-micro text-current/70 mt-xs">
                          {quality.bitrate} kbps
                        </p>
                      </div>
                      {currentQuality === quality.value && (
                        <span className="text-lg">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
