import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Instagram,
  Twitter,
  Facebook,
  MessageCircle,
  Music2,
  Radio,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  tiktok: Music2,
  twitter: Twitter,
  facebook: Facebook,
  whatsapp: MessageCircle,
  telegram: MessageCircle,
  other: Radio,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "from-pink-500 to-purple-500",
  tiktok: "from-black to-cyan-500",
  twitter: "from-blue-400 to-blue-600",
  facebook: "from-blue-600 to-blue-800",
  whatsapp: "from-green-400 to-green-600",
  telegram: "from-blue-400 to-blue-500",
  other: "from-gray-400 to-gray-600",
};

export function LiveShareFeed() {
  const { data: recentShares, isLoading } = trpc.socialMedia.sharing.recentShares.useQuery(
    { limit: 20 },
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 animate-pulse" />
            Live Share Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recentShares || recentShares.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5" />
            Live Share Feed
          </CardTitle>
          <CardDescription>See what the crew is sharing</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No shares yet. Be the first to share a track!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="w-5 h-5" />
          Live Share Feed
          <Badge variant="secondary" className="ml-auto">
            {recentShares.length} recent
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time shares from the Hectic Radio community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentShares.map((share) => {
            const Icon = PLATFORM_ICONS[share.platform] || Radio;
            const color = PLATFORM_COLORS[share.platform] || PLATFORM_COLORS.other;
            const initials = "U"; // We'd get this from user data in production

            return (
              <div
                key={share.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">Someone</p>
                    <div
                      className={`p-1 rounded bg-gradient-to-r ${color}`}
                      title={share.platform}
                    >
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    {share.coinsEarned > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        +{share.coinsEarned} coins
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm mt-1">
                    Shared <span className="font-semibold">{share.trackTitle}</span> by{" "}
                    <span className="text-muted-foreground">{share.trackArtist}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(share.createdAt), { addSuffix: true })}
                    </span>
                    {share.wasAutoShared && (
                      <Badge variant="outline" className="text-xs">
                        Auto
                      </Badge>
                    )}
                  </div>
                  {share.postUrl && (
                    <a
                      href={share.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline mt-1 inline-block"
                    >
                      View post →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function TopSharedTracks() {
  const { data: topTracks, isLoading } = trpc.socialMedia.sharing.topSharedTracks.useQuery({
    days: 7,
    limit: 10,
  });

  if (isLoading || !topTracks || topTracks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trending Tracks
        </CardTitle>
        <CardDescription>Most shared tracks this week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topTracks.map((track, index) => (
            <div
              key={`${track.trackTitle}-${track.trackArtist}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
                    : index === 1
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                      : index === 2
                        ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
                        : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{track.trackTitle}</p>
                <p className="text-xs text-muted-foreground truncate">{track.trackArtist}</p>
              </div>
              <Badge variant="secondary">{track.shares} shares</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
