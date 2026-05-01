import { Eye, Clock, Heart } from "lucide-react";

export interface ViewerStatsProps {
  viewerCount: number;
  streamDuration: string;
  donationsRaised: number;
  compact?: boolean;
}

export function ViewerStats({
  viewerCount,
  streamDuration,
  donationsRaised,
  compact = false,
}: ViewerStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-[#999999]">
          <Eye className="w-3 h-3" />
          <span className="font-bold">{formatNumber(viewerCount)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#999999]">
          <Clock className="w-3 h-3" />
          <span className="font-bold">{streamDuration}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#FF4444]">
          <Heart className="w-3 h-3" />
          <span className="font-bold">${donationsRaised.toLocaleString()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Viewers */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-[#FF4444]/10">
          <Eye className="w-5 h-5 text-[#FF4444]" />
        </div>
        <div>
          <p className="text-xs text-[#999999] uppercase tracking-wide">
            Viewers
          </p>
          <p className="text-xl font-bold text-white">
            {formatNumber(viewerCount)}
          </p>
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-[#FF4444]/10">
          <Clock className="w-5 h-5 text-[#FF4444]" />
        </div>
        <div>
          <p className="text-xs text-[#999999] uppercase tracking-wide">
            Duration
          </p>
          <p className="text-xl font-bold text-white">{streamDuration}</p>
        </div>
      </div>

      {/* Donations */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-[#FF4444]/10">
          <Heart className="w-5 h-5 text-[#FF4444]" />
        </div>
        <div>
          <p className="text-xs text-[#999999] uppercase tracking-wide">
            Donations
          </p>
          <p className="text-xl font-bold text-[#FF4444]">
            ${donationsRaised.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
