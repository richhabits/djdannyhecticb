/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { DatabaseErrorBanner } from "@/components/DatabaseErrorBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
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
import { Music, Plus, Edit, Trash2, ExternalLink, Download } from "lucide-react";

export default function AdminMixes() {
  const { user, isAuthenticated } = useAuth();
  const [editingMix, setEditingMix] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    audioUrl: "",
    coverImageUrl: "",
    duration: "",
    genre: "",
    isFree: true,
    downloadUrl: "",
  });

  const utils = trpc.useUtils();
  const { data: mixes, isLoading } = trpc.mixes.adminList.useQuery();

  const createMix = trpc.mixes.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Mix created");
      utils.mixes.adminList.invalidate();
      utils.mixes.list.invalidate();
      setShowNewForm(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create mix";
      toast.error(message);
    },
  });

  const updateMix = trpc.mixes.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Mix updated");
      utils.mixes.adminList.invalidate();
      utils.mixes.list.invalidate();
      setEditingMix(null);
      resetForm();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update mix";
      toast.error(message);
    },
  });

  const deleteMix = trpc.mixes.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Mix deleted");
      utils.mixes.adminList.invalidate();
      utils.mixes.list.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to delete mix";
      toast.error(message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      audioUrl: "",
      coverImageUrl: "",
      duration: "",
      genre: "",
      isFree: true,
      downloadUrl: "",
    });
  };

  const handleEdit = (mix: any) => {
    setEditingMix(mix.id);
    setFormData({
      title: mix.title || "",
      description: mix.description || "",
      audioUrl: mix.audioUrl || "",
      coverImageUrl: mix.coverImageUrl || "",
      duration: mix.duration ? String(mix.duration) : "",
      genre: mix.genre || "",
      isFree: mix.isFree ?? true,
      downloadUrl: mix.downloadUrl || "",
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.audioUrl) {
      toast.error("Title and Audio URL are required");
      return;
    }

    const data = {
      ...formData,
      duration: formData.duration ? Number(formData.duration) : undefined,
    };

    if (editingMix) {
      updateMix.mutate({ id: editingMix, ...data });
    } else {
      createMix.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this mix?")) {
      deleteMix.mutate({ id });
    }
  };

  // Check if user is admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Admin Access Required</h1>
          <p className="text-muted-foreground">
            You must be an admin to access this page.
          </p>
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
                Manage Mixes
              </h1>
              <p className="text-muted-foreground mt-2">
                Create, edit, and manage DJ mixes
              </p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setEditingMix(null);
                setShowNewForm(true);
              }}
              className="gradient-bg"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Mix
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading mixes...</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Free</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mixes && mixes.length > 0 ? (
                    mixes.map((mix) => (
                      <TableRow key={mix.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {mix.coverImageUrl && (
                              <img
                                src={mix.coverImageUrl}
                                alt={mix.title}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{mix.title}</div>
                              {mix.description && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {mix.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{mix.genre || "-"}</TableCell>
                        <TableCell>
                          {mix.duration
                            ? `${Math.floor(mix.duration / 60)}:${String(mix.duration % 60).padStart(2, "0")}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {mix.isFree ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            <span className="text-orange-600">Paid</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(mix.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {mix.audioUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(mix.audioUrl, "_blank")}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(mix)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(mix.id)}
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
                        No mixes found. Create your first mix!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={showNewForm || editingMix !== null} onOpenChange={(open) => {
          if (!open) {
            setShowNewForm(false);
            setEditingMix(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMix ? "Edit Mix" : "Create New Mix"}</DialogTitle>
              <DialogDescription>
                {editingMix
                  ? "Update mix details below"
                  : "Fill in the details to create a new mix"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Mix Title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mix description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="House, Techno, etc."
                  />
                </div>
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
              <div>
                <Label htmlFor="downloadUrl">Download URL</Label>
                <Input
                  id="downloadUrl"
                  value={formData.downloadUrl}
                  onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isFree"
                  checked={formData.isFree}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
                />
                <Label htmlFor="isFree">Free Mix</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewForm(false);
                  setEditingMix(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="gradient-bg">
                {editingMix ? "Update" : "Create"} Mix
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

