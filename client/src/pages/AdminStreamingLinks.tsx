/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Link as LinkIcon, Plus, Edit, Trash2, ExternalLink, Music, Youtube, Radio } from "lucide-react";

// YouTube URL extractor helper
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// SoundCloud URL validator
function isValidSoundCloudUrl(url: string): boolean {
  return /soundcloud\.com/.test(url);
}

export default function AdminStreamingLinks() {
  const { user, isAuthenticated } = useAuth();
  const [editingLink, setEditingLink] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [formData, setFormData] = useState({
    platform: "spotify",
    url: "",
    displayName: "",
    icon: "",
    order: "0",
  });

  const utils = trpc.useUtils();
  const { data: links, isLoading } = trpc.streaming.adminList.useQuery();

  const createLink = trpc.streaming.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Streaming link created");
      utils.streaming.adminList.invalidate();
      utils.streaming.links.invalidate();
      setShowNewForm(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create link";
      toast.error(message);
    },
  });

  const updateLink = trpc.streaming.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Streaming link updated");
      utils.streaming.adminList.invalidate();
      utils.streaming.links.invalidate();
      setEditingLink(null);
      resetForm();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update link";
      toast.error(message);
    },
  });

  const deleteLink = trpc.streaming.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Streaming link deleted");
      utils.streaming.adminList.invalidate();
      utils.streaming.links.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to delete link";
      toast.error(message);
    },
  });

  const resetForm = () => {
    setFormData({
      platform: "spotify",
      url: "",
      displayName: "",
      icon: "",
      order: "0",
    });
    setYoutubeUrl("");
  };

  const handleEdit = (link: any) => {
    setEditingLink(link.id);
    setFormData({
      platform: link.platform || "spotify",
      url: link.url || "",
      displayName: link.displayName || "",
      icon: link.icon || "",
      order: link.order ? String(link.order) : "0",
    });
    
    // If it's a YouTube link, extract the video ID
    if (link.platform === "youtube" && link.url) {
      const videoId = extractYouTubeVideoId(link.url);
      if (videoId) {
        setYoutubeUrl(`https://youtube.com/watch?v=${videoId}`);
      } else {
        setYoutubeUrl(link.url);
      }
    } else {
      setYoutubeUrl("");
    }
  };

  const handleYoutubeUrlGrab = () => {
    if (!youtubeUrl.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      toast.error("Invalid YouTube URL. Please use a valid YouTube link.");
      return;
    }

    const finalUrl = `https://youtube.com/watch?v=${videoId}`;
    setFormData({
      ...formData,
      platform: "youtube",
      url: finalUrl,
      displayName: formData.displayName || "YouTube",
    });
    toast.success("YouTube URL extracted successfully!");
  };

  const handleSubmit = () => {
    if (!formData.url) {
      toast.error("URL is required");
      return;
    }

    // Validate SoundCloud URLs
    if (formData.platform === "soundcloud" && !isValidSoundCloudUrl(formData.url)) {
      toast.error("Invalid SoundCloud URL. Please use a valid SoundCloud link.");
      return;
    }

    const data = {
      ...formData,
      order: Number(formData.order) || 0,
    };

    if (editingLink) {
      updateLink.mutate({ id: editingLink, ...data });
    } else {
      createLink.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this streaming link?")) {
      deleteLink.mutate({ id });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "youtube":
        return <Youtube className="w-4 h-4 text-red-500" />;
      case "soundcloud":
        return <Music className="w-4 h-4 text-orange-500" />;
      case "spotify":
        return <Music className="w-4 h-4 text-green-500" />;
      case "apple-music":
        return <Music className="w-4 h-4 text-pink-500" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
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
                <LinkIcon className="w-8 h-8" />
                Manage Streaming Links
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage links to music platforms (Spotify, SoundCloud, YouTube, etc.)
              </p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setEditingLink(null);
                setShowNewForm(true);
              }}
              className="gradient-bg"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Link
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading streaming links...</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links && links.length > 0 ? (
                    [...links].sort((a, b) => (a.order || 0) - (b.order || 0)).map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(link.platform)}
                            <span className="capitalize">{link.platform}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {link.displayName || link.platform}
                        </TableCell>
                        <TableCell>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {link.url.length > 50 ? `${link.url.substring(0, 50)}...` : link.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </TableCell>
                        <TableCell>{link.order || 0}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(link.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(link)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(link.id)}
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
                        No streaming links found. Create your first link!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={showNewForm || editingLink !== null} onOpenChange={(open) => {
          if (!open) {
            setShowNewForm(false);
            setEditingLink(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLink ? "Edit Streaming Link" : "Create New Streaming Link"}</DialogTitle>
              <DialogDescription>
                {editingLink ? "Update streaming link details" : "Add a new streaming platform link"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="platform">Platform *</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => {
                    setFormData({ ...formData, platform: value });
                    if (value === "youtube") {
                      setYoutubeUrl("");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spotify">Spotify</SelectItem>
                    <SelectItem value="soundcloud">SoundCloud</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="apple-music">Apple Music</SelectItem>
                    <SelectItem value="tidal">Tidal</SelectItem>
                    <SelectItem value="amazon-music">Amazon Music</SelectItem>
                    <SelectItem value="deezer">Deezer</SelectItem>
                    <SelectItem value="bandcamp">Bandcamp</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.platform === "youtube" && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <Label className="text-sm font-semibold mb-2 block">YouTube URL Grabber</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Paste YouTube URL here (any format)"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={handleYoutubeUrlGrab}
                      variant="outline"
                      className="w-full"
                    >
                      <Youtube className="w-4 h-4 mr-2" />
                      Extract & Set YouTube URL
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Supports: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
                    </p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
                {formData.platform === "soundcloud" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be a valid SoundCloud URL (soundcloud.com/...)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="My Playlist"
                  />
                </div>
                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="icon">Icon (optional)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="icon-name or icon URL"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewForm(false);
                  setEditingLink(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="gradient-bg">
                {editingLink ? "Update" : "Create"} Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

