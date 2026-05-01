import { TrendingUp, Eye, Clock } from "lucide-react";

interface StreamAnalyticsProps {
  peakViewers?: number;
  avgViewers?: number;
  streamDuration?: string;
  topCountries?: { code: string; viewers: number }[];
}

export function StreamAnalytics({
  peakViewers = 5200,
  avgViewers = 3847,
  streamDuration = "2:15:30",
  topCountries = [
    { code: "US", viewers: 1850 },
    { code: "UK", viewers: 890 },
    { code: "CA", viewers: 650 },
    { code: "AU", viewers: 457 },
  ],
}: StreamAnalyticsProps) {
  return (
    <div className="bg-[#0A0A0A] rounded-lg border border-[#333333] p-3 space-y-3">
      <h4 className="text-xs font-bold text-white">STREAM ANALYTICS</h4>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#2F2F2F] rounded p-2">
          <p className="text-xs text-[#999999] mb-1">Peak</p>
          <p className="text-sm font-bold text-[#FF4444]">
            {peakViewers.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#2F2F2F] rounded p-2">
          <p className="text-xs text-[#999999] mb-1">Average</p>
          <p className="text-sm font-bold text-white">
            {avgViewers.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#2F2F2F] rounded p-2">
          <p className="text-xs text-[#999999] mb-1">Duration</p>
          <p className="text-sm font-bold text-white">{streamDuration}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-white mb-2">Top Regions</p>
        <div className="space-y-1">
          {topCountries.map((country) => (
            <div key={country.code} className="flex items-center justify-between text-xs">
              <span className="text-[#999999]">{country.code}</span>
              <div className="flex-1 mx-2 h-1.5 bg-[#2F2F2F] rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF4444] to-[#FF6666]"
                  style={{
                    width: `${(country.viewers / topCountries[0].viewers) * 100}%`,
                  }}
                />
              </div>
              <span className="text-white font-bold">
                {country.viewers.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
