/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useAuth } from "@/_core/hooks/useAuth";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  Radio,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  Plus,
  QrCode,
} from "lucide-react";
import { QRCode } from "@/components/QRCode";

export default function AdminStreams() {
  const { user, isAuthenticated } = useAuth();
  const [editingStream, setEditingStream] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const utils = trpc.useUtils();
  const { data: streams, isLoading } = trpc.streams.list.useQuery();

  const createStream = trpc.streams.create.useMutation({
    onSuccess: () => {
      toast.success("Stream created");
      utils.streams.list.invalidate();
      utils.streams.active.invalidate();
      setShowNewForm(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create stream";
      toast.error(message);
    },
  });

  const updateStream = trpc.streams.update.useMutation({
    onSuccess: () => {
      toast.success("Stream updated");
      utils.streams.list.invalidate();
      utils.streams.active.invalidate();
      setEditingStream(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update stream";
      toast.error(message);
    },
  });

  const deleteStream = trpc.streams.delete.useMutation({
    onSuccess: () => {
      toast.success("Stream deleted");
      utils.streams.list.invalidate();
      utils.streams.active.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to delete stream";
      toast.error(message);
    },
  });

  const setActive = trpc.streams.setActive.useMutation({
    onSuccess: () => {
      toast.success("Active stream updated");
      utils.streams.list.invalidate();
      utils.streams.active.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to set active stream";
      toast.error(message);
    },
  });

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
      <div className="container py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2 gradient-text">
                Stream Operations
              </h1>
              <p className="text-muted-foreground">
                Manage Shoutcast/Icecast stream configurations and monitor status.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/control">
                <Button variant="outline" size="sm">Control Tower</Button>
              </Link>
              <Link href="/live">
                <Button variant="outline" size="sm">Open Live</Button>
              </Link>
            </div>
          </div>
          
          {/* Live Link & QR Code */}
          <div className="mb-6">
            <QRCode
              url={`${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/live`}
              title="Live Page QR Code"
              size={150}
            />
          </div>
          
          <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
            <DialogTrigger asChild>
              <Button className="gradient-bg">
                <Plus className="w-4 h-4 mr-2" />
                New Stream
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Stream</DialogTitle>
              </DialogHeader>
              <StreamForm
                onSubmit={(data) => {
                  createStream.mutate(data);
                }}
                onCancel={() => setShowNewForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading streams...</p>
        ) : !streams || streams.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <Radio className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No streams configured yet.</p>
              <Button onClick={() => setShowNewForm(true)} className="gradient-bg">
                <Plus className="w-4 h-4 mr-2" />
                Create First Stream
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {streams.map((stream) => (
              <StreamCard
                key={stream.id}
                stream={stream}
                isEditing={editingStream === stream.id}
                onEdit={() => setEditingStream(stream.id)}
                onCancel={() => setEditingStream(null)}
                onUpdate={(data) => {
                  updateStream.mutate({ id: stream.id, ...data });
                }}
                onDelete={() => {
                  if (confirm(`Delete stream "${stream.name}"?`)) {
                    deleteStream.mutate({ id: stream.id });
                  }
                }}
                onSetActive={() => {
                  setActive.mutate({ id: stream.id });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StreamCard({
  stream,
  isEditing,
  onEdit,
  onCancel,
  onUpdate,
  onDelete,
  onSetActive,
}: {
  stream: any;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onUpdate: (data: any) => void;
  onDelete: () => void;
  onSetActive: () => void;
}) {
  const { data: status, refetch: refetchStatus } = trpc.streams.status.useQuery(
    { id: stream.id },
    { enabled: !isEditing, refetchInterval: 30000 }
  );

  if (isEditing) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Edit Stream</CardTitle>
        </CardHeader>
        <CardContent>
          <StreamForm
            stream={stream}
            onSubmit={(data) => {
              onUpdate(data);
            }}
            onCancel={onCancel}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-accent" />
            <CardTitle>{stream.name}</CardTitle>
            {stream.isActive && (
              <Badge variant="default" className="gradient-bg">
                Active
              </Badge>
            )}
            <Badge variant="outline">{stream.type}</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStatus()}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onSetActive} disabled={stream.isActive}>
              Set Active
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Public URL</Label>
            <p className="text-sm font-mono break-all">{stream.publicUrl}</p>
          </div>
          {stream.sourceHost && (
            <div>
              <Label className="text-xs text-muted-foreground">Source Host</Label>
              <p className="text-sm">{stream.sourceHost}:{stream.sourcePort || "N/A"}</p>
            </div>
          )}
        </div>

        {status && (
          <div className="flex items-center gap-4 p-3 rounded-lg border bg-card/50">
            <div className="flex items-center gap-2">
              {status.online ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-semibold">
                {status.online ? "Online" : "Offline"}
              </span>
            </div>
            {status.listeners !== undefined && (
              <span className="text-sm text-muted-foreground">
                {status.listeners} listeners
              </span>
            )}
            {status.nowPlaying && (
              <span className="text-sm text-muted-foreground flex-1 truncate">
                Now: {status.nowPlaying}
              </span>
            )}
            {status.error && (
              <span className="text-xs text-red-500">{status.error}</span>
            )}
          </div>
        )}

        <DJConnectionDetails stream={stream} />
      </CardContent>
    </Card>
  );
}

function DJConnectionDetails({ stream }: { stream: any }) {
  const copyConnectionText = () => {
    const text = `Streaming to Hectic Radio – ${stream.name}
Server: ${stream.sourceHost || "N/A"}
Port: ${stream.sourcePort || "N/A"}
Mount/Stream: ${stream.mount || "N/A"}
Type: ${stream.type}`;

    navigator.clipboard.writeText(text);
    toast.success("Connection details copied to clipboard");
  };

  if (!stream.sourceHost) {
    return null;
  }

  return (
    <div className="p-4 rounded-lg border bg-card/30">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">DJ Connection Details</h4>
        <Button variant="outline" size="sm" onClick={copyConnectionText}>
          <Copy className="w-4 h-4 mr-1" />
          Copy Profile
        </Button>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Server: </span>
          <span className="font-mono">{stream.sourceHost}:{stream.sourcePort}</span>
        </div>
        {stream.mount && (
          <div>
            <span className="text-muted-foreground">Mount: </span>
            <span className="font-mono">{stream.mount}</span>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">Protocol: </span>
          <span>{stream.type === "icecast" ? "Icecast" : stream.type === "shoutcast" ? "Shoutcast" : "Custom"}</span>
        </div>
        {stream.type === "icecast" && (
          <div>
            <span className="text-muted-foreground">Username: </span>
            <span>source</span>
          </div>
        )}
        {stream.adminPassword && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Password: </span>
            <span className="font-mono">•••••</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(stream.adminPassword);
                toast.success("Password copied");
              }}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StreamForm({
  stream,
  onSubmit,
  onCancel,
}: {
  stream?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: stream?.name || "",
    type: stream?.type || "icecast",
    publicUrl: stream?.publicUrl || "",
    sourceHost: stream?.sourceHost || "",
    sourcePort: stream?.sourcePort || undefined,
    mount: stream?.mount || "",
    adminApiUrl: stream?.adminApiUrl || "",
    adminUser: stream?.adminUser || "",
    adminPassword: stream?.adminPassword || "",
    isActive: stream?.isActive || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      sourcePort: formData.sourcePort ? parseInt(String(formData.sourcePort), 10) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Stream Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Stream Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(value: "shoutcast" | "icecast" | "custom") =>
            setFormData({ ...formData, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="icecast">Icecast</SelectItem>
            <SelectItem value="shoutcast">Shoutcast</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="publicUrl">Public Stream URL *</Label>
        <Input
          id="publicUrl"
          type="url"
          value={formData.publicUrl}
          onChange={(e) => setFormData({ ...formData, publicUrl: e.target.value })}
          placeholder="https://example.com:8000/stream"
          required
        />
        <p className="text-xs text-muted-foreground">
          URL used by the website audio player
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sourceHost">Source Host (optional)</Label>
          <Input
            id="sourceHost"
            value={formData.sourceHost}
            onChange={(e) => setFormData({ ...formData, sourceHost: e.target.value })}
            placeholder="stream.example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sourcePort">Source Port (optional)</Label>
          <Input
            id="sourcePort"
            type="number"
            value={formData.sourcePort || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                sourcePort: e.target.value ? parseInt(e.target.value, 10) : undefined,
              })
            }
            placeholder="8000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mount">Mount/Path (optional)</Label>
        <Input
          id="mount"
          value={formData.mount}
          onChange={(e) => setFormData({ ...formData, mount: e.target.value })}
          placeholder="/stream"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adminApiUrl">Admin API URL (optional)</Label>
        <Input
          id="adminApiUrl"
          type="url"
          value={formData.adminApiUrl}
          onChange={(e) => setFormData({ ...formData, adminApiUrl: e.target.value })}
          placeholder="http://example.com:8000/admin/stats"
        />
        <p className="text-xs text-muted-foreground">
          Used for status checks (listeners, now playing)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="adminUser">Admin Username (optional)</Label>
          <Input
            id="adminUser"
            value={formData.adminUser}
            onChange={(e) => setFormData({ ...formData, adminUser: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="adminPassword">Admin Password (optional)</Label>
          <Input
            id="adminPassword"
            type="password"
            value={formData.adminPassword}
            onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
          />
        </div>
      </div>

      {!stream && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
            Set as active stream
          </Label>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="gradient-bg">
          {stream ? "Update" : "Create"} Stream
        </Button>
      </div>
    </form>
  );
}

