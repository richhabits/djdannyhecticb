/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

import { Button } from "@/components/ui/button";
import { Loader2, Music, ExternalLink, ArrowLeft, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { MetaTagsComponent } from "@/components/MetaTags";
import { trpc } from "@/lib/trpc";
import { trackBeatportClick, trackChartView } from "@/lib/analytics";

export default function BeatportChart() {
  const [, params] = useRoute("/shop/charts/:id");
  const [, navigate] = useLocation();
  
  const chartId = params?.id ? parseInt(params.id) : 0;

  // Track chart view
  useEffect(() => {
    if (chartId > 0) {
      trackChartView(chartId);
    }
  }, [chartId]);

  // Fetch chart tracks
  const { data: tracksData, isLoading } = trpc.beatport.chartTracks.useQuery(
    {
      chartId,
      pageSize: 100,
    },
    {
      enabled: chartId > 0,
    }
  );

  const tracks = tracksData?.results || [];

  const openBeatportTrack = (trackId: number) => {
    trackBeatportClick('track', trackId, `chart-${chartId}`);
    window.open(`https://www.beatport.com/track/-/${trackId}`, '_blank');
  };

  const openBeatportChart = () => {
    trackBeatportClick('chart', chartId, 'chart-detail');
    window.open(`https://www.beatport.com/chart/-/${chartId}`, '_blank');
  };

  if (!chartId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold uppercase mb-4">Invalid Chart ID</p>
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const chartName = tracks.length > 0 && tracks[0].genre 
    ? `${tracks[0].genre.name} Top 100`
    : `Chart #${chartId}`;

  return (
    <>
      <MetaTagsComponent
        title={`${chartName} | BEATPORT CHART`}
        description={`Explore the top tracks in ${chartName} on Beatport.`}
        url={`/shop/chart/${chartId}`}
      />
      <div className="min-h-screen bg-background text-foreground font-mono pt-14">
        {/* Header */}
        <section className="border-b border-foreground px-4 py-8 md:px-6">
          <Button
            onClick={() => navigate('/shop')}
            variant="ghost"
            className="mb-4 -ml-4 uppercase font-bold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8" />
                <span className="text-sm uppercase tracking-widest text-muted-foreground">
                  Beatport Chart
                </span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black uppercase leading-[0.8] tracking-tighter">
                {chartName}
              </h1>
            </div>
            <div className="md:text-right">
              <Button
                onClick={openBeatportChart}
                className="rounded-none border-2 border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground uppercase font-bold text-lg h-14 px-8"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                View Full Chart
              </Button>
            </div>
          </div>

          {tracksData && (
            <p className="mt-6 text-sm uppercase tracking-wide text-muted-foreground">
              Showing {tracks.length} of {tracksData.count} tracks
            </p>
          )}
        </section>

        {/* Track List */}
        <section className="p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-24 border border-foreground">
              <p className="text-xl font-bold uppercase mb-2">No Tracks Found</p>
              <p className="text-sm text-muted-foreground">
                This chart may not be available at the moment
              </p>
            </div>
          ) : (
            <div className="space-y-[1px] bg-foreground">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="bg-background hover:bg-muted/20 transition-colors duration-0 group"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Position */}
                    <div className="flex-shrink-0 w-12 text-center">
                      <span className="text-2xl font-black text-muted-foreground group-hover:text-foreground transition-colors">
                        {index + 1}
                      </span>
                    </div>

                    {/* Artwork */}
                    <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 relative overflow-hidden border border-foreground">
                      {track.image_url ? (
                        <img
                          src={track.image_url}
                          alt={track.title}
                          className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-110 transition-transform duration-0 group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Music className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-black uppercase leading-tight truncate group-hover:text-accent transition-colors">
                        {track.title}
                      </h3>
                      {track.artists && track.artists.length > 0 && (
                        <p className="text-sm md:text-base text-muted-foreground truncate">
                          {track.artists.map((a) => a.name).join(", ")}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground uppercase">
                        {track.label && <span>{track.label.name}</span>}
                        {track.bpm && <span>{track.bpm} BPM</span>}
                        {track.key && <span>{track.key.short_name}</span>}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => openBeatportTrack(track.id)}
                        className="rounded-none border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background uppercase font-bold text-xs md:text-sm h-10 px-4 md:px-6"
                      >
                        <ExternalLink className="md:mr-2 h-3 w-3" />
                        <span className="hidden md:inline">Open</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer CTA */}
        {tracks.length > 0 && (
          <section className="p-4 md:p-12 border-t border-foreground">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black uppercase mb-4">
                View Full Chart on Beatport
              </h2>
              <p className="font-mono text-sm mb-6 text-muted-foreground">
                Purchase tracks, create playlists, and discover more on Beatport
              </p>
              <Button
                onClick={openBeatportChart}
                className="rounded-none border-2 border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground uppercase font-bold text-lg h-14 px-8"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Open Chart on Beatport
              </Button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
