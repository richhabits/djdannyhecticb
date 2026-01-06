/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState, useEffect } from "react";
import { useLocation as useWouterLocation } from "wouter";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { trpc } from "@/lib/trpc";
import { Music, Calendar, Mic2, Disc, Radio, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, navigate] = useWouterLocation();

  const { data: results, isLoading } = trpc.search.all.useQuery(
    { query, limit: 10 },
    { enabled: query.length > 0 && open }
  );

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (url: string) => {
    navigate(url);
    setOpen(false);
    setQuery("");
  };

  const totalResults =
    (results?.mixes?.length || 0) +
    (results?.events?.length || 0) +
    (results?.podcasts?.length || 0) +
    (results?.tracks?.length || 0) +
    (results?.shows?.length || 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground",
          "border border-border rounded-md hover:bg-accent/10 transition-colors"
        )}
        title="Search (⌘K)"
      >
        <Search className="w-4 h-4" />
        <span className="hidden lg:inline">Search...</span>
        <kbd className="hidden lg:inline pointer-events-none ml-auto select-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-50">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Search mixes, events, podcasts, tracks, and shows">
        <CommandInput
          placeholder="Search everything..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.length === 0 && (
            <CommandGroup heading="Quick Links">
              <CommandItem onSelect={() => handleSelect("/mixes")}>
                <Disc className="mr-2 h-4 w-4" />
                <span>Browse Mixes</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect("/podcasts")}>
                <Mic2 className="mr-2 h-4 w-4" />
                <span>Latest Podcasts</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect("/events")}>
                <Calendar className="mr-2 h-4 w-4" />
                <span>Upcoming Events</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect("/shop")}>
                <span className="mr-2 h-4 w-4 flex items-center justify-center font-bold text-xs">$</span>
                <span>Merch Shop</span>
              </CommandItem>
            </CommandGroup>
          )}

          {isLoading && query.length > 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>
          ) : query.length > 0 && totalResults === 0 ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : (
            <>
              {results?.mixes && results.mixes.length > 0 && (
                <CommandGroup heading="Mixes">
                  {results.mixes.map((mix) => (
                    <CommandItem
                      key={mix.id}
                      onSelect={() => handleSelect(`/mixes`)}
                      className="flex items-center gap-2"
                    >
                      <Music className="w-4 h-4" />
                      <div className="flex-1">
                        <div className="font-medium">{mix.title}</div>
                        {mix.genre && (
                          <div className="text-xs text-muted-foreground">{mix.genre}</div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results?.events && results.events.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Events">
                    {results.events.map((event) => (
                      <CommandItem
                        key={event.id}
                        onSelect={() => handleSelect(`/events`)}
                        className="flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium">{event.title}</div>
                          <div className="text-xs text-muted-foreground">{event.location}</div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {results?.podcasts && results.podcasts.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Podcasts">
                    {results.podcasts.map((podcast) => (
                      <CommandItem
                        key={podcast.id}
                        onSelect={() => handleSelect(`/podcasts`)}
                        className="flex items-center gap-2"
                      >
                        <Mic2 className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium">{podcast.title}</div>
                          {podcast.episodeNumber && (
                            <div className="text-xs text-muted-foreground">Episode {podcast.episodeNumber}</div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {results?.tracks && results.tracks.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Tracks">
                    {results.tracks.map((track) => (
                      <CommandItem
                        key={track.id}
                        onSelect={() => handleSelect(`/live`)}
                        className="flex items-center gap-2"
                      >
                        <Disc className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium">{track.title}</div>
                          <div className="text-xs text-muted-foreground">{track.artist}</div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {results?.shows && results.shows.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Shows">
                    {results.shows.map((show) => (
                      <CommandItem
                        key={show.id}
                        onSelect={() => handleSelect(`/live`)}
                        className="flex items-center gap-2"
                      >
                        <Radio className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium">{show.name}</div>
                          {show.host && (
                            <div className="text-xs text-muted-foreground">Host: {show.host}</div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

