import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Instagram,
  Twitter,
  Facebook,
  MessageCircle,
  Music2,
  TrendingUp,
  Coins,
  Share2,
  Award,
} from "lucide-react";

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  tiktok: Music2,
  twitter: Twitter,
  facebook: Facebook,
  whatsapp: MessageCircle,
  telegram: MessageCircle,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "from-pink-500 to-purple-500",
  tiktok: "from-black to-cyan-500",
  twitter: "from-blue-400 to-blue-600",
  facebook: "from-blue-600 to-blue-800",
  whatsapp: "from-green-400 to-green-600",
  telegram: "from-blue-400 to-blue-500",
};

export function SocialAnalytics() {
  const { data: stats, isLoading } = trpc.socialMedia.sharing.myShareStats.useQuery();
  const { data: shares } = trpc.socialMedia.sharing.myShares.useQuery({ limit: 5 });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Analytics</CardTitle>
          <CardDescription>Track your sharing activity and rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Start sharing tracks to see your analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Shares</p>
                <p className="text-3xl font-bold mt-1">{stats.totalShares}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <Share2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coins Earned</p>
                <p className="text-3xl font-bold mt-1">{stats.totalCoinsEarned}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg">
                <Coins className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Platform</p>
                <p className="text-xl font-bold mt-1">
                  {stats.platformBreakdown.length > 0
                    ? stats.platformBreakdown.sort((a, b) => b.shares - a.shares)[0].platform
                    : "-"}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Breakdown</CardTitle>
          <CardDescription>Your activity across different platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.platformBreakdown.length > 0 ? (
              stats.platformBreakdown
                .sort((a, b) => b.shares - a.shares)
                .map((platform) => {
                  const Icon = PLATFORM_ICONS[platform.platform] || Share2;
                  const color = PLATFORM_COLORS[platform.platform] || "from-gray-400 to-gray-600";

                  return (
                    <div
                      key={platform.platform}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{platform.platform}</p>
                          <p className="text-sm text-muted-foreground">
                            {platform.shares} shares
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-yellow-500" />
                        {platform.coins}
                      </Badge>
                    </div>
                  );
                })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No platform data yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Track */}
      {stats.topTrack && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Your Most Shared Track
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
                  <Music2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{stats.topTrack.title}</p>
                  <p className="text-muted-foreground">{stats.topTrack.artist}</p>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {stats.topTrack.shares} shares
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Shares */}
      {shares && shares.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Shares</CardTitle>
            <CardDescription>Your latest shared tracks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {shares.map((share) => {
                const Icon = PLATFORM_ICONS[share.platform] || Share2;

                return (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{share.trackTitle}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {share.trackArtist}
                        </p>
                      </div>
                    </div>
                    {share.coinsEarned > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                        <Coins className="w-3 h-3 text-yellow-500" />
                        {share.coinsEarned}
                      </Badge>
                    )}
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
