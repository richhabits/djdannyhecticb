import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sparkles, Play, Heart, TrendingUp, Music, Brain } from 'lucide-react';
import { useState } from 'react';

interface RecommendedMixesProps {
  variant?: 'for-you' | 'similar' | 'trending' | 'discover-weekly';
  mixId?: number; // Required for 'similar' variant
  limit?: number;
}

export function RecommendedMixes({ variant = 'for-you', mixId, limit = 10 }: RecommendedMixesProps) {
  const [playingMix, setPlayingMix] = useState<number | null>(null);

  // Different queries based on variant
  const forYou = trpc.recommendations.forYou.useQuery(
    { limit },
    { enabled: variant === 'for-you' }
  );

  const similar = trpc.recommendations.similar.useQuery(
    { mixId: mixId!, limit },
    { enabled: variant === 'similar' && !!mixId }
  );

  const trending = trpc.recommendations.trending.useQuery(
    { limit },
    { enabled: variant === 'trending' }
  );

  const discoverWeekly = trpc.recommendations.discoverWeekly.useQuery(
    undefined,
    { enabled: variant === 'discover-weekly' }
  );

  // Select the right query based on variant
  const query = variant === 'for-you' ? forYou :
                 variant === 'similar' ? similar :
                 variant === 'trending' ? trending :
                 discoverWeekly;

  if (query.isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!query.data || query.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {getTitle(variant)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No recommendations yet. Keep listening to get personalized suggestions!
          </p>
        </CardContent>
      </Card>
    );
  }

  const recommendations = query.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon(variant)}
          {getTitle(variant)}
        </CardTitle>
        <CardDescription>{getDescription(variant)}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex gap-4 pb-4">
            {recommendations.map((rec: any) => (
              <MixCard
                key={rec.mixId || rec.mix?.id}
                mix={rec.mix}
                reason={rec.reason}
                score={rec.score}
                isPlaying={playingMix === (rec.mixId || rec.mix?.id)}
                onPlay={() => setPlayingMix(rec.mixId || rec.mix?.id)}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function MixCard({ mix, reason, score, isPlaying, onPlay }: any) {
  if (!mix) return null;

  return (
    <div className="group relative w-[280px] flex-shrink-0 space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
        {mix.coverImage ? (
          <img
            src={mix.coverImage}
            alt={mix.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <Music className="h-16 w-16 text-primary/40" />
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="lg"
            onClick={onPlay}
            className="rounded-full h-14 w-14"
          >
            <Play className="h-6 w-6" fill="currentColor" />
          </Button>
        </div>

        {/* Score badge */}
        {score && (
          <Badge className="absolute top-2 right-2" variant="secondary">
            {Math.round(score * 100)}% match
          </Badge>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold line-clamp-1">{mix.title}</h3>
        {mix.artist?.name && (
          <p className="text-sm text-muted-foreground line-clamp-1">{mix.artist.name}</p>
        )}
        {reason && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span className="line-clamp-1">{reason}</span>
          </div>
        )}
        {mix.genre?.name && (
          <Badge variant="outline" className="text-xs">{mix.genre.name}</Badge>
        )}
      </div>
    </div>
  );
}

function getTitle(variant: string): string {
  switch (variant) {
    case 'for-you': return 'Made For You';
    case 'similar': return 'Similar Mixes';
    case 'trending': return 'Trending Now';
    case 'discover-weekly': return 'Discover Weekly';
    default: return 'Recommended';
  }
}

function getDescription(variant: string): string {
  switch (variant) {
    case 'for-you': return 'Personalized picks based on your taste';
    case 'similar': return 'More like this';
    case 'trending': return 'What everyone\'s listening to';
    case 'discover-weekly': return 'Fresh finds curated just for you';
    default: return 'AI-powered recommendations';
  }
}

function getIcon(variant: string) {
  switch (variant) {
    case 'for-you': return <Brain className="h-5 w-5" />;
    case 'similar': return <Sparkles className="h-5 w-5" />;
    case 'trending': return <TrendingUp className="h-5 w-5" />;
    case 'discover-weekly': return <Heart className="h-5 w-5" />;
    default: return <Brain className="h-5 w-5" />;
  }
}

// Compact widget version for sidebar
export function RecommendationsWidget() {
  const { data, isLoading } = trpc.recommendations.forYou.useQuery({ limit: 5 });

  if (isLoading || !data || data.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Recommended For You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.slice(0, 3).map((rec: any) => (
          <div
            key={rec.mixId || rec.mix?.id}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/10 cursor-pointer transition-colors"
          >
            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <Music className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{rec.mix?.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{rec.reason}</p>
            </div>
          </div>
        ))}
        <Button variant="ghost" size="sm" className="w-full mt-2">
          See all recommendations
        </Button>
      </CardContent>
    </Card>
  );
}
