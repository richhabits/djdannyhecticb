import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Music, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EnhancedSocialShare } from "./EnhancedSocialShare";

export function NowPlaying() {
  const { data: nowPlaying, isLoading } = trpc.tracks.nowPlaying.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  const { data: history } = trpc.tracks.history.useQuery({ limit: 5 }, {
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <Card className="glass">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Track */}
      <Card className="glass">
        <CardContent className="py-4 space-y-3">
          {nowPlaying ? (
            <>
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {nowPlaying.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {nowPlaying.artist}
                  </p>
                  {nowPlaying.note && (
                    <p className="text-xs text-muted-foreground mt-1">{nowPlaying.note}</p>
                  )}
                </div>
              </div>
              <EnhancedSocialShare
                trackTitle={nowPlaying.title}
                trackArtist={nowPlaying.artist}
                trackId={nowPlaying.id}
                shareType="nowPlaying"
                variant="compact"
              />
            </>
          ) : (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Music className="w-5 h-5 shrink-0" />
              <p className="text-sm">Live mix in progress</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Track History */}
      {history && history.length > 0 && (
        <Card className="glass">
          <CardContent className="py-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Tracks
            </h4>
            <div className="space-y-2">
              {history.map((track) => (
                <div key={track.id} className="text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(track.playedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

