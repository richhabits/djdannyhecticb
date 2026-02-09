/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

import { Button } from "@/components/ui/button";
import { Loader2, Music, ExternalLink, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { MetaTagsComponent } from "@/components/MetaTags";
import { trpc } from "@/lib/trpc";
import { trackBeatportClick, trackChartView, trackGenreView } from "@/lib/analytics";

export default function BeatportShop() {
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [, navigate] = useLocation();

  // Fetch genres for filter
  const { data: genresData, isLoading: genresLoading } = trpc.beatport.genres.useQuery({
    pageSize: 50,
  });

  // Fetch featured charts
  const { data: chartsData, isLoading: chartsLoading } = trpc.beatport.charts.useQuery({
    genreId: activeGenre || undefined,
    pageSize: 12,
  });

  // Fetch featured tracks
  const { data: tracksData, isLoading: tracksLoading } = trpc.beatport.tracks.useQuery({
    genreId: activeGenre || undefined,
    pageSize: 24,
  });

  const genres = genresData?.results || [];
  const charts = chartsData?.results || [];
  const tracks = tracksData?.results || [];

  const openBeatportTrack = (trackId: number) => {
    trackBeatportClick('track', trackId, 'shop-home');
    window.open(`https://www.beatport.com/track/-/${trackId}`, '_blank');
  };

  const openBeatportChart = (chartId: number) => {
    trackBeatportClick('chart', chartId, 'shop-home');
    window.open(`https://www.beatport.com/chart/-/${chartId}`, '_blank');
  };

  const handleGenreClick = (genreId: number | null, genreSlug: string) => {
    trackGenreView(genreSlug);
    setActiveGenre(genreId);
  };

  const navigateToGenre = (genreSlug: string) => {
    trackGenreView(genreSlug);
    navigate(`/shop/genres/${genreSlug}`);
  };

  const handleChartClick = (chartId: number) => {
    trackChartView(chartId);
    navigate(`/shop/charts/${chartId}`);
  };

  return (
    <>
      <MetaTagsComponent
        title="BEATPORT SHOP | HECTIC RADIO"
        description="Discover the latest tracks, charts, and releases on Beatport. Curated by Hectic Radio."
        url="/shop"
      />
      <div className="min-h-screen bg-background text-foreground font-mono pt-14">
        {/* Brutalist Header */}
        <section className="border-b border-foreground px-4 py-8 md:px-6 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-6xl md:text-9xl font-black uppercase leading-[0.8] tracking-tighter">
              Beatport<br />Shop
            </h1>
            <p className="mt-4 text-sm uppercase tracking-widest text-muted-foreground">
              Powered by Beatport API v4
            </p>
          </div>
          <div className="md:text-right space-y-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest mb-2 text-muted-foreground">Search</p>
              <Button
                onClick={() => navigate('/shop/search')}
                className="w-full md:w-auto rounded-none border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background uppercase font-bold h-12 px-6"
              >
                <SearchIcon className="mr-2 h-4 w-4" />
                Search Tracks
              </Button>
            </div>
          </div>
        </section>

        {/* Genre Filter Bar */}
        <section className="sticky top-14 z-40 bg-background border-b border-foreground">
          {genresLoading ? (
            <div className="px-6 py-4 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <div className="whitespace-nowrap overflow-x-auto flex divide-x divide-foreground">
              <button
                onClick={() => handleGenreClick(null, 'all')}
                className={cn(
                  "px-6 py-4 uppercase font-bold text-sm tracking-wider hover:bg-foreground hover:text-background transition-colors duration-0 flex-shrink-0",
                  activeGenre === null ? "bg-foreground text-background" : ""
                )}
              >
                All Genres
              </button>
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => navigateToGenre(genre.slug)}
                  className={cn(
                    "px-6 py-4 uppercase font-bold text-sm tracking-wider hover:bg-foreground hover:text-background transition-colors duration-0 flex-shrink-0",
                    activeGenre === genre.id ? "bg-foreground text-background" : ""
                  )}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Featured Charts Section */}
        <section className="border-b border-foreground p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-5xl font-black uppercase leading-tight">Featured Charts</h2>
            {chartsData && chartsData.count > charts.length && (
              <span className="text-sm text-muted-foreground uppercase">
                Showing {charts.length} of {chartsData.count}
              </span>
            )}
          </div>

          {chartsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : charts.length === 0 ? (
            <div className="text-center py-12 border border-foreground">
              <p className="text-xl font-bold uppercase mb-2">No Charts Available</p>
              <p className="text-sm text-muted-foreground">Try selecting a different genre</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[1px] bg-foreground">
              {charts.map((chart) => (
                <div
                  key={chart.id}
                  className="bg-background p-4 hover:bg-muted/20 transition-colors duration-0 group cursor-pointer border border-foreground"
                  onClick={() => handleChartClick(chart.id)}
                >
                  <div className="mb-3">
                    {chart.genre && (
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                        {chart.genre.name}
                      </p>
                    )}
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

        {/* Featured Tracks Grid */}
        <section className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-5xl font-black uppercase leading-tight">Latest Tracks</h2>
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
              <p className="text-xl font-bold uppercase mb-2">No Tracks Available</p>
              <p className="text-sm text-muted-foreground">Try selecting a different genre</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[1px] bg-foreground">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-background group relative flex flex-col h-full border border-foreground hover:bg-muted/20 transition-colors duration-0"
                >
                  {/* Track Image */}
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

                  {/* Track Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      {track.genre && (
                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                          {track.genre.name}
                        </p>
                      )}
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

        {/* Footer CTA */}
        <section className="p-4 md:p-12 border-t border-foreground">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black uppercase mb-4">Powered by Beatport</h2>
            <p className="font-mono text-sm mb-6 max-w-md text-muted-foreground">
              Discover the world's largest DJ store. All purchases support the artists directly.
            </p>
            <Button
              onClick={() => window.open('https://www.beatport.com', '_blank')}
              className="rounded-none border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground uppercase font-bold text-lg h-12 px-8"
            >
              Visit Beatport.com
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
