import { useState } from "react";
import { Crown, Flame, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  value: number;
  type: "donor" | "chatter";
  avatar?: string;
  badge?: "gold" | "silver" | "bronze";
  trend?: "up" | "down" | "stable";
}

export interface LeaderboardWidgetProps {
  title?: string;
  entries?: LeaderboardEntry[];
  type?: "donors" | "chatters" | "both";
}

export function LeaderboardWidget({
  title = "Top Supporters",
  entries,
  type = "donors",
}: LeaderboardWidgetProps) {
  const defaultEntries: LeaderboardEntry[] = [
    {
      rank: 1,
      name: "IceKing99",
      value: 500,
      type: "donor",
      badge: "gold",
      trend: "up",
      avatar: "👑",
    },
    {
      rank: 2,
      name: "VibeChecker",
      value: 250,
      type: "donor",
      badge: "silver",
      trend: "stable",
      avatar: "🎧",
    },
    {
      rank: 3,
      name: "SoundWave",
      value: 150,
      type: "donor",
      badge: "bronze",
      trend: "up",
      avatar: "🌊",
    },
    {
      rank: 4,
      name: "BeatMaster",
      value: 100,
      type: "donor",
      trend: "down",
      avatar: "🔥",
    },
    {
      rank: 5,
      name: "MusicLover",
      value: 50,
      type: "donor",
      trend: "stable",
      avatar: "🎵",
    },
  ];

  const displayEntries = entries || defaultEntries;

  const getBadgeIcon = (badge?: string) => {
    switch (badge) {
      case "gold":
        return "👑";
      case "silver":
        return "🥈";
      case "bronze":
        return "🥉";
      default:
        return null;
    }
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case "gold":
        return "from-yellow-500 to-amber-500";
      case "silver":
        return "from-gray-300 to-gray-400";
      case "bronze":
        return "from-orange-600 to-orange-700";
      default:
        return "from-[#2F2F2F] to-[#1F1F1F]";
    }
  };

  return (
    <Card className="bg-[#1F1F1F] border-[#333333] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#333333] bg-gradient-to-r from-[#FF4444]/10 to-transparent">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-[#FF4444]" />
          <h3 className="font-bold text-white">{title}</h3>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-0">
        {displayEntries.map((entry, idx) => (
          <div
            key={`${entry.name}-${idx}`}
            className={`
              px-4 py-3 flex items-center gap-3 hover:bg-[#2F2F2F] transition-colors group
              ${idx !== displayEntries.length - 1 ? "border-b border-[#2F2F2F]" : ""}
              ${entry.badge ? "bg-" + entry.badge + "-500/5" : ""}
            `}
          >
            {/* Rank */}
            <div
              className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0
                ${entry.badge ? `bg-gradient-to-br ${getBadgeColor(entry.badge)}` : "bg-[#2F2F2F]"}
                ${entry.badge ? "text-white" : "text-[#999999]"}
              `}
            >
              {entry.rank <= 3 ? getBadgeIcon(entry.badge) : entry.rank}
            </div>

            {/* Avatar & Name */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {entry.avatar && (
                <span className="text-lg flex-shrink-0">{entry.avatar}</span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">
                  {entry.name}
                </p>
                <p className="text-xs text-[#999999]">
                  {entry.type === "donor" ? "Donor" : "Chatter"}
                </p>
              </div>
            </div>

            {/* Trend */}
            {entry.trend && (
              <div className="flex-shrink-0">
                {entry.trend === "up" && (
                  <TrendingUp className="w-4 h-4 text-[#22C55E] animate-bounce" />
                )}
                {entry.trend === "down" && (
                  <TrendingUp className="w-4 h-4 text-[#EF4444] rotate-180" />
                )}
              </div>
            )}

            {/* Value */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-[#FF4444]">
                {entry.type === "donor"
                  ? `$${entry.value.toLocaleString()}`
                  : `${entry.value} msgs`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-3 bg-[#0A0A0A] border-t border-[#333333]">
        <div className="grid grid-cols-2 gap-3 text-xs text-center">
          <div>
            <p className="text-[#999999] mb-1">Total Raised</p>
            <p className="font-bold text-[#FF4444]">
              ${displayEntries.reduce((sum, e) => sum + e.value, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[#999999] mb-1">Avg Donation</p>
            <p className="font-bold text-white">
              ${Math.round(displayEntries.reduce((sum, e) => sum + e.value, 0) / displayEntries.length).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
