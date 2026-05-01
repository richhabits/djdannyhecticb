import { Activity, Zap, Radio } from "lucide-react";

interface StreamHealthProps {
  bitrate?: number; // Mbps
  fps?: number;
  resolution?: string;
  isHealthy?: boolean;
}

export function StreamHealthIndicator({
  bitrate = 5,
  fps = 60,
  resolution = "1080p",
  isHealthy = true,
}: StreamHealthProps) {
  // Determine health status based on bitrate thresholds
  const getHealthStatus = (br: number) => {
    if (br > 2) return { status: "healthy", color: "from-emerald-600 to-teal-700", icon: "bg-emerald-500", text: "text-emerald-400", textLabel: "text-emerald-300" };
    if (br >= 1) return { status: "caution", color: "from-amber-600 to-orange-700", icon: "bg-amber-500", text: "text-amber-400", textLabel: "text-amber-300" };
    return { status: "critical", color: "from-red-600 to-rose-700", icon: "bg-red-500", text: "text-red-400", textLabel: "text-red-300" };
  };

  const health = getHealthStatus(bitrate);

  return (
    <div
      className={`bg-gradient-to-r ${health.color} rounded-lg p-md border border-white/10 shadow-md transition-all duration-200 hover:shadow-lg`}
      role="region"
      aria-label="Stream health indicator"
    >
      <div className="flex items-center justify-between gap-md">
        {/* Left side: Status indicator with text label */}
        <div>
          <h3 className="text-caption font-semibold text-white/70 mb-xs">Stream Health</h3>
          <div className="flex items-center gap-sm">
            <div
              className={`w-3 h-3 rounded-full ${health.icon} transition-colors duration-200 animate-pulse`}
              role="status"
              aria-label={`Stream status: ${health.status.charAt(0).toUpperCase() + health.status.slice(1)}`}
            />
            <span className={`text-body font-semibold ${health.textLabel} capitalize`}>
              {health.status}
            </span>
          </div>
          <span className="sr-only">
            {health.status === "healthy" && "Good streaming conditions"}
            {health.status === "caution" && "Stream quality may be affected"}
            {health.status === "critical" && "Critical streaming issues"}
          </span>
        </div>

        {/* Right side: Bitrate display */}
        <div className="text-right">
          <p className="text-caption text-white/70 mb-xs">Bitrate</p>
          <p className={`text-h3 font-extrabold ${health.text}`}>{bitrate.toFixed(1)}</p>
          <p className="text-micro text-white/50 mt-xs">Mbps</p>
        </div>
      </div>

      {/* Secondary metrics with accessible labels */}
      <div className="flex items-center justify-between gap-md mt-md pt-md border-t border-white/10">
        <div className="flex items-center gap-xs" aria-label={`Frame rate: ${fps} frames per second`}>
          <Zap className="w-3 h-3 text-white/50" aria-hidden="true" />
          <span className="text-caption text-white/70">{fps} FPS</span>
        </div>
        <div
          className="text-caption font-medium text-white/80 px-sm py-xs rounded bg-white/5"
          aria-label={`Resolution: ${resolution}`}
        >
          {resolution}
        </div>
      </div>

      {/* Screen reader only full status message */}
      <span className="sr-only">
        Stream is {health.status}. Bitrate: {bitrate.toFixed(1)} Megabits per second, Frame rate: {fps} frames per second, Resolution: {resolution}
      </span>
    </div>
  );
}
