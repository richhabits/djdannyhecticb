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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Mail, Phone, MapPin, Edit, Trash2, ExternalLink } from "lucide-react";

export default function AdminBookings() {
  const { user, isAuthenticated } = useAuth();
  const [editingBooking, setEditingBooking] = useState<number | null>(null);
  const [viewingBooking, setViewingBooking] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: bookings, isLoading } = trpc.bookings.list.useQuery();

  const updateBooking = trpc.bookings.update.useMutation({
    onSuccess: () => {
      toast.success("Booking updated");
      utils.bookings.list.invalidate();
      setEditingBooking(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update booking";
      toast.error(message);
    },
  });

  const deleteBooking = trpc.bookings.delete.useMutation({
    onSuccess: () => {
      toast.success("Booking deleted");
      utils.bookings.list.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to delete booking";
      toast.error(message);
    },
  });

  const handleStatusChange = (id: number, status: string) => {
    updateBooking.mutate({ id, status: status as any });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      deleteBooking.mutate({ id });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-600";
      case "completed":
        return "bg-blue-600";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-yellow-600";
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Manage Bookings
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage DJ booking requests
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date & Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings && bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">{booking.name}</div>
                          {booking.organisation && (
                            <div className="text-sm text-muted-foreground">
                              {booking.organisation}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {booking.email}
                            </div>
                            {booking.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {booking.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-3 h-3" />
                              {booking.eventDate
                                ? format(new Date(booking.eventDate), "MMM d, yyyy")
                                : "-"}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {booking.location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{booking.eventType || "N/A"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={booking.status || "pending"}
                            onValueChange={(value) => handleStatusChange(booking.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(booking.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingBooking(booking)}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(booking.id)}
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
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No bookings found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* View Booking Dialog */}
        <Dialog open={viewingBooking !== null} onOpenChange={(open) => {
          if (!open) setViewingBooking(null);
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>Full booking information</DialogDescription>
            </DialogHeader>
            {viewingBooking && (
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Event Name</Label>
                  <div className="font-medium">{viewingBooking.eventName || viewingBooking.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Contact Email</Label>
                    <div>{viewingBooking.contactEmail || viewingBooking.email}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Phone</Label>
                    <div>{viewingBooking.contactPhone || viewingBooking.phone || "-"}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Event Date</Label>
                    <div>
                      {viewingBooking.eventDate
                        ? format(new Date(viewingBooking.eventDate), "MMM d, yyyy 'at' h:mm a")
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Event Type</Label>
                    <div>{viewingBooking.eventType || "-"}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Location</Label>
                  <div>{viewingBooking.eventLocation || viewingBooking.location}</div>
                </div>
                {viewingBooking.budgetRange && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Budget Range</Label>
                    <div>{viewingBooking.budgetRange}</div>
                  </div>
                )}
                {viewingBooking.extraNotes && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Notes</Label>
                    <div className="whitespace-pre-wrap">{viewingBooking.extraNotes}</div>
                  </div>
                )}
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(viewingBooking.status)}>
                    {viewingBooking.status}
                  </Badge>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingBooking(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

