import { useState } from "react";
import { Eye, Clock, Globe } from "lucide-react";

interface StreamAnalyticsProps {
  peakViewers?: number;
  avgViewers?: number;
  streamDuration?: string;
  topCountries?: { code: string; viewers: number }[];
}

type FilterTab = "metrics" | "regions";

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
  const [activeTab, setActiveTab] = useState<FilterTab>("metrics");
  const totalViewers = topCountries.reduce((sum, c) => sum + c.viewers, 0);

  return (
    <div className="bg-dark-surface rounded-lg border border-border-primary p-md space-y-md">
      <div className="flex items-center justify-between">
        <h4 className="text-caption font-bold text-white uppercase tracking-wider">Stream Analytics</h4>

        {/* Toggle buttons */}
        <div className="flex items-center gap-xs bg-dark-bg rounded-lg p-xs">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`text-micro font-semibold px-sm py-xs rounded transition-all duration-base ${
              activeTab === "metrics"
                ? "bg-accent-primary text-white shadow-sm"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab("regions")}
            className={`text-micro font-semibold px-sm py-xs rounded transition-all duration-base ${
              activeTab === "regions"
                ? "bg-accent-primary text-white shadow-sm"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Regions
          </button>
        </div>
      </div>

      {/* Metrics view */}
      {activeTab === "metrics" && (
        <div className="grid grid-cols-2 gap-md tablet:grid-cols-2 desktop:grid-cols-2 wide:grid-cols-4 animate-in fade-in slide-in-from-left-4 duration-200">
          {/* Peak Viewers */}
          <div className="bg-dark-bg rounded-lg p-md border border-border-primary/50 hover:border-accent-red/50 transition-all duration-base group cursor-pointer">
            <p className="text-caption text-text-secondary font-semibold mb-xs flex items-center gap-xs">
              <Eye className="w-4 h-4 text-accent-red group-hover:scale-110 transition-transform duration-base" />
              Peak Viewers
            </p>
            <p className="text-h2 font-extrabold text-accent-red">
              {peakViewers.toLocaleString()}
            </p>
          </div>

          {/* Average Viewers */}
          <div className="bg-dark-bg rounded-lg p-md border border-border-primary/50 hover:border-accent-primary/50 transition-all duration-base group cursor-pointer">
            <p className="text-caption text-text-secondary font-semibold mb-xs flex items-center gap-xs">
              <Eye className="w-4 h-4 text-accent-primary group-hover:scale-110 transition-transform duration-base" />
              Average Viewers
            </p>
            <p className="text-h2 font-extrabold text-white">
              {avgViewers.toLocaleString()}
            </p>
          </div>

          {/* Stream Duration */}
          <div className="bg-dark-bg rounded-lg p-md border border-border-primary/50 hover:border-accent-primary/50 transition-all duration-base group cursor-pointer">
            <p className="text-caption text-text-secondary font-semibold mb-xs flex items-center gap-xs">
              <Clock className="w-4 h-4 text-accent-primary group-hover:scale-110 transition-transform duration-base" />
              Duration
            </p>
            <p className="text-h2 font-extrabold text-white">{streamDuration}</p>
          </div>

          {/* Average % */}
          <div className="bg-dark-bg rounded-lg p-md border border-border-primary/50 hover:border-accent-primary/50 transition-all duration-base group cursor-pointer">
            <p className="text-caption text-text-secondary font-semibold mb-xs">Avg Retention</p>
            <p className="text-h2 font-extrabold text-white">
              {Math.round((avgViewers / peakViewers) * 100)}%
            </p>
          </div>
        </div>
      )}

      {/* Regions view */}
      {activeTab === "regions" && (
        <div className="space-y-md animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="space-y-sm">
            {topCountries.map((country, idx) => {
              const percentage = Math.round((country.viewers / totalViewers) * 100);
              const barWidth = (country.viewers / topCountries[0].viewers) * 100;

              return (
                <div key={country.code} className="group">
                  {/* Country header */}
                  <div className="flex items-center justify-between mb-xs">
                    <span className="text-caption font-semibold text-text-secondary">
                      {country.code}
                    </span>
                    <span className="text-caption font-bold text-white">
                      {country.viewers.toLocaleString()} ({percentage}%)
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="h-2 bg-dark-bg rounded-full overflow-hidden border border-border-primary/30 group-hover:border-accent-primary/50 transition-all duration-base">
                    <div
                      className="h-full bg-gradient-to-r from-accent-primary to-accent-red transition-all duration-base group-hover:shadow-lg"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-dark-bg rounded-lg p-md border border-border-primary/50">
            <p className="text-micro text-text-secondary mb-xs">Total Viewers from Top Regions</p>
            <p className="text-h3 font-extrabold text-white">{totalViewers.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
