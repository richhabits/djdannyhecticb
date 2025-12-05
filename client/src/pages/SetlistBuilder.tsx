import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Trash2, GripVertical, Music } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface Track {
  title: string;
  artist: string;
  duration?: number;
  notes?: string;
}

export default function SetlistBuilder() {
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [newTrack, setNewTrack] = useState<Track>({
    title: "",
    artist: "",
    duration: undefined,
    notes: "",
  });

  const createSetlist = trpc.setlists.create.useMutation({
    onSuccess: () => {
      toast.success("Setlist created successfully!");
      setName("");
      setDescription("");
      setTracks([]);
    },
  });

  const addTrack = () => {
    if (!newTrack.title || !newTrack.artist) {
      toast.error("Please fill in title and artist");
      return;
    }
    setTracks([...tracks, newTrack]);
    setNewTrack({ title: "", artist: "", duration: undefined, notes: "" });
  };

  const removeTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const saveSetlist = () => {
    if (!name) {
      toast.error("Please enter a setlist name");
      return;
    }
    if (tracks.length === 0) {
      toast.error("Please add at least one track");
      return;
    }

    createSetlist.mutate({
      name,
      description,
      tracks,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Please log in to create setlists.</p>
      </div>
    );
  }

  const totalDuration = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Setlist Builder</h1>
        <p className="text-muted-foreground">
          Create and manage your DJ setlists.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Setlist Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Setlist Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Friday Night Mix"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-4">Add Track</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="track-title">Title *</Label>
                <Input
                  id="track-title"
                  value={newTrack.title}
                  onChange={(e) =>
                    setNewTrack({ ...newTrack, title: e.target.value })
                  }
                  placeholder="Track title"
                />
              </div>
              <div>
                <Label htmlFor="track-artist">Artist *</Label>
                <Input
                  id="track-artist"
                  value={newTrack.artist}
                  onChange={(e) =>
                    setNewTrack({ ...newTrack, artist: e.target.value })
                  }
                  placeholder="Artist name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="track-duration">Duration (seconds)</Label>
                  <Input
                    id="track-duration"
                    type="number"
                    value={newTrack.duration || ""}
                    onChange={(e) =>
                      setNewTrack({
                        ...newTrack,
                        duration: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="180"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="track-notes">Notes</Label>
                <Input
                  id="track-notes"
                  value={newTrack.notes}
                  onChange={(e) =>
                    setNewTrack({ ...newTrack, notes: e.target.value })
                  }
                  placeholder="Optional notes..."
                />
              </div>
              <Button onClick={addTrack} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Track
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Tracks ({tracks.length})</h2>
            {totalDuration > 0 && (
              <span className="text-sm text-muted-foreground">
                {Math.floor(totalDuration / 60)}:{(totalDuration % 60)
                  .toString()
                  .padStart(2, "0")}
              </span>
            )}
          </div>

          {tracks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tracks added yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <Card
                  key={index}
                  className="p-3 flex items-center gap-3 hover:bg-accent transition-colors"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{track.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {track.artist}
                      {track.duration && (
                        <span className="ml-2">
                          ({Math.floor(track.duration / 60)}:
                          {(track.duration % 60).toString().padStart(2, "0")})
                        </span>
                      )}
                    </div>
                    {track.notes && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {track.notes}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTrack(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}

          {tracks.length > 0 && (
            <Button
              className="w-full mt-6"
              size="lg"
              onClick={saveSetlist}
              disabled={createSetlist.isPending}
            >
              Save Setlist
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
