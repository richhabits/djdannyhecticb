import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data: results, isLoading } = trpc.search.query.useQuery(
    { q: query },
    { enabled: query.length > 2 && isOpen }
  );

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="search"
          placeholder="Search mixes, events, podcasts..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isOpen && query.length > 2 && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : results && results.length > 0 ? (
            <div className="p-2">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/${result.entityType}/${result.entityId}`}
                  className="block p-3 hover:bg-accent rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="font-medium">{result.title}</div>
                  {result.content && (
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {result.content}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1 capitalize">
                    {result.entityType}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No results found
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
