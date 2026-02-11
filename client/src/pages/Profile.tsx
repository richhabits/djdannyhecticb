import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { MetaTagsComponent } from "@/components/MetaTags";
import { UserPlus, UserMinus, MessageSquare, Heart, Share2, Trophy, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const [, params] = useRoute<{ username: string }>("/profile/:username");
  const username = params?.username || "";

  const { data: profile, refetch } = trpc.genz.profiles.getByUsername.useQuery(
    { username },
    { enabled: !!username }
  );

  const { data: posts } = trpc.genz.posts.list.useQuery(
    { profileId: profile?.id, limit: 20 },
    { enabled: !!profile?.id }
  );

  const { data: collectibles } = trpc.genz.collectibles.getUserCollectibles.useQuery(
    { profileId: profile?.id || 0 },
    { enabled: !!profile?.id }
  );

  const { data: achievements } = trpc.genz.achievements.getUserAchievements.useQuery(
    { profileId: profile?.id || 0 },
    { enabled: !!profile?.id }
  );

  const [isFollowing, setIsFollowing] = useState(false);
  const currentProfileId = 1; // TODO: Get from auth

  const followMutation = trpc.genz.follows.follow.useMutation({
    onSuccess: () => {
      setIsFollowing(true);
      toast.success("Following!");
      refetch();
    },
  });

  const unfollowMutation = trpc.genz.follows.unfollow.useMutation({
    onSuccess: () => {
      setIsFollowing(false);
      toast.success("Unfollowed");
      refetch();
    },
  });

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <MetaTagsComponent
        title={`${profile.displayName || profile.username} - Hectic Radio`}
        description={profile.bio || `Check out ${profile.displayName || profile.username}'s profile on Hectic Radio`}
        url={`/profile/${username}`}
      />
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <div
            className="h-48 bg-gradient-to-r from-primary/20 to-primary/5 rounded-t-lg"
            style={{
              backgroundImage: profile.bannerUrl ? `url(${profile.bannerUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-24 w-24 -mt-12 border-4 border-background">
                <AvatarImage src={profile.avatarUrl ?? undefined} />
                <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{profile.displayName || profile.username}</h1>
                  {profile.isVerified && <Badge variant="default">✓ Verified</Badge>}
                  <Badge variant="outline">Level {profile.level}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">{profile.bio || "No bio yet"}</p>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <span><strong className="text-foreground">{profile.followersCount}</strong> followers</span>
                  <span><strong className="text-foreground">{profile.followingCount}</strong> following</span>
                  <span><strong className="text-foreground">{profile.totalPoints}</strong> points</span>
                  <span><strong className="text-foreground">{profile.streakDays}</strong> day streak 🔥</span>
                </div>
                {profile.location && <p className="text-sm text-muted-foreground mb-4">📍 {profile.location}</p>}
                {currentProfileId !== profile.id && (
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    onClick={() => {
                      if (isFollowing) {
                        unfollowMutation.mutate({ followerId: currentProfileId, followingId: profile.id });
                      } else {
                        followMutation.mutate({ followerId: currentProfileId, followingId: profile.id });
                      }
                    }}
                  >
                    {isFollowing ? <UserMinus className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold">Posts</h2>
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{post.content || "Media post"}</CardTitle>
                  </CardHeader>
                  {post.mediaUrl && (
                    <CardContent>
                      {post.type === "image" && <img src={post.mediaUrl} alt="Post" className="rounded-lg w-full" />}
                      {post.type === "video" && (
                        <video src={post.mediaUrl} controls className="rounded-lg w-full" />
                      )}
                    </CardContent>
                  )}
                  <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" /> {post.likesCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" /> {post.commentsCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" /> {post.sharesCount}
                    </span>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No posts yet
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements && achievements.length > 0 ? (
                  <div className="space-y-2">
                    {achievements.slice(0, 5).map((ach) => (
                      <Badge key={ach.id} variant="outline" className="w-full justify-start">
                        {ach.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No achievements yet</p>
                )}
              </CardContent>
            </Card>

            {/* Collectibles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Collectibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {collectibles && collectibles.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {collectibles.slice(0, 6).map((col) => (
                      <div key={col.id} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🎁</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No collectibles yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

