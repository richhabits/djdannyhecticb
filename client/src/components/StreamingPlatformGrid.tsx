import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { STREAMING_PLATFORM_META, StreamingPlatformSlug } from "@shared/streamingPlatforms";
import { Loader2, Music, Apple, Cloud, PlayCircle, Waves, Radio, ExternalLink } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";

type StreamingLink = inferRouterOutputs<AppRouter>["streaming"]["links"][number];

const platformIcons: Record<StreamingPlatformSlug, typeof Music> = {
  spotify: Music,
  "apple-music": Apple,
  soundcloud: Cloud,
  youtube: PlayCircle,
  mixcloud: Radio,
  tidal: Waves,
};

function PlatformIcon({ platform }: { platform: StreamingPlatformSlug }) {
  const Icon = platformIcons[platform] ?? Music;
  return <Icon className="w-5 h-5" />;
}

function PlatformCard({ link }: { link: StreamingLink }) {
  const slug = link.platform as StreamingPlatformSlug;
  const meta = STREAMING_PLATFORM_META[slug];

  return (
    <Card className="relative overflow-hidden border border-border/40 glass">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className="rounded-full p-3"
            style={{
              backgroundColor: meta?.accentColor ?? "rgba(255,255,255,0.08)",
            }}
          >
            <PlatformIcon platform={slug} />
          </div>
          <div>
            <CardTitle className="text-xl">{link.displayName || meta?.label || link.platform}</CardTitle>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {meta?.label || "Streaming Platform"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {link.description || meta?.description || "Music platform integration"}
        </p>
        {link.embedUrl && (
          <div className="rounded-lg overflow-hidden border border-border/60 bg-card/40">
            <iframe
              title={link.displayName || link.platform}
              src={link.embedUrl}
              className="w-full h-48"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        )}
        <Button asChild variant="outline" className="w-full">
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            Open Platform
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export function StreamingPlatformGrid({
  variant = "cards",
  limit,
}: {
  variant?: "cards" | "buttons";
  limit?: number;
}) {
  const { data, isLoading } = trpc.streaming.links.useQuery(undefined, {
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading music platforms...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  const platforms = limit ? data.slice(0, limit) : data;

  if (variant === "buttons") {
    return (
      <div className="flex flex-wrap gap-3">
        {platforms.map((link) => {
          const slug = link.platform as StreamingPlatformSlug;
          const meta = STREAMING_PLATFORM_META[slug];
          return (
            <Button key={link.id ?? `${link.platform}-${link.url}`} variant="outline" size="sm" asChild>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <div
                  className="rounded-full p-1.5"
                  style={{ backgroundColor: meta?.accentColor ?? "transparent" }}
                >
                  <PlatformIcon platform={slug} />
                </div>
                {link.displayName || meta?.label || link.platform}
              </a>
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {platforms.map((link) => (
        <PlatformCard key={link.id ?? `${link.platform}-${link.url}`} link={link} />
      ))}
    </div>
  );
}
