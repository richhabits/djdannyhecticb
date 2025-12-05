import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FormEvent, useEffect, useState } from "react";
import { Plus, Edit, CheckCircle, XCircle, Sparkles, ArrowUp, ArrowDown, Trash2, ExternalLink, PlayCircle } from "lucide-react";
import { format } from "date-fns";
import { STREAMING_PLATFORM_META, STREAMING_PLATFORM_SLUGS, StreamingPlatformSlug } from "@shared/streamingPlatforms";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";

type AdminStreamingLink = inferRouterOutputs<AppRouter>["streaming"]["adminList"][number];
type SpotifyPlaylistAdmin = inferRouterOutputs<AppRouter>["music"]["spotify"]["adminList"][number];
type YouTubeVideoAdmin = inferRouterOutputs<AppRouter>["music"]["youtube"]["adminList"][number];

export default function AdminIntegrations() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("social");
  const [platformDialog, setPlatformDialog] = useState<{ mode: "create" | "edit"; data?: AdminStreamingLink } | null>(null);
  const utils = trpc.useUtils();

  const { data: socialIntegrations, refetch: refetchSocial } = trpc.integrations.social.adminList.useQuery();
  const { data: contentQueue, refetch: refetchContent } = trpc.integrations.content.adminList.useQuery({ limit: 100 });
  const { data: webhooks, refetch: refetchWebhooks } = trpc.integrations.webhooks.adminList.useQuery({ activeOnly: false });
  const { data: musicPlatforms, isLoading: isMusicLoading } = trpc.streaming.adminList.useQuery();
  const { data: spotifyAdmin, isLoading: spotifyLoading } = trpc.music.spotify.adminList.useQuery();
  const { data: youtubeAdmin, isLoading: youtubeLoading } = trpc.music.youtube.adminList.useQuery();

  const createSocial = trpc.integrations.social.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Social integration created");
      refetchSocial();
    },
  });

  const updateContentStatus = trpc.integrations.content.adminUpdateStatus.useMutation({
    onSuccess: () => {
      toast.success("Content status updated");
      refetchContent();
    },
  });

  const createWebhook = trpc.integrations.webhooks.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Webhook created");
      refetchWebhooks();
    },
  });

  const createPlatform = trpc.streaming.create.useMutation({
    onSuccess: () => {
      toast.success("Music platform added");
      utils.streaming.adminList.invalidate();
      utils.streaming.links.invalidate();
      setPlatformDialog(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to add platform";
      toast.error(message);
    },
  });

  const updatePlatform = trpc.streaming.update.useMutation({
    onSuccess: () => {
      toast.success("Music platform updated");
      utils.streaming.adminList.invalidate();
      utils.streaming.links.invalidate();
      setPlatformDialog(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update platform";
      toast.error(message);
    },
  });

  const deletePlatform = trpc.streaming.delete.useMutation({
    onSuccess: () => {
      toast.success("Music platform removed");
      utils.streaming.adminList.invalidate();
      utils.streaming.links.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to delete platform";
      toast.error(message);
    },
  });

  const reorderPlatforms = trpc.streaming.reorder.useMutation({
    onSuccess: () => {
      utils.streaming.adminList.invalidate();
      utils.streaming.links.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to reorder platforms";
      toast.error(message);
    },
  });

  const bootstrapPlatforms = trpc.streaming.bootstrapTopPlatforms.useMutation({
    onSuccess: () => {
      toast.success("Top platforms synced");
      utils.streaming.adminList.invalidate();
      utils.streaming.links.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to sync platforms";
      toast.error(message);
    },
  });

  const syncSpotify = trpc.music.spotify.sync.useMutation({
    onSuccess: (result) => {
      toast.success(`Synced Spotify content (${result.playlistsSynced} playlists, ${result.episodesSynced} episodes)`);
      utils.music.spotify.adminList.invalidate();
      utils.music.spotify.list.invalidate();
      utils.music.spotify.episodes.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to sync Spotify";
      toast.error(message);
    },
  });

  const syncYouTube = trpc.music.youtube.sync.useMutation({
    onSuccess: (result) => {
      toast.success(`Synced ${result.videosSynced} YouTube videos`);
      utils.music.youtube.adminList.invalidate();
      utils.music.youtube.list.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to sync YouTube";
      toast.error(message);
    },
  });

  const orderedPlatforms = [...(musicPlatforms ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const handleReorder = (id: number, direction: "up" | "down") => {
    if (!orderedPlatforms.length) return;
    const index = orderedPlatforms.findIndex((platform) => platform.id === id);
    if (index < 0) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= orderedPlatforms.length) return;

    const nextOrder = [...orderedPlatforms];
    [nextOrder[index], nextOrder[swapIndex]] = [nextOrder[swapIndex], nextOrder[index]];

    reorderPlatforms.mutate(nextOrder.map((platform, idx) => ({ id: platform.id, order: idx + 1 })));
  };

  const handleToggleActive = (platform: AdminStreamingLink, next: boolean) => {
    updatePlatform.mutate({
      id: platform.id,
      data: { isActive: next },
    });
  };

  const handleDeletePlatform = (platform: AdminStreamingLink) => {
    if (!confirm(`Remove ${platform.displayName || platform.platform}?`)) {
      return;
    }
    deletePlatform.mutate({ id: platform.id });
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Access denied. Admin only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <Badge variant="outline">Admin Only</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="social">Social Accounts</TabsTrigger>
          <TabsTrigger value="content">Content Queue</TabsTrigger>
          <TabsTrigger value="music">Music Platforms</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {socialIntegrations && socialIntegrations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Handle</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {socialIntegrations.map((integration) => (
                      <TableRow key={integration.id}>
                        <TableCell>
                          <Badge variant="outline">{integration.platform}</Badge>
                          {integration.isPrimary && (
                            <Badge variant="default" className="ml-2">Primary</Badge>
                          )}
                        </TableCell>
                        <TableCell>{integration.handle || "-"}</TableCell>
                        <TableCell>
                          <a href={integration.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {integration.url}
                          </a>
                        </TableCell>
                        <TableCell>
                          {integration.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No social integrations yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {contentQueue && contentQueue.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentQueue.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.targetPlatform}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "posted"
                                ? "default"
                                : item.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(item.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {item.status !== "posted" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const nextStatus = item.status === "draft" ? "ready" : item.status === "ready" ? "scheduled" : "posted";
                                updateContentStatus.mutate({
                                  id: item.id,
                                  status: nextStatus as any,
                                });
                              }}
                            >
                              {item.status === "draft" ? "Mark Ready" : item.status === "ready" ? "Schedule" : "Mark Posted"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No content in queue</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="music" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Music Platforms</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Control the services highlighted across Home, Live, and Podcast pages.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bootstrapPlatforms.mutate()}
                  disabled={bootstrapPlatforms.isLoading}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Sync Top 6
                </Button>
                <Button size="sm" onClick={() => setPlatformDialog({ mode: "create" })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Platform
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isMusicLoading ? (
                <p className="text-sm text-muted-foreground">Loading music platforms...</p>
              ) : orderedPlatforms.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {orderedPlatforms.map((platform, index) => {
                    const meta = STREAMING_PLATFORM_META[platform.platform as StreamingPlatformSlug];
                    return (
                      <div key={platform.id} className="border rounded-xl p-4 glass space-y-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{meta?.label || platform.platform}</Badge>
                            <Badge variant={platform.isActive ? "default" : "secondary"}>
                              {platform.isActive ? "Active" : "Hidden"}
                            </Badge>
                            <Badge variant="secondary">#{index + 1}</Badge>
                          </div>
                          <p className="text-lg font-semibold">{platform.displayName || meta?.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {platform.description || meta?.description}
                          </p>
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent inline-flex items-center gap-1"
                          >
                            {platform.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={!!platform.isActive}
                              onCheckedChange={(checked) => handleToggleActive(platform, checked)}
                            />
                            <span className="text-sm text-muted-foreground">Visible on site</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReorder(platform.id, "up")}
                              disabled={index === 0 || reorderPlatforms.isLoading}
                            >
                              <ArrowUp className="w-4 h-4 mr-1" />
                              Up
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReorder(platform.id, "down")}
                              disabled={index === orderedPlatforms.length - 1 || reorderPlatforms.isLoading}
                            >
                              <ArrowDown className="w-4 h-4 mr-1" />
                              Down
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPlatformDialog({ mode: "edit", data: platform })}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePlatform(platform)}
                              disabled={deletePlatform.isLoading}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <p className="text-muted-foreground">No music platforms yet.</p>
                  <Button onClick={() => setPlatformDialog({ mode: "create" })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add the first platform
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Spotify Sync</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Fetch curated playlists and latest show episodes directly from Spotify.
                  </p>
                </div>
                <Button size="sm" onClick={() => syncSpotify.mutate()} disabled={syncSpotify.isLoading}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {syncSpotify.isLoading ? "Syncing..." : "Sync Spotify"}
                </Button>
              </CardHeader>
              <CardContent className="flex-1">
                {spotifyLoading ? (
                  <p className="text-sm text-muted-foreground">Loading Spotify data…</p>
                ) : spotifyAdmin && spotifyAdmin.length > 0 ? (
                  <div className="space-y-3 max-h-[360px] overflow-auto pr-2">
                    {spotifyAdmin.map((playlist) => (
                      <div key={playlist.spotifyId} className="flex items-center gap-3 border rounded-lg p-3 glass">
                        {playlist.imageUrl ? (
                          <img src={playlist.imageUrl} alt={playlist.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center font-semibold">🎧</div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{playlist.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{playlist.description || "No description"}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {playlist.tracksCount ? <p>{playlist.tracksCount} tracks</p> : null}
                          {playlist.followers ? <p>{playlist.followers.toLocaleString()} followers</p> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No Spotify data yet. Run a sync to populate.</p>
                )}
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>YouTube Sync</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Pull the latest uploads and stats from your YouTube channel.
                  </p>
                </div>
                <Button size="sm" onClick={() => syncYouTube.mutate()} disabled={syncYouTube.isLoading}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {syncYouTube.isLoading ? "Syncing..." : "Sync YouTube"}
                </Button>
              </CardHeader>
              <CardContent className="flex-1">
                {youtubeLoading ? (
                  <p className="text-sm text-muted-foreground">Loading YouTube data…</p>
                ) : youtubeAdmin && youtubeAdmin.length > 0 ? (
                  <div className="space-y-3 max-h-[360px] overflow-auto pr-2">
                    {youtubeAdmin.map((video) => (
                      <div key={video.youtubeId} className="flex gap-3 border rounded-lg p-3 glass">
                        {video.thumbnailUrl ? (
                          <img src={video.thumbnailUrl} alt={video.title} className="w-20 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-20 h-12 rounded bg-muted flex items-center justify-center">
                            <PlayCircle className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{video.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{video.description}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                          {video.viewCount !== null && <p>{video.viewCount.toLocaleString()} views</p>}
                          {video.publishedAt && <p>{new Date(video.publishedAt).toLocaleDateString()}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No YouTube data yet. Run a sync to populate.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Don't paste secrets you don't control. Webhooks are triggered automatically when events occur.
                </p>
              </div>
              {webhooks && webhooks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhooks.map((webhook) => (
                      <TableRow key={webhook.id}>
                        <TableCell className="font-medium">{webhook.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{webhook.url}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{webhook.eventType}</Badge>
                        </TableCell>
                        <TableCell>
                          {webhook.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No webhooks configured</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!platformDialog} onOpenChange={(open) => !open && setPlatformDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{platformDialog?.mode === "edit" ? "Edit Music Platform" : "Add Music Platform"}</DialogTitle>
            <DialogDescription>
              Configure the link, embed, and visibility for this streaming service.
            </DialogDescription>
          </DialogHeader>
          {platformDialog && (
            <MusicPlatformForm
              mode={platformDialog.mode}
              initialData={platformDialog.data}
              isSubmitting={createPlatform.isLoading || updatePlatform.isLoading}
              onCancel={() => setPlatformDialog(null)}
              onSubmit={(values) => {
                if (platformDialog.mode === "edit" && platformDialog.data) {
                  updatePlatform.mutate({
                    id: platformDialog.data.id,
                    data: values,
                  });
                } else {
                  createPlatform.mutate(values);
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type MusicPlatformFormValues = {
  platform: StreamingPlatformSlug;
  displayName: string;
  url: string;
  embedUrl?: string;
  description?: string;
  isActive: boolean;
};

function resolveInitialValues(initialData?: AdminStreamingLink | null): MusicPlatformFormValues {
  if (initialData) {
    const slug = initialData.platform as StreamingPlatformSlug;
    const meta = STREAMING_PLATFORM_META[slug];
    return {
      platform: slug,
      displayName: initialData.displayName || meta?.label || slug,
      url: initialData.url,
      embedUrl: initialData.embedUrl || "",
      description: initialData.description || "",
      isActive: initialData.isActive ?? true,
    };
  }
  const slug = STREAMING_PLATFORM_SLUGS[0];
  const meta = STREAMING_PLATFORM_META[slug];
  return {
    platform: slug,
    displayName: meta?.label || slug,
    url: meta?.defaultUrl || "",
    embedUrl: meta?.defaultEmbedUrl || "",
    description: meta?.description || "",
    isActive: true,
  };
}

function MusicPlatformForm({
  initialData,
  mode,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initialData?: AdminStreamingLink | null;
  mode: "create" | "edit";
  onSubmit: (values: MusicPlatformFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [formValues, setFormValues] = useState<MusicPlatformFormValues>(() => resolveInitialValues(initialData));

  useEffect(() => {
    setFormValues(resolveInitialValues(initialData));
  }, [initialData]);

  const handlePlatformChange = (value: StreamingPlatformSlug) => {
    setFormValues((prev) => {
      const meta = STREAMING_PLATFORM_META[value];
      if (mode === "edit") {
        return { ...prev, platform: value };
      }
      return {
        ...prev,
        platform: value,
        displayName: meta?.label || value,
        url: meta?.defaultUrl || prev.url,
        embedUrl: meta?.defaultEmbedUrl || "",
        description: meta?.description || prev.description,
      };
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      ...formValues,
      description: formValues.description?.trim() || undefined,
      embedUrl: formValues.embedUrl?.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Platform</Label>
          <Select value={formValues.platform} onValueChange={(value) => handlePlatformChange(value as StreamingPlatformSlug)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STREAMING_PLATFORM_SLUGS.map((slug) => (
                <SelectItem key={slug} value={slug}>
                  {STREAMING_PLATFORM_META[slug]?.label || slug}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Display Name</Label>
          <Input
            value={formValues.displayName}
            onChange={(event) => setFormValues((prev) => ({ ...prev, displayName: event.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Public URL</Label>
          <Input
            value={formValues.url}
            onChange={(event) => setFormValues((prev) => ({ ...prev, url: event.target.value }))}
            required
            type="url"
            placeholder="https://"
          />
        </div>
        <div className="space-y-2">
          <Label>Embed URL (optional)</Label>
          <Input
            value={formValues.embedUrl || ""}
            onChange={(event) => setFormValues((prev) => ({ ...prev, embedUrl: event.target.value }))}
            type="url"
            placeholder="https://embed..."
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={formValues.description || ""}
            onChange={(event) => setFormValues((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="How should this platform be described on fan-facing pages?"
            rows={4}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="font-medium text-sm">Visible</p>
            <p className="text-xs text-muted-foreground">Toggle to hide/show on the site</p>
          </div>
          <Switch
            checked={formValues.isActive}
            onCheckedChange={(checked) => setFormValues((prev) => ({ ...prev, isActive: checked }))}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "edit" ? "Save changes" : "Add platform"}
        </Button>
      </DialogFooter>
    </form>
  );
}
