import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, TrendingUp, Users, Sparkles, Share2 } from "lucide-react";

interface TrackShareLeaderboardProps {
  trackId?: number;
  limit?: number;
  className?: string;
}

export function TrackShareLeaderboard({
  trackId,
  limit = 10,
  className = "",
}: TrackShareLeaderboardProps) {
  const { data: stats } = trpc.trackShares.stats.useQuery({ trackId });
  const { data: shares } = trpc.trackShares.list.useQuery({
    trackId,
    limit: limit * 2, // Get more to filter unique users
  });

  if (!stats || stats.totalShares === 0) {
    return (
      <Card className={`glass ${className}`}>
        <CardContent className="py-8 text-center">
          <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            No shares yet. Be the first to share this track!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group shares by user/platform and count
  const userShareCounts: Record<string, { count: number; platforms: Set<string>; coins: number }> = {};
  
  shares?.forEach((share) => {
    const key = share.userId?.toString() || share.userName || "anonymous";
    if (!userShareCounts[key]) {
      userShareCounts[key] = { count: 0, platforms: new Set(), coins: 0 };
    }
    userShareCounts[key].count += 1;
    userShareCounts[key].platforms.add(share.platform);
    userShareCounts[key].coins += share.coinsEarned || 0;
  });

  const leaderboard = Object.entries(userShareCounts)
    .map(([id, data]) => ({
      id,
      count: data.count,
      platforms: Array.from(data.platforms),
      coins: data.coins,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  const topPlatform = Object.entries(stats.sharesByPlatform || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))[0];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stats Overview */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Share Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{stats.totalShares}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Object.keys(stats.sharesByPlatform || {}).length}</div>
              <div className="text-xs text-muted-foreground mt-1">Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{leaderboard.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Active Sharers</div>
            </div>
          </div>
          
          {topPlatform && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Most Popular Platform:</span>
                <span className="font-semibold capitalize">{topPlatform[0]}</span>
                <span className="text-accent">({topPlatform[1]} shares)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            Top Sharers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No shares yet
            </p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" :
                      index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
                      index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {entry.id === "anonymous" ? "Anonymous" : `User ${entry.id}`}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {entry.count} share{entry.count !== 1 ? "s" : ""}
                        {entry.platforms.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{entry.platforms.join(", ")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {entry.coins > 0 && (
                    <div className="flex items-center gap-1 text-accent font-semibold text-sm">
                      <Sparkles className="w-4 h-4" />
                      {entry.coins}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Breakdown */}
      {Object.keys(stats.sharesByPlatform || {}).length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Share2 className="w-5 h-5 text-accent" />
              Platform Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.sharesByPlatform || {})
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([platform, count]) => {
                  const percentage = ((count as number) / stats.totalShares) * 100;
                  return (
                    <div key={platform} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{platform}</span>
                        <span className="text-muted-foreground">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
