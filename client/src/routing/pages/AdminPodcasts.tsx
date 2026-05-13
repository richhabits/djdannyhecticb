import { useAuth } from "@/_core/hooks/useAuth";
import { DatabaseErrorBanner } from "@/components/DatabaseErrorBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Podcast, Plus, Edit, Trash2, ExternalLink, Music } from "lucide-react";

export default function AdminPodcasts() {
  const { user, isAuthenticated } = useAuth();
  const [editingPodcast, setEditingPodcast] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    episodeNumber: "",
    audioUrl: "",
    coverImageUrl: "",
    duration: "",
    spotifyUrl: "",
    applePodcastsUrl: "",
    youtubeUrl: "",
  });

  const utils = trpc.useUtils();
  const { data: podcasts, isLoading } = trpc.podcasts.adminList.useQuery();

  const createPodcast = trpc.podcasts.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Podcast created");
      utils.podcasts.adminList.invalidate();
      utils.podcasts.list.invalidate();
      setShowNewForm(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create podcast";
      toast.error(message);
    },
  });

  const updatePodcast = trpc.podcasts.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Podcast updated");
      utils.podcasts.adminList.invalidate();
      utils.podcasts.list.invalidate();
      setEditingPodcast(null);
      resetForm();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update podcast";
      toast.error(message);
    },
  });

  const deletePodcast = trpc.podcasts.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Podcast deleted");
      utils.podcasts.adminList.invalidate();
      utils.podcasts.list.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to delete podcast";
      toast.error(message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      episodeNumber: "",
      audioUrl: "",
      coverImageUrl: "",
      duration: "",
      spotifyUrl: "",
      applePodcastsUrl: "",
      youtubeUrl: "",
    });
  };

  const handleEdit = (podcast: any) => {
    setEditingPodcast(podcast.id);
    setFormData({
      title: podcast.title || "",
      description: podcast.description || "",
      episodeNumber: podcast.episodeNumber ? String(podcast.episodeNumber) : "",
      audioUrl: podcast.audioUrl || "",
      coverImageUrl: podcast.coverImageUrl || "",
      duration: podcast.duration ? String(podcast.duration) : "",
      spotifyUrl: podcast.spotifyUrl || "",
      applePodcastsUrl: podcast.applePodcastsUrl || "",
      youtubeUrl: podcast.youtubeUrl || "",
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.audioUrl) {
      toast.error("Title and Audio URL are required");
      return;
    }

    const data = {
      ...formData,
      episodeNumber: formData.episodeNumber ? Number(formData.episodeNumber) : undefined,
      duration: formData.duration ? Number(formData.duration) : undefined,
    };

    if (editingPodcast) {
      updatePodcast.mutate({ id: editingPodcast, ...data });
    } else {
      createPodcast.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this podcast?")) {
      deletePodcast.mutate({ id });
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Admin Access Required</h1>
          <p className="text-muted-foreground">You must be an admin to access this page.</p>
          <Link href="/">
            <Button className="gradient-bg">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DatabaseErrorBanner />
      <div className="container py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Podcast className="w-8 h-8" />
                Manage Podcasts
              </h1>
              <p className="text-muted-foreground mt-2">
                Create, edit, and manage podcast episodes
              </p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setEditingPodcast(null);
                setShowNewForm(true);
              }}
              className="gradient-bg"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Podcast
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading podcasts...</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Episode</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Platforms</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {podcasts && podcasts.length > 0 ? (
                    podcasts.map((podcast) => (
                      <TableRow key={podcast.id}>
                        <TableCell>
                          {podcast.episodeNumber ? `#${podcast.episodeNumber}` : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {podcast.coverImageUrl && (
                              <img
                                src={podcast.coverImageUrl}
                                alt={podcast.title}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{podcast.title}</div>
                              {podcast.description && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {podcast.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {podcast.duration
                            ? `${Math.floor(podcast.duration / 60)}:${String(podcast.duration % 60).padStart(2, "0")}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {podcast.spotifyUrl && (
                              <a href={podcast.spotifyUrl} target="_blank" rel="noopener noreferrer">
                                <Music className="w-4 h-4 text-green-500" />
                              </a>
                            )}
                            {podcast.applePodcastsUrl && (
                              <a href={podcast.applePodcastsUrl} target="_blank" rel="noopener noreferrer">
                                <Music className="w-4 h-4 text-purple-500" />
                              </a>
                            )}
                            {podcast.youtubeUrl && (
                              <a href={podcast.youtubeUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 text-red-500" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(podcast.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {podcast.audioUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(podcast.audioUrl, "_blank")}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(podcast)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(podcast.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No podcasts found. Create your first podcast!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={showNewForm || editingPodcast !== null} onOpenChange={(open) => {
          if (!open) {
            setShowNewForm(false);
            setEditingPodcast(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPodcast ? "Edit Podcast" : "Create New Podcast"}</DialogTitle>
              <DialogDescription>
                {editingPodcast ? "Update podcast details" : "Fill in the details to create a new podcast episode"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Podcast Title"
                  />
                </div>
                <div>
                  <Label htmlFor="episodeNumber">Episode Number</Label>
                  <Input
                    id="episodeNumber"
                    type="number"
                    value={formData.episodeNumber}
                    onChange={(e) => setFormData({ ...formData, episodeNumber: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Podcast description..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="audioUrl">Audio URL *</Label>
                <Input
                  id="audioUrl"
                  value={formData.audioUrl}
                  onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                <Input
                  id="coverImageUrl"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="3600"
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <Label className="text-lg font-semibold mb-3 block">Platform Links</Label>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="spotifyUrl">Spotify URL</Label>
                    <Input
                      id="spotifyUrl"
                      value={formData.spotifyUrl}
                      onChange={(e) => setFormData({ ...formData, spotifyUrl: e.target.value })}
                      placeholder="https://open.spotify.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="applePodcastsUrl">Apple Podcasts URL</Label>
                    <Input
                      id="applePodcastsUrl"
                      value={formData.applePodcastsUrl}
                      onChange={(e) => setFormData({ ...formData, applePodcastsUrl: e.target.value })}
                      placeholder="https://podcasts.apple.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="youtubeUrl">YouTube URL</Label>
                    <Input
                      id="youtubeUrl"
                      value={formData.youtubeUrl}
                      onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewForm(false);
                  setEditingPodcast(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="gradient-bg">
                {editingPodcast ? "Update" : "Create"} Podcast
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

