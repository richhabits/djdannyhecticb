import { Activity, Zap, Radio } from "lucide-react";

interface StreamHealthProps {
  bitrate?: number; // kbps
  fps?: number;
  resolution?: string;
  isHealthy?: boolean;
}

export function StreamHealthIndicator({
  bitrate = 5000,
  fps = 60,
  resolution = "1080p",
  isHealthy = true,
}: StreamHealthProps) {
  const healthColor = isHealthy ? "text-green-500" : "text-red-500";
  const healthBg = isHealthy ? "bg-green-500/10" : "bg-red-500/10";

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${healthBg} border border-${isHealthy ? "green" : "red"}-500/30`}>
      <div className="flex items-center gap-2 text-xs">
        <Activity className={`w-4 h-4 ${healthColor}`} />
        <span className={`font-semibold ${healthColor}`}>
          {isHealthy ? "HEALTHY" : "WARNING"}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-[#999999]">
        <div className="flex items-center gap-1">
          <Radio className="w-3 h-3" />
          <span>{bitrate}kbps</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          <span>{fps}fps</span>
        </div>
        <div className="px-2 py-1 rounded bg-[#2F2F2F]">{resolution}</div>
      </div>
    </div>
  );
}
