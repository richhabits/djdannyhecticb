/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

import { Button } from "@/components/ui/button";
import { Loader2, Music, ExternalLink, ArrowLeft, Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocation, useRoute } from "wouter";
import { MetaTagsComponent } from "@/components/MetaTags";
import { trpc } from "@/lib/trpc";
import { trackBeatportClick } from "@/lib/analytics";

export default function BeatportGenre() {
  const [, params] = useRoute("/shop/genres/:slug");
  const [, navigate] = useLocation();
  const [bpmRange, setBpmRange] = useState<{ low?: number; high?: number }>({});
  
  const genreSlug = params?.slug || "";

  // Fetch genres to find the ID from slug
  const { data: genresData } = trpc.beatport.genres.useQuery({
    pageSize: 100,
  });

  const genre = genresData?.results.find((g) => g.slug === genreSlug);
  const genreId = genre?.id;

  // Fetch sub-genres for this genre
  const { data: subGenresData } = trpc.beatport.subGenres.useQuery(
    {
      genreId: genreId,
      pageSize: 50,
    },
    {
      enabled: !!genreId,
    }
  );

  // Fetch charts for this genre
  const { data: chartsData, isLoading: chartsLoading } = trpc.beatport.charts.useQuery(
    {
      genreId: genreId,
      pageSize: 12,
    },
    {
      enabled: !!genreId,
    }
  );

  // Fetch tracks for this genre with filters
  const { data: tracksData, isLoading: tracksLoading } = trpc.beatport.tracks.useQuery(
    {
      genreId: genreId,
      bpmLow: bpmRange.low,
      bpmHigh: bpmRange.high,
      pageSize: 24,
    },
    {
      enabled: !!genreId,
    }
  );

  const subGenres = subGenresData?.results || [];
  const charts = chartsData?.results || [];
  const tracks = tracksData?.results || [];

  const openBeatportTrack = (trackId: number) => {
    trackBeatportClick('track', trackId, genreSlug);
    window.open(`https://www.beatport.com/track/-/${trackId}`, '_blank');
  };

  const openBeatportChart = (chartId: number) => {
    trackBeatportClick('chart', chartId, genreSlug);
    window.open(`https://www.beatport.com/chart/-/${chartId}`, '_blank');
  };

  if (!genreSlug) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center pt-14">
        <div className="text-center">
          <p className="text-xl font-bold uppercase mb-4">Invalid Genre</p>
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  if (!genre && genresData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center pt-14">
        <div className="text-center">
          <p className="text-xl font-bold uppercase mb-4">Genre Not Found</p>
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <MetaTagsComponent
        title={`${genre?.name || genreSlug} | BEATPORT GENRES`}
        description={`Explore ${genre?.name || genreSlug} charts, tracks, and releases on Beatport.`}
        url={`/shop/genres/${genreSlug}`}
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
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Genre</p>
              <h1 className="text-5xl md:text-9xl font-black uppercase leading-[0.8] tracking-tighter">
                {genre?.name || genreSlug}
              </h1>
            </div>
          </div>
        </section>

        {/* Sub-Genres Filter */}
        {subGenres.length > 0 && (
          <section className="border-b border-foreground px-4 py-4 md:px-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Sub-Genres</p>
            <div className="flex flex-wrap gap-2">
              {subGenres.map((subGenre) => (
                <button
                  key={subGenre.id}
                  className="px-4 py-2 border border-foreground text-sm uppercase font-bold hover:bg-foreground hover:text-background transition-colors"
                >
                  {subGenre.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* BPM Filter */}
        <section className="border-b border-foreground px-4 py-4 md:px-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm uppercase font-bold">Filter BPM:</span>
            </div>
            <input
              type="number"
              placeholder="Min"
              value={bpmRange.low || ""}
              onChange={(e) => setBpmRange({ ...bpmRange, low: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-20 px-3 py-2 border border-foreground bg-transparent text-sm font-mono"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="number"
              placeholder="Max"
              value={bpmRange.high || ""}
              onChange={(e) => setBpmRange({ ...bpmRange, high: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-20 px-3 py-2 border border-foreground bg-transparent text-sm font-mono"
            />
            {(bpmRange.low || bpmRange.high) && (
              <button
                onClick={() => setBpmRange({})}
                className="text-sm uppercase font-bold text-accent hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* Charts Section */}
        <section className="border-b border-foreground p-4 md:p-6">
          <h2 className="text-3xl md:text-5xl font-black uppercase leading-tight mb-6">Top Charts</h2>

          {chartsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : charts.length === 0 ? (
            <div className="text-center py-12 border border-foreground">
              <p className="text-lg font-bold uppercase mb-2">No Charts Available</p>
              <p className="text-sm text-muted-foreground">Check back later for updates</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[1px] bg-foreground">
              {charts.map((chart) => (
                <div
                  key={chart.id}
                  className="bg-background p-4 hover:bg-muted/20 transition-colors duration-0 group cursor-pointer border border-foreground"
                  onClick={() => navigate(`/shop/charts/${chart.id}`)}
                >
                  <div className="mb-3">
                    <h3 className="text-xl font-black uppercase leading-tight line-clamp-2 group-hover:text-accent transition-colors">
                      {chart.name}
                    </h3>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBeatportChart(chart.id);
                    }}
                    className="w-full rounded-none border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background uppercase font-bold text-sm h-10"
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    Open on Beatport
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Latest Tracks */}
        <section className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-5xl font-black uppercase leading-tight">Latest Releases</h2>
            {tracksData && tracksData.count > tracks.length && (
              <span className="text-sm text-muted-foreground uppercase">
                Showing {tracks.length} of {tracksData.count}
              </span>
            )}
          </div>

          {tracksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-12 border border-foreground">
              <p className="text-lg font-bold uppercase mb-2">No Tracks Available</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[1px] bg-foreground">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-background group relative flex flex-col h-full border border-foreground hover:bg-muted/20 transition-colors duration-0"
                >
                  <div className="aspect-square relative overflow-hidden border-b border-foreground">
                    {track.image_url ? (
                      <img
                        src={track.image_url}
                        alt={track.title}
                        className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-0 group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Music className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black uppercase leading-tight mb-1 line-clamp-2">
                        {track.title}
                      </h3>
                      {track.artists && track.artists.length > 0 && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {track.artists.map((a) => a.name).join(", ")}
                        </p>
                      )}
                      {track.bpm && (
                        <p className="text-xs text-muted-foreground mt-1">{track.bpm} BPM</p>
                      )}
                    </div>

                    <Button
                      onClick={() => openBeatportTrack(track.id)}
                      className="w-full rounded-none border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background uppercase font-bold text-sm h-10"
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Open on Beatport
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
