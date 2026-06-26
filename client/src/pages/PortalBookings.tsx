import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { PortalNav } from "@/components/PortalNav";
import { PortalGuard } from "@/components/PortalGuard";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  enquiry: "bg-yellow-600",
  confirmed: "bg-blue-600",
  completed: "bg-green-600",
  cancelled: "bg-red-600",
};

function BookingsContent() {
  const utils = trpc.useUtils();
  const { data: bookings } = trpc.portal.bookings.listMine.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    eventType: "",
    eventDate: "",
    venue: "",
    location: "",
    duration: "",
    budget: "",
    requirements: "",
  });

  const create = trpc.portal.bookings.create.useMutation({
    onSuccess: () => {
      toast.success("Booking enquiry submitted!");
      utils.portal.bookings.listMine.invalidate();
      setShowForm(false);
      setForm({ eventType: "", eventDate: "", venue: "", location: "", duration: "", budget: "", requirements: "" });
    },
    onError: (error) => toast.error(error.message || "Failed to submit booking"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({
      eventType: form.eventType,
      eventDate: new Date(form.eventDate),
      venue: form.venue || undefined,
      location: form.location,
      duration: form.duration || undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      requirements: form.requirements || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-6xl mx-auto">
      <PortalNav />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Bookings</h1>
        <Button onClick={() => setShowForm((v) => !v)} className="bg-gradient-to-r from-orange-600 to-amber-600">
          {showForm ? "Cancel" : "New Booking Enquiry"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 glass mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Input id="eventType" required value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} className="mt-1" placeholder="Club night, wedding, brand activation..." />
              </div>
              <div>
                <Label htmlFor="eventDate">Event Date</Label>
                <Input id="eventDate" type="date" required value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input id="venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1" placeholder="City, country" />
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="mt-1" placeholder="e.g. 3 hours" />
              </div>
              <div>
                <Label htmlFor="budget">Budget (£)</Label>
                <Input id="budget" type="number" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className="mt-1" rows={4} />
            </div>
            <Button type="submit" disabled={create.isPending} className="bg-gradient-to-r from-orange-600 to-amber-600">
              {create.isPending ? "Submitting..." : "Submit Enquiry"}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {bookings?.map((b) => (
          <Card key={b.id} className="p-6 glass">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold">{b.eventType}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(b.eventDate), "PPP")} {b.venue && `· ${b.venue}`} · {b.location}
                </p>
              </div>
              <Badge className={STATUS_COLORS[b.status]}>{b.status}</Badge>
            </div>
            {b.requirements && <p className="text-sm mt-3">{b.requirements}</p>}
            {b.notes && (
              <div className="mt-3 p-3 rounded-lg bg-muted/30 text-sm">
                <span className="font-semibold">Note from Danny: </span>{b.notes}
              </div>
            )}
          </Card>
        ))}
        {!bookings?.length && !showForm && (
          <p className="text-center text-muted-foreground py-12">No bookings yet. Submit your first enquiry above.</p>
        )}
      </div>
    </div>
  );
}

export default function PortalBookings() {
  return (
    <PortalGuard>
      <BookingsContent />
    </PortalGuard>
  );
}
