import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Music, Share2, TrendingUp, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ShareLeaderboard() {
  const { data: topTracks, isLoading: tracksLoading } = trpc.trackShares.topShared.useQuery({ limit: 20 });
  const { data: stats, isLoading: statsLoading } = trpc.trackShares.stats.useQuery();

  if (tracksLoading || statsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Share Leaderboard</h1>
          <p className="text-muted-foreground">
            The most shared tracks on Hectic Radio
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Shares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-accent" />
                <span className="text-2xl font-bold">{stats?.totalShares || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold">{stats?.totalClicks || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Top Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-lg font-semibold">
                  {stats?.byPlatform && Object.keys(stats.byPlatform).length > 0
                    ? Object.entries(stats.byPlatform)
                        .sort((a, b) => b[1].shares - a[1].shares)[0][0]
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Breakdown */}
        {stats?.byPlatform && Object.keys(stats.byPlatform).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Shares by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byPlatform)
                  .sort((a, b) => b[1].shares - a[1].shares)
                  .map(([platform, data]) => (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{platform}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {data.shares} shares
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {data.clicks} clicks
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Shared Tracks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Most Shared Tracks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topTracks && topTracks.length > 0 ? (
              <div className="space-y-3">
                {topTracks.map((track: any, index: number) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{track.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {track.shareCount || 0} shares
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No tracks shared yet. Be the first to share! 🎵
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
