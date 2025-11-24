import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Search, X, Music, Calendar, Podcast, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { format } from "date-fns";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onResultClick?: () => void;
}

export function SearchBar({ className, placeholder = "Search mixes, events, podcasts...", onResultClick }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: results, isLoading } = trpc.search.content.useQuery(
    { query, limit: 10 },
    { enabled: query.length >= 2 }
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    setIsOpen(value.length >= 2);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
  };

  const totalResults = (results?.mixes.length || 0) + (results?.events.length || 0) + (results?.podcasts.length || 0);

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-2xl", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : totalResults === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-2">
              {/* Mixes Results */}
              {results?.mixes && results.mixes.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-muted-foreground">
                    <Music className="w-4 h-4" />
                    Mixes ({results.mixes.length})
                  </div>
                  {results.mixes.map((mix) => (
                    <Link
                      key={mix.id}
                      href="/mixes"
                      onClick={() => {
                        setIsOpen(false);
                        onResultClick?.();
                      }}
                    >
                      <div className="px-3 py-2 rounded-lg hover:bg-accent cursor-pointer transition-colors">
                        <div className="font-medium">{mix.title}</div>
                        {mix.genre && (
                          <div className="text-xs text-muted-foreground">{mix.genre}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Events Results */}
              {results?.events && results.events.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Events ({results.events.length})
                  </div>
                  {results.events.map((event) => (
                    <Link
                      key={event.id}
                      href="/events"
                      onClick={() => {
                        setIsOpen(false);
                        onResultClick?.();
                      }}
                    >
                      <div className="px-3 py-2 rounded-lg hover:bg-accent cursor-pointer transition-colors">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(event.eventDate), 'MMM d, yyyy')} • {event.location}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Podcasts Results */}
              {results?.podcasts && results.podcasts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-muted-foreground">
                    <Podcast className="w-4 h-4" />
                    Podcasts ({results.podcasts.length})
                  </div>
                  {results.podcasts.map((podcast) => (
                    <Link
                      key={podcast.id}
                      href="/podcasts"
                      onClick={() => {
                        setIsOpen(false);
                        onResultClick?.();
                      }}
                    >
                      <div className="px-3 py-2 rounded-lg hover:bg-accent cursor-pointer transition-colors">
                        <div className="font-medium">{podcast.title}</div>
                        {podcast.episodeNumber && (
                          <div className="text-xs text-muted-foreground">Episode {podcast.episodeNumber}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* View All Results */}
              {totalResults > 10 && (
                <div className="pt-2 border-t border-border">
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    onClick={() => {
                      setIsOpen(false);
                      onResultClick?.();
                    }}
                  >
                    <div className="px-3 py-2 text-center text-sm font-medium text-purple-500 hover:text-purple-600 cursor-pointer">
                      View all {totalResults} results
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
