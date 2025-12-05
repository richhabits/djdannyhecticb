/**
 * Advanced Search Component
 * Provides comprehensive search across mixes, events, podcasts, and more
 */

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Music, Calendar, Headphones, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAnalytics } from "@/hooks/useAnalytics";

interface SearchResult {
  type: "mix" | "event" | "podcast" | "user";
  id: number;
  title: string;
  description?: string;
  url: string;
}

export function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { track } = useAnalytics();

  const { data: mixes } = trpc.mixes.list.useQuery(undefined, { enabled: query.length > 0 });
  const { data: events } = trpc.events.all.useQuery(undefined, { enabled: query.length > 0 });
  const { data: podcasts } = trpc.podcasts.list.useQuery(undefined, { enabled: query.length > 0 });

  const results = useMemo<SearchResult[]>(() => {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search mixes
    mixes?.forEach((mix) => {
      if (
        mix.title?.toLowerCase().includes(lowerQuery) ||
        mix.description?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: "mix",
          id: mix.id,
          title: mix.title || "Untitled Mix",
          description: mix.description,
          url: `/mixes/${mix.id}`,
        });
      }
    });

    // Search events
    events?.forEach((event) => {
      if (
        event.name?.toLowerCase().includes(lowerQuery) ||
        event.description?.toLowerCase().includes(lowerQuery) ||
        event.location?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: "event",
          id: event.id,
          title: event.name || "Untitled Event",
          description: event.description || event.location,
          url: `/events/${event.id}`,
        });
      }
    });

    // Search podcasts
    podcasts?.forEach((podcast) => {
      if (
        podcast.title?.toLowerCase().includes(lowerQuery) ||
        podcast.description?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: "podcast",
          id: podcast.id,
          title: podcast.title || "Untitled Podcast",
          description: podcast.description,
          url: `/podcasts/${podcast.id}`,
        });
      }
    });

    return searchResults.slice(0, 10);
  }, [query, mixes, events, podcasts]);

  const handleResultClick = (result: SearchResult) => {
    track("search_result_click", {
      query,
      resultType: result.type,
      resultId: result.id,
    });
    window.location.href = result.url;
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "mix":
        return <Music className="h-4 w-4" />;
      case "event":
        return <Calendar className="h-4 w-4" />;
      case "podcast":
        return <Headphones className="h-4 w-4" />;
      case "user":
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search mixes, events, podcasts..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (e.target.value.length > 0) {
              track("search_query", { query: e.target.value });
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10"
        />
      </div>

      {isOpen && query.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            {results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result) => (
                  <Button
                    key={`${result.type}-${result.id}`}
                    variant="ghost"
                    className="w-full justify-start gap-2 h-auto py-2"
                    onClick={() => handleResultClick(result)}
                  >
                    {getIcon(result.type)}
                    <div className="flex-1 text-left">
                      <div className="font-medium">{result.title}</div>
                      {result.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {result.description}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No results found for "{query}"
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
