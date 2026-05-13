import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Plus, Edit, Trash2 } from "lucide-react";

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function AdminShows() {
  const { user, isAuthenticated } = useAuth();
  const [editingShow, setEditingShow] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const utils = trpc.useUtils();
  const { data: shows, isLoading } = trpc.shows.all.useQuery();

  const createShow = trpc.shows.create.useMutation({
    onSuccess: () => {
      toast.success("Show created");
      utils.shows.all.invalidate();
      utils.shows.list.invalidate();
      setShowNewForm(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create show";
      toast.error(message);
    },
  });

  const updateShow = trpc.shows.update.useMutation({
    onSuccess: () => {
      toast.success("Show updated");
      utils.shows.all.invalidate();
      utils.shows.list.invalidate();
      setEditingShow(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update show";
      toast.error(message);
    },
  });

  const deleteShow = trpc.shows.delete.useMutation({
    onSuccess: () => {
      toast.success("Show deleted");
      utils.shows.all.invalidate();
      utils.shows.list.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to delete show";
      toast.error(message);
    },
  });

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
      <div className="container py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              Show Schedule
            </h1>
            <p className="text-muted-foreground">
              Manage weekly show schedule for Hectic Radio.
            </p>
          </div>
          <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
            <DialogTrigger asChild>
              <Button className="gradient-bg">
                <Plus className="w-4 h-4 mr-2" />
                New Show
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Show</DialogTitle>
              </DialogHeader>
              <ShowForm
                onSubmit={(data) => {
                  createShow.mutate(data);
                }}
                onCancel={() => setShowNewForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading shows...</p>
        ) : !shows || shows.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No shows scheduled yet.</p>
              <Button onClick={() => setShowNewForm(true)} className="gradient-bg">
                <Plus className="w-4 h-4 mr-2" />
                Create First Show
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {shows.map((show) => (
              <ShowCard
                key={show.id}
                show={show}
                isEditing={editingShow === show.id}
                onEdit={() => setEditingShow(show.id)}
                onCancel={() => setEditingShow(null)}
                onUpdate={(data) => {
                  updateShow.mutate({ id: show.id, ...data });
                }}
                onDelete={() => {
                  if (confirm(`Delete show "${show.name}"?`)) {
                    deleteShow.mutate({ id: show.id });
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShowCard({
  show,
  isEditing,
  onEdit,
  onCancel,
  onUpdate,
  onDelete,
}: {
  show: any;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}) {
  if (isEditing) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Edit Show</CardTitle>
        </CardHeader>
        <CardContent>
          <ShowForm
            show={show}
            onSubmit={(data) => {
              onUpdate(data);
            }}
            onCancel={onCancel}
          />
        </CardContent>
      </Card>
    );
  }

  const dayName = DAYS.find((d) => d.value === show.dayOfWeek)?.label || "Unknown";

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{show.name}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{dayName}</span>
            <span className="text-sm text-muted-foreground">
              {show.startTime} - {show.endTime}
            </span>
          </div>
          {show.host && (
            <p className="text-sm text-muted-foreground">Host: {show.host}</p>
          )}
          {show.description && (
            <p className="text-sm text-muted-foreground">{show.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded ${show.isActive ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"}`}>
              {show.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ShowForm({
  show,
  onSubmit,
  onCancel,
}: {
  show?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: show?.name || "",
    host: show?.host || "",
    description: show?.description || "",
    dayOfWeek: show?.dayOfWeek ?? 1,
    startTime: show?.startTime || "20:00",
    endTime: show?.endTime || "22:00",
    isActive: show?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dayOfWeek: parseInt(String(formData.dayOfWeek), 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Show Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="host">Host (optional)</Label>
        <Input
          id="host"
          value={formData.host}
          onChange={(e) => setFormData({ ...formData, host: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dayOfWeek">Day of Week *</Label>
          <Select
            value={String(formData.dayOfWeek)}
            onValueChange={(value) =>
              setFormData({ ...formData, dayOfWeek: parseInt(value, 10) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((day) => (
                <SelectItem key={day.value} value={String(day.value)}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time *</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time *</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
        </div>
      </div>

      {!show && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
            Active
          </Label>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="gradient-bg">
          {show ? "Update" : "Create"} Show
        </Button>
      </div>
    </form>
  );
}

