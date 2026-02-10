/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

import { Button } from "@/components/ui/button";
import { Loader2, Music, ExternalLink, Search as SearchIcon, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { MetaTagsComponent } from "@/components/MetaTags";
import { trpc } from "@/lib/trpc";
import { trackBeatportClick, trackSearch } from "@/lib/analytics";

type SearchType = "tracks" | "artists" | "releases" | "labels";

export default function BeatportSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("tracks");
  const [, navigate] = useLocation();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        trackSearch(searchQuery, { type: searchType });
      }
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search query
  const { data: searchData, isLoading } = trpc.beatport.search.useQuery(
    {
      q: debouncedQuery,
      type: searchType,
      pageSize: 50,
    },
    {
      enabled: debouncedQuery.length > 2, // Only search if query is 3+ characters
    }
  );

  const tracks = searchData?.tracks?.results || [];
  const artists = searchData?.artists?.results || [];
  const releases = searchData?.releases?.results || [];
  const labels = searchData?.labels?.results || [];

  const openBeatportTrack = (trackId: number) => {
    trackBeatportClick('track', trackId, 'search');
    window.open(`https://www.beatport.com/track/-/${trackId}`, '_blank');
  };

  const openBeatportArtist = (artistId: number) => {
    trackBeatportClick('artist', artistId, 'search');
    window.open(`https://www.beatport.com/artist/-/${artistId}`, '_blank');
  };

  const openBeatportRelease = (releaseId: number) => {
    trackBeatportClick('release', releaseId, 'search');
    window.open(`https://www.beatport.com/release/-/${releaseId}`, '_blank');
  };

  const openBeatportLabel = (labelId: number) => {
    trackBeatportClick('label', labelId, 'search');
    window.open(`https://www.beatport.com/label/-/${labelId}`, '_blank');
  };

  const getResults = () => {
    switch (searchType) {
      case "tracks":
        return tracks;
      case "artists":
        return artists;
      case "releases":
        return releases;
      case "labels":
        return labels;
      default:
        return [];
    }
  };

  const results = getResults();
  const hasSearched = debouncedQuery.length > 2;

  return (
    <>
      <MetaTagsComponent
        title="SEARCH BEATPORT | HECTIC RADIO"
        description="Search for tracks, artists, releases, and labels on Beatport."
        url="/shop/search"
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
          
          <h1 className="text-5xl md:text-8xl font-black uppercase leading-[0.8] tracking-tighter mb-8">
            Search<br />Beatport
          </h1>

          {/* Search Input */}
          <div className="max-w-2xl">
            <div className="flex gap-0 border-2 border-foreground">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH TRACKS, ARTISTS, RELEASES..."
                  className="bg-transparent border-none focus:ring-0 w-full pl-12 pr-4 py-4 font-mono uppercase placeholder:text-muted-foreground text-lg"
                  autoFocus
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-6 bg-muted hover:bg-muted/70 text-foreground font-bold uppercase text-sm transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">
              {searchQuery.length < 3 && "Type at least 3 characters to search"}
              {searchQuery.length >= 3 && isLoading && "Searching..."}
              {searchQuery.length >= 3 && !isLoading && hasSearched && `Found ${results.length} results`}
            </p>
          </div>
        </section>

        {/* Search Type Filter */}
        <section className="sticky top-14 z-40 bg-background border-b border-foreground whitespace-nowrap overflow-x-auto flex divide-x divide-foreground">
          {(["tracks", "artists", "releases", "labels"] as SearchType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={cn(
                "px-6 py-4 uppercase font-bold text-sm tracking-wider hover:bg-foreground hover:text-background transition-colors duration-0 flex-shrink-0",
                searchType === type ? "bg-foreground text-background" : ""
              )}
            >
              {type}
            </button>
          ))}
        </section>

        {/* Results */}
        <section className="p-4 md:p-6">
          {!hasSearched ? (
            <div className="text-center py-24">
              <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-bold uppercase mb-2">Start Searching</p>
              <p className="text-sm text-muted-foreground">
                Enter a search term above to find tracks, artists, releases, or labels
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-24 border border-foreground">
              <p className="text-xl font-bold uppercase mb-2">No Results Found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search term or filters
              </p>
            </div>
          ) : (
            <>
              {/* Tracks Results */}
              {searchType === "tracks" && (
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

              {/* Artists Results */}
              {searchType === "artists" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {artists.map((artist) => (
                    <div
                      key={artist.id}
                      className="border border-foreground p-6 hover:bg-muted/20 transition-colors"
                    >
                      <h3 className="text-2xl font-black uppercase mb-4">{artist.name}</h3>
                      <Button
                        onClick={() => openBeatportArtist(artist.id)}
                        className="w-full rounded-none border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background uppercase font-bold text-sm h-10"
                      >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        View on Beatport
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Releases Results */}
              {searchType === "releases" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {releases.map((release) => (
                    <div
                      key={release.id}
                      className="border border-foreground p-6 hover:bg-muted/20 transition-colors"
                    >
                      <h3 className="text-xl font-black uppercase mb-2 line-clamp-2">{release.name}</h3>
                      {release.catalog_number && (
                        <p className="text-sm text-muted-foreground mb-4">CAT: {release.catalog_number}</p>
                      )}
                      <Button
                        onClick={() => openBeatportRelease(release.id)}
                        className="w-full rounded-none border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background uppercase font-bold text-sm h-10"
                      >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        View on Beatport
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Labels Results */}
              {searchType === "labels" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {labels.map((label) => (
                    <div
                      key={label.id}
                      className="border border-foreground p-6 hover:bg-muted/20 transition-colors"
                    >
                      <h3 className="text-2xl font-black uppercase mb-4">{label.name}</h3>
                      <Button
                        onClick={() => openBeatportLabel(label.id)}
                        className="w-full rounded-none border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background uppercase font-bold text-sm h-10"
                      >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        View on Beatport
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
