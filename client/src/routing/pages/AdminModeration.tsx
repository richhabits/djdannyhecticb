import { useAuth } from "@/_core/hooks/useAuth";
import { DatabaseErrorBanner } from "@/components/DatabaseErrorBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
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
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  Shield,
  AlertTriangle,
  Trash2,
  Ban,
  VolumeX,
  AlertCircle,
  User,
  MoreVertical,
} from "lucide-react";

export default function AdminModeration() {
  const { user, isAuthenticated } = useAuth();
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<number | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [muteDialogOpen, setMuteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<string>("");
  const [muteDuration, setMuteDuration] = useState<string>("15");
  const [muteReason, setMuteReason] = useState("");

  const utils = trpc.useUtils();

  // Get live sessions
  const { data: sessions, isLoading: sessionsLoading } = trpc.live.sessions.useQuery();

  // Get messages for selected session
  const { data: messages, isLoading: messagesLoading } = trpc.moderation.getMessages.useQuery(
    { liveSessionId: selectedSession || 0, limit: 100 },
    { enabled: !!selectedSession }
  );

  // Get active moderation actions
  const { data: activeModerations } = trpc.moderation.getActiveModerationActions.useQuery(
    { liveSessionId: selectedSession || 0 },
    { enabled: !!selectedSession }
  );

  // Mutations
  const deleteMessage = trpc.moderation.deleteMessage.useMutation({
    onSuccess: () => {
      toast.success("Message deleted");
      utils.moderation.getMessages.invalidate();
      setDeletingMessage(null);
      setDeleteReason("");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to delete message";
      toast.error(message);
    },
  });

  const banUser = trpc.moderation.banUser.useMutation({
    onSuccess: () => {
      toast.success("User banned");
      utils.moderation.getActiveModerationActions.invalidate();
      setBanDialogOpen(false);
      setSelectedUser(null);
      setBanReason("");
      setBanDuration("");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to ban user";
      toast.error(message);
    },
  });

  const muteUser = trpc.moderation.muteUser.useMutation({
    onSuccess: () => {
      toast.success("User muted");
      utils.moderation.getActiveModerationActions.invalidate();
      setMuteDialogOpen(false);
      setSelectedUser(null);
      setMuteReason("");
      setMuteDuration("15");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to mute user";
      toast.error(message);
    },
  });

  const removeModeration = trpc.moderation.removeModeration.useMutation({
    onSuccess: () => {
      toast.success("Moderation removed");
      utils.moderation.getActiveModerationActions.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to remove moderation";
      toast.error(message);
    },
  });

  const handleDeleteMessage = (messageId: number) => {
    if (!selectedSession) return;
    deleteMessage.mutate({
      messageId,
      reason: deleteReason || undefined,
    });
  };

  const handleBanUser = (userId: number) => {
    if (!selectedSession) return;
    banUser.mutate({
      userId,
      liveSessionId: selectedSession,
      reason: banReason,
      duration: banDuration ? parseInt(banDuration) : undefined,
    });
  };

  const handleMuteUser = (userId: number) => {
    if (!selectedSession) return;
    muteUser.mutate({
      userId,
      liveSessionId: selectedSession,
      duration: parseInt(muteDuration) || 15,
      reason: muteReason || undefined,
    });
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
      <div className="container mx-auto py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-500" />
              <h1 className="text-4xl font-bold">Moderation Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Manage chat moderation, bans, mutes, and warnings
            </p>
          </div>

          {/* Session Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Live Session</CardTitle>
              <CardDescription>Choose a live session to moderate</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedSession?.toString() || ""} onValueChange={(val) => setSelectedSession(parseInt(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a session..." />
                </SelectTrigger>
                <SelectContent>
                  {sessions?.map((session: any) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.title} - {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedSession && (
            <>
              {/* Active Moderations */}
              {activeModerations && activeModerations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      Active Moderations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activeModerations.map((mod: any) => (
                        <div
                          key={mod.badge.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{mod.user?.displayName || mod.user?.email}</p>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  mod.badge.badgeType === "banned"
                                    ? "destructive"
                                    : mod.badge.badgeType === "muted"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {mod.badge.badgeType}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {mod.badge.metadata?.reason}
                              </span>
                              {mod.badge.expiresAt && (
                                <span className="text-sm text-muted-foreground">
                                  Expires {formatDistanceToNow(new Date(mod.badge.expiresAt), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeModeration.mutate({
                                badgeId: mod.badge.id,
                              })
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chat Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chat Messages</CardTitle>
                  <CardDescription>
                    Showing {messages?.length || 0} messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {messagesLoading ? (
                    <div className="text-center py-8">Loading messages...</div>
                  ) : messages && messages.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {messages.map((msg: any) => (
                        <div
                          key={msg.message.id}
                          className="flex items-start justify-between gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {msg.user?.displayName || msg.user?.email || "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(msg.message.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm break-words">{msg.message.message}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(msg.user);
                                setBanDialogOpen(true);
                              }}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(msg.user);
                                setMuteDialogOpen(true);
                              }}
                            >
                              <VolumeX className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingMessage(msg.message.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No messages in this session
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Delete Message Dialog */}
      <Dialog open={deletingMessage !== null} onOpenChange={(open) => !open && setDeletingMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason (optional)</label>
              <Input
                placeholder="e.g., Spam, Inappropriate content"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingMessage(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingMessage && handleDeleteMessage(deletingMessage)}
              loading={deleteMessage.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban {selectedUser?.displayName || selectedUser?.email} from this session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Input
                placeholder="e.g., Harassment, Spam"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Duration (minutes, leave empty for permanent)</label>
              <Input
                type="number"
                placeholder="e.g., 60"
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleBanUser(selectedUser.id)}
              loading={banUser.isPending}
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mute User Dialog */}
      <Dialog open={muteDialogOpen} onOpenChange={setMuteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mute User</DialogTitle>
            <DialogDescription>
              Mute {selectedUser?.displayName || selectedUser?.email} temporarily
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="number"
                placeholder="15"
                value={muteDuration}
                onChange={(e) => setMuteDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reason (optional)</label>
              <Input
                placeholder="e.g., Spam, Disruptive behavior"
                value={muteReason}
                onChange={(e) => setMuteReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMuteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedUser && handleMuteUser(selectedUser.id)}
              loading={muteUser.isPending}
            >
              Mute User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
