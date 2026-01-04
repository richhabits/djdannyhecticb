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
import { Music, Plus, Edit, Trash2, Play } from "lucide-react";

export default function AdminTracks() {
  const { user, isAuthenticated } = useAuth();
  const [editingTrack, setEditingTrack] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    note: "",
  });

  const utils = trpc.useUtils();
  const { data: tracks, isLoading } = trpc.tracks.adminList.useQuery({ limit: 100 });
  const { data: nowPlaying } = trpc.tracks.nowPlaying.useQuery();

  const createTrack = trpc.tracks.create.useMutation({
    onSuccess: () => {
      toast.success("Track created");
      utils.tracks.adminList.invalidate();
      utils.tracks.nowPlaying.invalidate();
      utils.tracks.history.invalidate();
      setShowNewForm(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create track";
      toast.error(message);
    },
  });

  const updateTrack = trpc.tracks.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Track updated");
      utils.tracks.adminList.invalidate();
      utils.tracks.nowPlaying.invalidate();
      utils.tracks.history.invalidate();
      setEditingTrack(null);
      resetForm();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update track";
      toast.error(message);
    },
  });

  const deleteTrack = trpc.tracks.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Track deleted");
      utils.tracks.adminList.invalidate();
      utils.tracks.nowPlaying.invalidate();
      utils.tracks.history.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to delete track";
      toast.error(message);
    },
  });

  const resetForm = () => {
    setFormData({ title: "", artist: "", note: "" });
  };

  const handleEdit = (track: any) => {
    setEditingTrack(track.id);
    setFormData({
      title: track.title || "",
      artist: track.artist || "",
      note: track.note || "",
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.artist) {
      toast.error("Title and Artist are required");
      return;
    }

    if (editingTrack) {
      updateTrack.mutate({ id: editingTrack, ...formData });
    } else {
      createTrack.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this track?")) {
      deleteTrack.mutate({ id });
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
                <Music className="w-8 h-8" />
                Manage Tracks
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage track history and now playing
              </p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setEditingTrack(null);
                setShowNewForm(true);
              }}
              className="gradient-bg"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Track
            </Button>
          </div>
          
          {nowPlaying && (
            <Card className="mb-6 bg-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Now Playing</div>
                    <div className="font-semibold">
                      {nowPlaying.artist} - {nowPlaying.title}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tracks...</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artist</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Played</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tracks && tracks.length > 0 ? (
                    tracks.map((track) => (
                      <TableRow key={track.id}>
                        <TableCell className="font-medium">{track.artist}</TableCell>
                        <TableCell>{track.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {track.note || "-"}
                        </TableCell>
                        <TableCell>
                          {track.playedAt
                            ? formatDistanceToNow(new Date(track.playedAt), {
                                addSuffix: true,
                              })
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(track)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(track.id)}
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
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No tracks found. Add your first track!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={showNewForm || editingTrack !== null} onOpenChange={(open) => {
          if (!open) {
            setShowNewForm(false);
            setEditingTrack(null);
            resetForm();
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTrack ? "Edit Track" : "Create New Track"}</DialogTitle>
              <DialogDescription>
                {editingTrack ? "Update track details" : "Add a new track to the history"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="artist">Artist *</Label>
                <Input
                  id="artist"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  placeholder="Artist Name"
                />
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Track Title"
                />
              </div>
              <div>
                <Label htmlFor="note">Note</Label>
                <Input
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Optional note"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewForm(false);
                  setEditingTrack(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="gradient-bg">
                {editingTrack ? "Update" : "Create"} Track
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

