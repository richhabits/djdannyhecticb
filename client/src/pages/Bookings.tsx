import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Music, Calendar, MapPin, Users, Mail, Phone, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { formatDate } from "date-fns";
import { toast } from "sonner";

export default function Bookings() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    eventLocation: "",
    eventType: "wedding",
    guestCount: "",
    budget: "",
    description: "",
    contactEmail: user?.email || "",
    contactPhone: "",
  });

  const { data: bookings, isLoading, refetch } = trpc.bookings.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const createBookingMutation = trpc.bookings.create.useMutation({
    onSuccess: () => {
      toast.success("Booking request created successfully!");
      setShowForm(false);
      setFormData({
        eventName: "",
        eventDate: "",
        eventLocation: "",
        eventType: "wedding",
        guestCount: "",
        budget: "",
        description: "",
        contactEmail: user?.email || "",
        contactPhone: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to create booking: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBookingMutation.mutate({
      eventName: formData.eventName,
      eventDate: new Date(formData.eventDate),
      eventLocation: formData.eventLocation,
      eventType: formData.eventType,
      guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
      budget: formData.budget,
      description: formData.description,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Sign In Required</h1>
          <p className="text-muted-foreground">Please sign in to view and create bookings.</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Music className="w-6 h-6" />
            <span className="font-bold">DJ Danny Hectic B</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/mixes" className="text-sm hover:text-accent">Mixes</Link>
            <Link href="/events" className="text-sm hover:text-accent">Events</Link>
            <Link href="/live-studio" className="text-sm hover:text-accent">Live</Link>
            <Link href="/bookings" className="text-sm font-medium text-accent">Bookings</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-purple-900/20 to-background border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Book DJ Danny</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Request DJ Danny Hectic B for your next event. Professional, energetic performances guaranteed.
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      {showForm && (
        <section className="py-12 border-b border-border bg-card/50">
          <div className="container max-w-2xl">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Booking Request Form</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.eventName}
                      onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="e.g., Wedding Reception"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Type *</label>
                    <select
                      required
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="wedding">Wedding</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="club">Club/Bar</option>
                      <option value="private">Private Party</option>
                      <option value="festival">Festival</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Date *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Location *</label>
                    <input
                      type="text"
                      required
                      value={formData.eventLocation}
                      onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="City, Venue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Guest Count</label>
                    <input
                      type="number"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Estimated guests"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Budget</label>
                    <input
                      type="text"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="e.g., $500-$1000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Tell us more about your event..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={createBookingMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {createBookingMutation.isPending ? "Submitting..." : "Submit Booking Request"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </section>
      )}

      {/* Bookings List */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">Your Booking Requests</h2>
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="h-6 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="p-6 hover:border-accent transition">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">{booking.eventName}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="w-5 h-5 text-purple-400" />
                          <span>{formatDate(new Date(booking.eventDate), 'EEEE, MMMM d, yyyy h:mm a')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="w-5 h-5 text-pink-400" />
                          <span>{booking.eventLocation}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Users className="w-5 h-5 text-blue-400" />
                          <span>{booking.eventType}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                            booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            booking.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        {booking.guestCount && (
                          <div>
                            <p className="text-sm text-muted-foreground">Guests: {booking.guestCount}</p>
                          </div>
                        )}
                        {booking.budget && (
                          <div>
                            <p className="text-sm text-muted-foreground">Budget: {booking.budget}</p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-4">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          {booking.status === 'pending' && (
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg mb-6">No booking requests yet.</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Booking
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
