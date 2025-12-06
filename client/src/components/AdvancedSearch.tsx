import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Search, X, Filter, Music, Calendar, Mic2, 
  User, Clock, MapPin, Tag, SlidersHorizontal,
  ArrowRight, History, TrendingUp, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/usePersistFn";

// Search result types
interface SearchResult {
  id: string;
  type: "mix" | "event" | "podcast" | "show" | "blog" | "page";
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  url: string;
  tags?: string[];
  date?: string;
  meta?: Record<string, string>;
}

// Mock search data
const mockSearchIndex: SearchResult[] = [
  {
    id: "mix-1",
    type: "mix",
    title: "Garage Classics Vol. 1",
    subtitle: "UK Garage",
    description: "A journey through the best UK Garage classics from the 90s and 2000s",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150",
    url: "/mixes",
    tags: ["garage", "classic", "uk"],
    date: "2024-01-15",
    meta: { duration: "60 min", bpm: "130" },
  },
  {
    id: "mix-2",
    type: "mix",
    title: "Amapiano Vibes",
    subtitle: "Amapiano",
    description: "Fresh Amapiano tracks from South Africa",
    image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=150",
    url: "/mixes",
    tags: ["amapiano", "south africa", "afro"],
    date: "2024-01-10",
    meta: { duration: "55 min", bpm: "115" },
  },
  {
    id: "event-1",
    type: "event",
    title: "Ministry of Sound",
    subtitle: "Club Night",
    description: "Live performance at Ministry of Sound, London",
    url: "/events",
    tags: ["london", "club", "live"],
    date: "2024-02-20",
    meta: { venue: "London", time: "22:00" },
  },
  {
    id: "podcast-1",
    type: "podcast",
    title: "The Evolution of UK Garage",
    subtitle: "Episode 25",
    description: "Deep dive into the history and evolution of UK Garage",
    url: "/podcasts",
    tags: ["garage", "history", "interview"],
    date: "2024-01-08",
    meta: { duration: "1:24:35", guests: "MC Creed" },
  },
  {
    id: "show-1",
    type: "show",
    title: "Saturday Night Sessions",
    subtitle: "Weekly Show",
    description: "Live every Saturday from 8pm",
    url: "/show",
    tags: ["live", "weekly", "saturday"],
    meta: { time: "20:00 - 23:00", day: "Saturday" },
  },
  {
    id: "blog-1",
    type: "blog",
    title: "How to Get Started as a DJ",
    subtitle: "Tutorial",
    description: "Essential tips for beginner DJs",
    url: "/blog",
    tags: ["tutorial", "beginner", "tips"],
    date: "2024-01-05",
  },
  {
    id: "page-about",
    type: "page",
    title: "About DJ Danny Hectic B",
    description: "30+ years shaping UK Garage, House, Grime, and Amapiano",
    url: "/about",
    tags: ["bio", "history"],
  },
  {
    id: "page-book",
    type: "page",
    title: "Book DJ Danny",
    description: "Hire DJ Danny Hectic B for your next event",
    url: "/book-danny",
    tags: ["booking", "hire", "events"],
  },
];

const typeIcons: Record<string, React.ElementType> = {
  mix: Music,
  event: Calendar,
  podcast: Mic2,
  show: TrendingUp,
  blog: Tag,
  page: ArrowRight,
};

const typeLabels: Record<string, string> = {
  mix: "Mixes",
  event: "Events",
  podcast: "Podcasts",
  show: "Shows",
  blog: "Blog",
  page: "Pages",
};

// Fuzzy search function
function fuzzySearch(query: string, text: string): boolean {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Direct match
  if (textLower.includes(queryLower)) return true;
  
  // Fuzzy match (all query characters in order)
  let queryIndex = 0;
  for (const char of textLower) {
    if (char === queryLower[queryIndex]) {
      queryIndex++;
      if (queryIndex === queryLower.length) return true;
    }
  }
  
  return false;
}

// Search scoring
function scoreResult(result: SearchResult, query: string): number {
  const queryLower = query.toLowerCase();
  let score = 0;
  
  // Title match (highest weight)
  if (result.title.toLowerCase().includes(queryLower)) {
    score += 100;
    if (result.title.toLowerCase().startsWith(queryLower)) score += 50;
  }
  
  // Subtitle match
  if (result.subtitle?.toLowerCase().includes(queryLower)) score += 50;
  
  // Description match
  if (result.description?.toLowerCase().includes(queryLower)) score += 25;
  
  // Tag match
  if (result.tags?.some(tag => tag.toLowerCase().includes(queryLower))) score += 40;
  
  return score;
}

