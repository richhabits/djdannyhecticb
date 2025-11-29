import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Image, Video, Music, FileText, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const REACTION_EMOJIS = ["🔥", "💥", "🎧", "😂", "😱"];

const TYPE_ICONS = {
  post: <FileText className="w-5 h-5" />,
  photo: <Image className="w-5 h-5" />,
  clip: <Video className="w-5 h-5" />,
  mix: <Music className="w-5 h-5" />,
};

export function HecticFeed({ includeVip = false }: { includeVip?: boolean }) {
  const utils = trpc.useUtils();
  const { data: posts, isLoading } = trpc.feed.list.useQuery({ includeVip });

  const react = trpc.feed.react.useMutation({
    onSuccess: () => {
      utils.feed.list.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to react";
      toast.error(message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="glass">
            <CardContent className="py-4">
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No posts yet. Check back soon for updates from Danny!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const reactions = JSON.parse(post.reactions || "{}");
        const typeIcon = TYPE_ICONS[post.type] || <FileText className="w-5 h-5" />;

        return (
          <Card key={post.id} className="glass">
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-accent">{typeIcon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">DJ Danny Hectic B</span>
                      {post.isVipOnly && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          VIP
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              {post.title && (
                <h3 className="font-bold text-lg">{post.title}</h3>
              )}
              {post.content && (
                <p className="whitespace-pre-wrap">{post.content}</p>
              )}
              {post.aiCaption && (
                <p className="text-sm text-muted-foreground italic">{post.aiCaption}</p>
              )}

              {/* Media */}
              {post.mediaUrl && (
                <div className="rounded-lg overflow-hidden">
                  {post.type === "photo" || post.type === "clip" ? (
                    <img
                      src={post.mediaUrl}
                      alt={post.title || "Post media"}
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  ) : post.type === "mix" ? (
                    <div className="bg-muted p-8 text-center">
                      <Music className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Mix: {post.title}</p>
                      {post.mediaUrl && (
                        <a
                          href={post.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline text-sm mt-2 inline-block"
                        >
                          Listen Now
                        </a>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Reactions */}
              <div className="flex items-center gap-2 flex-wrap">
                {REACTION_EMOJIS.map((emoji) => {
                  const count = reactions[emoji] || 0;
                  return (
                    <Button
                      key={emoji}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => react.mutate({ postId: post.id, emoji })}
                      disabled={react.isPending}
                    >
                      <span>{emoji}</span>
                      {count > 0 && <span className="text-xs">{count}</span>}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

