/**
 * Social Media Feed Integration Component
 * Aggregates and displays content from multiple social platforms
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Instagram, Twitter, Youtube, Facebook } from "lucide-react";

interface SocialPost {
  id: string;
  platform: "instagram" | "twitter" | "youtube" | "facebook";
  content: string;
  mediaUrl?: string;
  author: string;
  authorAvatar?: string;
  timestamp: Date;
  likes?: number;
  comments?: number;
  url: string;
}

interface SocialMediaFeedProps {
  platforms?: ("instagram" | "twitter" | "youtube" | "facebook")[];
  limit?: number;
}

export function SocialMediaFeed({
  platforms = ["instagram", "twitter", "youtube"],
  limit = 10,
}: SocialMediaFeedProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>(platforms[0] || "all");
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real implementation, this would fetch from your backend API
  // which aggregates posts from social media APIs
  // For now, this is a structure ready for integration

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredPosts =
    selectedPlatform === "all"
      ? posts
      : posts.filter((post) => post.platform === selectedPlatform);

  return (
    <div className="space-y-4">
      <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {platforms.map((platform) => (
            <TabsTrigger key={platform} value={platform} className="flex items-center gap-2">
              {getPlatformIcon(platform)}
              <span className="capitalize">{platform}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {loading ? (
          <div className="space-y-4 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <TabsContent value={selectedPlatform} className="space-y-4 mt-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.slice(0, limit).map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getPlatformIcon(post.platform)}
                      <span className="font-semibold">{post.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mb-3">{post.content}</p>
                    {post.mediaUrl && (
                      <div className="mb-3">
                        {post.platform === "youtube" ? (
                          <iframe
                            src={post.mediaUrl}
                            className="w-full aspect-video rounded-lg"
                            allowFullScreen
                          />
                        ) : (
                          <img
                            src={post.mediaUrl}
                            alt={post.content}
                            className="w-full rounded-lg"
                          />
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {post.likes !== undefined && <span>❤️ {post.likes}</span>}
                      {post.comments !== undefined && <span>💬 {post.comments}</span>}
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View on {post.platform}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No posts available. Check back soon!
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
