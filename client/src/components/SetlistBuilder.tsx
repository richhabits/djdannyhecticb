/**
 * Setlist Builder Component
 * Create and manage DJ setlists with track management
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Plus, Trash2, Music, Clock } from "lucide-react";
// Drag and drop can be added later with a library like @hello-pangea/dnd

interface Track {
  id: string;
  title: string;
  artist: string;
  duration?: number;
  bpm?: number;
  key?: string;
  notes?: string;
}

interface SetlistBuilderProps {
  initialTracks?: Track[];
  onSave?: (tracks: Track[]) => void;
}

export function SetlistBuilder({ initialTracks = [], onSave }: SetlistBuilderProps) {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [newTrack, setNewTrack] = useState({ title: "", artist: "", duration: "", bpm: "", key: "", notes: "" });

  const addTrack = () => {
    if (!newTrack.title || !newTrack.artist) return;

    const track: Track = {
      id: `track-${Date.now()}`,
      title: newTrack.title,
      artist: newTrack.artist,
      duration: newTrack.duration ? parseInt(newTrack.duration) : undefined,
      bpm: newTrack.bpm ? parseInt(newTrack.bpm) : undefined,
      key: newTrack.key || undefined,
      notes: newTrack.notes || undefined,
    };

    setTracks([...tracks, track]);
    setNewTrack({ title: "", artist: "", duration: "", bpm: "", key: "", notes: "" });
  };

  const removeTrack = (id: string) => {
    setTracks(tracks.filter((t) => t.id !== id));
  };

  const moveTrack = (fromIndex: number, toIndex: number) => {
    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, reorderedItem);
    setTracks(items);
  };

  const totalDuration = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Setlist Builder
          </span>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {formatDuration(totalDuration)}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Track */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-4 bg-muted rounded-lg">
          <Input
            placeholder="Track Title"
            value={newTrack.title}
            onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
          />
          <Input
            placeholder="Artist"
            value={newTrack.artist}
            onChange={(e) => setNewTrack({ ...newTrack, artist: e.target.value })}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Duration (sec)"
              type="number"
              value={newTrack.duration}
              onChange={(e) => setNewTrack({ ...newTrack, duration: e.target.value })}
              className="flex-1"
            />
            <Button onClick={addTrack} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Input
            placeholder="BPM (optional)"
            type="number"
            value={newTrack.bpm}
            onChange={(e) => setNewTrack({ ...newTrack, bpm: e.target.value })}
          />
          <Input
            placeholder="Key (optional)"
            value={newTrack.key}
            onChange={(e) => setNewTrack({ ...newTrack, key: e.target.value })}
          />
          <Textarea
            placeholder="Notes (optional)"
            value={newTrack.notes}
            onChange={(e) => setNewTrack({ ...newTrack, notes: e.target.value })}
            className="md:col-span-2"
            rows={2}
          />
        </div>

        {/* Track List */}
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-2 p-3 bg-muted rounded-lg"
            >
              <div className="flex flex-col gap-1">
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => moveTrack(index, index - 1)}
                  >
                    ↑
                  </Button>
                )}
                {index < tracks.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => moveTrack(index, index + 1)}
                  >
                    ↓
                  </Button>
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{track.title}</div>
                <div className="text-sm text-muted-foreground">{track.artist}</div>
                <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                  {track.duration && <span>{formatDuration(track.duration)}</span>}
                  {track.bpm && <span>{track.bpm} BPM</span>}
                  {track.key && <span>Key: {track.key}</span>}
                </div>
                {track.notes && (
                  <div className="text-xs text-muted-foreground mt-1">{track.notes}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTrack(track.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {tracks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No tracks yet. Add your first track above!
          </div>
        )}

        {tracks.length > 0 && onSave && (
          <Button onClick={() => onSave(tracks)} className="w-full">
            Save Setlist
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
