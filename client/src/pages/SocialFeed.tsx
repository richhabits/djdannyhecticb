import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Instagram, Music, Video, ExternalLink, Heart, MessageCircle, Share2 } from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";
import { cn } from "@/lib/utils";

export default function SocialFeed() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const { data: posts = [], isLoading } = trpc.socialFeed.list.useQuery({
    platform: selectedPlatform === "All" ? undefined : selectedPlatform as any,
    limit: 50,
  });

  const platforms = ["All", "Instagram", "TikTok", "YouTube", "Twitter", "Facebook"];

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="w-5 h-5" />;
      case "tiktok":
        return <Video className="w-5 h-5" />;
      case "youtube":
        return <Video className="w-5 h-5" />;
      default:
        return <Music className="w-5 h-5" />;
    }
  };

  return (
    <>
      <MetaTagsComponent
        title="Social Feed | DJ Danny Hectic B"
        description="Latest posts from DJ Danny Hectic B across Instagram, TikTok, YouTube, and more."
        url="/social-feed"
      />
      <div className="min-h-screen bg-background text-foreground pt-14">
        {/* Hero Section */}
        <section className="border-b border-foreground px-4 py-12 md:py-20">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">
              Social Feed
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Latest posts and updates from across all social platforms.
            </p>
          </div>
        </section>

        {/* Platform Filter */}
        <section className="sticky top-14 z-40 bg-background border-b border-foreground px-4 py-4">
          <div className="container max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={cn(
                    "px-4 py-2 uppercase font-bold text-sm tracking-wider transition-colors",
                    selectedPlatform === platform
                      ? "bg-foreground text-background"
                      : "bg-transparent border border-foreground hover:bg-foreground hover:text-background"
                  )}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Feed Grid */}
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            {isLoading ? (
              <div className="text-center py-20">
                <p className="text-xl uppercase">Loading feed...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">No posts found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:scale-[1.02] transition-transform">
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="aspect-square bg-black relative">
                        {post.thumbnailUrl ? (
                          <img
                            src={post.thumbnailUrl}
                            alt={post.caption || "Social media post"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getPlatformIcon(post.platform)}
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-background/90 px-2 py-1 text-xs font-bold uppercase flex items-center gap-1">
                          {getPlatformIcon(post.platform)}
                          {post.platform}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        {post.caption && (
                          <p className="text-sm mb-3 line-clamp-2">{post.caption}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            {post.likes > 0 && (
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {post.likes}
                              </span>
                            )}
                            {post.comments > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {post.comments}
                              </span>
                            )}
                            {post.shares > 0 && (
                              <span className="flex items-center gap-1">
                                <Share2 className="w-3 h-3" />
                                {post.shares}
                              </span>
                            )}
                          </div>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </CardContent>
                    </a>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

