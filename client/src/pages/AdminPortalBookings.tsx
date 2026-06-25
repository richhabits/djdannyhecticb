import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
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
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Link } from "wouter";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  enquiry: "bg-yellow-600",
  confirmed: "bg-blue-600",
  completed: "bg-green-600",
  cancelled: "bg-red-600",
};

export default function AdminPortalBookings() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: bookings, isLoading } = trpc.portal.bookings.listAll.useQuery();
  const [notesDraft, setNotesDraft] = useState<{ id: number; notes: string } | null>(null);

  const updateStatus = trpc.portal.bookings.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Booking updated");
      utils.portal.bookings.listAll.invalidate();
      setNotesDraft(null);
    },
    onError: (error) => toast.error(error.message || "Failed to update booking"),
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Admin Access Required</h1>
          <Link href="/">
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Portal Bookings
          </h1>
          <p className="text-muted-foreground mt-2">Review and manage client booking enquiries</p>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Loading bookings...</p>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Date & Location</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings && bookings.length > 0 ? (
                    bookings.map(({ booking, client }) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">{client.name || client.email}</div>
                          <Badge variant="outline" className="capitalize mt-1">{client.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.eventType}</div>
                          {booking.venue && <div className="text-sm text-muted-foreground">{booking.venue}</div>}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{format(new Date(booking.eventDate), "PP")}</div>
                          <div className="text-sm text-muted-foreground">{booking.location}</div>
                        </TableCell>
                        <TableCell>{booking.budget ? `£${booking.budget}` : "-"}</TableCell>
                        <TableCell>
                          <Select
                            value={booking.status}
                            onValueChange={(value) => updateStatus.mutate({ id: booking.id, status: value as any, notes: booking.notes ?? undefined })}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="enquiry">Enquiry</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setNotesDraft({ id: booking.id, notes: booking.notes ?? "" })}
                          >
                            {booking.notes ? "Edit Note" : "Add Note"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No bookings found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={notesDraft !== null} onOpenChange={(open) => { if (!open) setNotesDraft(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Note to Client</DialogTitle>
              <DialogDescription>This will be visible to the client on their booking.</DialogDescription>
            </DialogHeader>
            <Textarea
              value={notesDraft?.notes ?? ""}
              onChange={(e) => setNotesDraft((d) => d && { ...d, notes: e.target.value })}
              rows={5}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setNotesDraft(null)}>Cancel</Button>
              <Button
                disabled={updateStatus.isPending}
                onClick={() => {
                  const booking = bookings?.find((b) => b.booking.id === notesDraft?.id)?.booking;
                  if (!notesDraft || !booking) return;
                  updateStatus.mutate({ id: notesDraft.id, status: booking.status as any, notes: notesDraft.notes });
                }}
                className="bg-gradient-to-r from-orange-600 to-amber-600"
              >
                Save Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
