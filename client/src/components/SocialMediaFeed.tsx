import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function SocialMediaFeed({ limit = 10 }: { limit?: number }) {
  const { data: posts, isLoading } = trpc.socialFeeds.posts.useQuery({ limit });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No social media posts available at the moment.</p>
      </div>
    );
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="w-5 h-5" />;
      case "twitter":
        return <Twitter className="w-5 h-5" />;
      case "facebook":
        return <Facebook className="w-5 h-5" />;
      case "youtube":
        return <Youtube className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {post.thumbnailUrl && (
            <div className="aspect-square relative overflow-hidden">
              <img
                src={post.thumbnailUrl}
                alt={post.content || "Social media post"}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {getPlatformIcon(post.platform)}
              <span className="text-sm font-medium capitalize">{post.platform}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {formatDistanceToNow(new Date(post.postedAt), { addSuffix: true })}
              </span>
            </div>
            {post.content && (
              <p className="text-sm line-clamp-3 mb-2">{post.content}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {post.likes > 0 && <span>❤️ {post.likes}</span>}
              {post.comments > 0 && <span>💬 {post.comments}</span>}
              {post.shares > 0 && <span>🔁 {post.shares}</span>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
