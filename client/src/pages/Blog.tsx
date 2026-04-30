import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";

const POSTS_PER_PAGE = 6;

export function Blog() {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["blog:list", currentPage],
    queryFn: () =>
      trpc.blog.list.query({
        limit: POSTS_PER_PAGE,
        offset: currentPage * POSTS_PER_PAGE,
      }),
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["blog:search", searchQuery],
    queryFn: () => trpc.blog.search.query({ query: searchQuery }),
    enabled: searchQuery.length > 0,
  });

  const posts = searchQuery ? searchResults || [] : postsData?.posts || [];
  const total = postsData?.total || 0;
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    postsData?.posts.forEach(post => {
      post.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [postsData?.posts]);

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags?.includes(selectedTag))
    : posts;

  const isLoading = postsLoading || searchLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Blog</h1>
          <p className="text-lg text-slate-300">
            Latest insights, stories, and updates from DJ Danny Hectic B
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            className="pl-10 py-2 w-full bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
        </div>

        {allTags.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Filter by tag:</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(null)}
                className={selectedTag === null ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                All Tags
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                  className={selectedTag === tag ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-700 rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && filteredPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <a className="group">
                  <Card className="h-full bg-slate-700 border-slate-600 hover:border-purple-500 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-purple-500/20">
                    {post.featuredImageUrl && (
                      <div className="relative h-40 bg-slate-600 overflow-hidden rounded-t-lg">
                        <img
                          src={post.featuredImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {post.title}
                      </CardTitle>
                      {post.author && (
                        <CardDescription className="text-slate-300">
                          by {post.author}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {post.excerpt && (
                        <p className="text-slate-300 text-sm line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 2).map(tag => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs border-purple-500 text-purple-300"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 2 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-slate-500 text-slate-300"
                            >
                              +{post.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      {post.publishedAt && (
                        <p className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(post.publishedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-300 text-lg">
              {searchQuery
                ? "No posts found matching your search"
                : selectedTag
                  ? `No posts found with tag "${selectedTag}"`
                  : "No blog posts available yet"}
            </p>
          </div>
        )}

        {!searchQuery && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              Previous
            </Button>
            <div className="text-slate-300">
              Page {currentPage + 1} of {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