interface SearchFilters {
  types: string[];
  dateRange?: { start?: string; end?: string };
  tags?: string[];
}

export function AdvancedSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ types: [] });
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("recent_searches");
    return saved ? JSON.parse(saved) : [];
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);

  // Search results
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    
    let filtered = mockSearchIndex.filter(result => {
      // Apply type filter
      if (filters.types.length > 0 && !filters.types.includes(result.type)) {
        return false;
      }
      
      // Apply tag filter
      if (filters.tags?.length && !result.tags?.some(t => filters.tags?.includes(t))) {
        return false;
      }
      
      // Apply text search
      const searchText = [
        result.title,
        result.subtitle,
        result.description,
        ...(result.tags || []),
      ].join(" ");
      
      return fuzzySearch(debouncedQuery, searchText);
    });
    
    // Sort by relevance score
    filtered.sort((a, b) => scoreResult(b, debouncedQuery) - scoreResult(a, debouncedQuery));
    
    return filtered.slice(0, 10);
  }, [debouncedQuery, filters]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const result of results) {
      if (!groups[result.type]) groups[result.type] = [];
      groups[result.type].push(result);
    }
    return groups;
  }, [results]);

  // Handle search submission
  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  }, [recentSearches]);

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    handleSearch(query);
    setIsOpen(false);
    window.location.href = result.url;
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent_searches");
  };

  // Toggle type filter
  const toggleTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type],
    }));
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Popular searches
  const popularSearches = ["garage", "amapiano", "live show", "booking", "podcast"];

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent/10 transition-colors",
          className
        )}
      >
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Search dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mixes, events, podcasts..."
              className="flex-1 bg-transparent border-none outline-none text-lg"
              autoFocus
            />
            {query && (
              <Button variant="ghost" size="icon" onClick={() => setQuery("")}>
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-accent/20")}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-4 border-b border-border bg-muted/50">
              <div className="flex flex-wrap gap-2">
                {Object.entries(typeLabels).map(([type, label]) => (
                  <Button
                    key={type}
                    variant={filters.types.includes(type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTypeFilter(type)}
                    className="gap-2"
                  >
                    {React.createElement(typeIcons[type], { className: "w-4 h-4" })}
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {!query.trim() ? (
              <div className="p-4 space-y-6">
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Recent Searches
                      </h4>
                      <Button variant="ghost" size="sm" onClick={clearRecentSearches}>
                        Clear
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          onClick={() => setQuery(search)}
                        >
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular searches */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4" />
                    Popular Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search) => (
                      <Button
                        key={search}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery(search)}
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quick links */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4" />
                    Quick Links
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Latest Mixes", url: "/mixes", icon: Music },
                      { label: "Upcoming Events", url: "/events", icon: Calendar },
                      { label: "Book Now", url: "/book-danny", icon: ArrowRight },
                      { label: "Live Show", url: "/live", icon: TrendingUp },
                    ].map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <link.icon className="w-5 h-5 text-accent" />
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(groupedResults).map(([type, typeResults]) => (
                  <div key={type} className="mb-4">
                    <h4 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {typeLabels[type]}
                    </h4>
                    {typeResults.map((result) => {
                      const Icon = typeIcons[result.type];
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors text-left"
                        >
                          {result.image ? (
                            <img
                              src={result.image}
                              alt={result.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-accent/10 flex items-center justify-center">
                              <Icon className="w-6 h-6 text-accent" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{result.title}</p>
                            {result.subtitle && (
                              <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                            )}
                            {result.description && (
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {result.description}
                              </p>
                            )}
                            {result.tags && (
                              <div className="flex gap-1 mt-1">
                                {result.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-muted/50 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background rounded">↵</kbd>
                to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background rounded">↑↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background rounded">esc</kbd>
                to close
              </span>
            </div>
            {results.length > 0 && (
              <span>{results.length} results</span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Compact search bar for headers
export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search..."
        className="pl-9 pr-4"
      />
    </div>
  );
}

export default AdvancedSearch;
