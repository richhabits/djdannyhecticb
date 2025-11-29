import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, MapPin, Music } from "lucide-react";
import { useMemo } from "react";

function getListenerTag(
  shoutName: string,
  allShouts: Array<{ name: string }> | undefined
): "First Time" | "Regular" | "Day One" {
  if (!allShouts) return "First Time";
  const count = allShouts.filter(
    (s: { name: string }) => s.name.toLowerCase() === shoutName.toLowerCase()
  ).length;
  if (count >= 5) return "Day One";
  if (count > 1) return "Regular";
  return "First Time";
}

export function ShoutList() {
  const { data: shouts, isLoading, error } = trpc.shouts.list.useQuery(
    { limit: 100 }, // Get more to calculate repeat listeners
    { retry: false }
  );
  
  const displayedShouts = useMemo(() => {
    return shouts?.slice(0, 20) || []; // Show latest 20
  }, [shouts]);

  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-2xl font-bold gradient-text">
            Latest Shouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading shouts...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("[ShoutList] Error loading shouts:", error);
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-2xl font-bold gradient-text">
            Latest Shouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Database not configured. Shouts will appear here once the database is set up.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!shouts || shouts.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-2xl font-bold gradient-text">
            Latest Shouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No shouts yet. Be the first to send a shout!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-2xl font-bold gradient-text">
          Latest Shouts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedShouts.map((shout) => {
            const tag = getListenerTag(shout.name, shouts);
            return (
              <div
                key={shout.id}
                className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <MessageSquare className="w-4 h-4 text-accent" />
                      <span className="font-semibold">{shout.name}</span>
                      <Badge
                        variant={
                          tag === "Day One"
                            ? "default"
                            : tag === "Regular"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                      {shout.location && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {shout.location}
                          </div>
                        </>
                      )}
                    </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(shout.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <p className="text-foreground mb-2 whitespace-pre-wrap">
                {shout.message}
              </p>
              {shout.trackRequest && (
                <div className="flex items-center gap-2 text-sm text-accent mt-2 pt-2 border-t border-border">
                  <Music className="w-4 h-4" />
                  <span>
                    <strong>Track Request:</strong> {shout.trackRequest}
                  </span>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

