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
import { Switch } from "@/components/ui/switch";
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
import { MessageSquare, CheckCircle, XCircle, MessageCircle } from "lucide-react";
import { normalizePhoneForWhatsApp } from "@/lib/phoneUtils";

export default function AdminShouts() {
  const { user, isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<{
    approved?: boolean;
    readOnAir?: boolean;
    trackRequestsOnly?: boolean;
  }>({});

  const utils = trpc.useUtils();
  const { data: shouts, isLoading } = trpc.shouts.listAll.useQuery(filters);

  const updateStatus = trpc.shouts.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Shout status updated");
      utils.shouts.listAll.invalidate();
      utils.shouts.list.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update shout status";
      toast.error(message);
    },
  });

  const updateTrackStatus = trpc.trackRequests.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Track request status updated");
      utils.shouts.listAll.invalidate();
      utils.trackRequests.list.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update track status";
      toast.error(message);
    },
  });

  const handleToggleApproved = (id: number, currentValue: boolean) => {
    updateStatus.mutate({
      id,
      approved: !currentValue,
    });
  };

  const handleToggleReadOnAir = (id: number, currentValue: boolean) => {
    updateStatus.mutate({
      id,
      readOnAir: !currentValue,
    });
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
      <div className="container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">
            Shout Management
          </h1>
          <p className="text-muted-foreground">
            Manage fan shouts, approve messages, and track what's been read on air.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 glass">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button
                variant={filters.approved === undefined ? "default" : "outline"}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    approved: f.approved === undefined ? undefined : undefined,
                  }))
                }
              >
                All Shouts
              </Button>
              <Button
                variant={filters.approved === true ? "default" : "outline"}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    approved: f.approved === true ? undefined : true,
                  }))
                }
              >
                Approved Only
              </Button>
              <Button
                variant={filters.approved === false ? "default" : "outline"}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    approved: f.approved === false ? undefined : false,
                  }))
                }
              >
                Pending Approval
              </Button>
              <Button
                variant={filters.readOnAir === false ? "default" : "outline"}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    readOnAir: f.readOnAir === false ? undefined : false,
                  }))
                }
              >
                Not Read On Air
              </Button>
              <Button
                variant={filters.trackRequestsOnly ? "default" : "outline"}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    trackRequestsOnly: f.trackRequestsOnly ? undefined : true,
                  }))
                }
              >
                Track Requests Only
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shouts Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Shouts ({shouts?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading shouts...</p>
            ) : !shouts || shouts.length === 0 ? (
              <p className="text-muted-foreground">No shouts found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Track</TableHead>
                        <TableHead>Votes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>WhatsApp</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Approved</TableHead>
                        <TableHead>Read On Air</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shouts.map((shout) => (
                      <TableRow key={shout.id}>
                        <TableCell className="font-medium">
                          {shout.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {shout.location || "-"}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="truncate" title={shout.message}>
                            {shout.message}
                          </p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {shout.isTrackRequest && shout.trackTitle ? (
                            <div>
                              <p className="font-medium">{shout.trackTitle}</p>
                              {shout.trackArtist && (
                                <p className="text-xs text-muted-foreground">{shout.trackArtist}</p>
                              )}
                            </div>
                          ) : (
                            shout.trackRequest || "-"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {shout.isTrackRequest ? (
                            <span className="font-semibold text-accent">{shout.votes || 0}</span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {shout.isTrackRequest && shout.trackStatus ? (
                            <Select
                              value={shout.trackStatus}
                              onValueChange={(value: "pending" | "queued" | "played") => {
                                updateTrackStatus.mutate({ id: shout.id, status: value });
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="queued">Queued</SelectItem>
                                <SelectItem value="played">Played</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {shout.phone || "-"}
                        </TableCell>
                        <TableCell>
                          {shout.phone && shout.whatsappOptIn ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gradient-bg hover-lift"
                              asChild
                            >
                              <a
                                href={`https://wa.me/${normalizePhoneForWhatsApp(shout.phone)}?text=${encodeURIComponent(
                                  `Yo ${shout.name}, it's Danny from Hectic Radio. Got your shout: "${shout.message.substring(0, 100)}${shout.message.length > 100 ? "..." : ""}" – you're locked in fam.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                WhatsApp
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(shout.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={shout.approved}
                              onCheckedChange={() =>
                                handleToggleApproved(shout.id, shout.approved)
                              }
                              disabled={updateStatus.isPending}
                            />
                            {shout.approved ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={shout.readOnAir}
                              onCheckedChange={() =>
                                handleToggleReadOnAir(
                                  shout.id,
                                  shout.readOnAir
                                )
                              }
                              disabled={updateStatus.isPending || !shout.approved}
                            />
                            {shout.readOnAir && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const fullMessage = `Name: ${shout.name}\nLocation: ${shout.location || "N/A"}\nMessage: ${shout.message}\nTrack Request: ${shout.trackRequest || "N/A"}\nCan Read On Air: ${shout.canReadOnAir ? "Yes" : "No"}`;
                              navigator.clipboard.writeText(fullMessage);
                              toast.success("Shout details copied to clipboard");
                            }}
                          >
                            Copy
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

