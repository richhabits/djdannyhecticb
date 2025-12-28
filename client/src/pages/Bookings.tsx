import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Music, Calendar, MapPin, Users, Mail, Phone, Plus, Send, MessageCircle, Facebook, Instagram, Music2, Zap, Heart, Radio, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { formatDate } from "date-fns";
import { toast } from "sonner";
import { BookingCalendar } from "@/components/BookingCalendar";

const GENRES = [
  { id: 'house', name: 'House', color: 'from-orange-500 to-orange-500', icon: '🎵' },
  { id: 'garage', name: 'Garage', color: 'from-orange-500 to-red-500', icon: '🔥' },
  { id: 'soulful', name: 'Soulful House', color: 'from-amber-500 to-amber-500', icon: '💫' },
  { id: 'funky', name: 'Funky House', color: 'from-yellow-500 to-orange-500', icon: '✨' },
  { id: 'grime', name: 'Grime', color: 'from-gray-700 to-black', icon: '⚡' },
  { id: 'amapiano', name: 'Amapiano', color: 'from-green-500 to-teal-500', icon: '🎶' },
];

const BOOKING_METHODS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-orange-600', description: 'Message via Facebook' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-amber-600', description: 'DM on Instagram' },
  { id: 'tiktok', name: 'TikTok', icon: Music2, color: 'bg-black', description: 'Comment on TikTok' },
  { id: 'form', name: 'Direct Form', icon: Mail, color: 'bg-orange-600', description: 'Fill booking form' },
];

export default function Bookings() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'dj'; message: string; time: string }>>([
    { sender: 'dj', message: '👋 Hey! Welcome to DJ Danny Hectic B bookings! What event are you planning?', time: '2:30 PM' },
  ]);
  const [chatInput, setChatInput] = useState('');

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
      toast.success("🎉 Booking request created! DJ Danny will get back to you soon!");
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
    if (selectedGenres.length === 0) {
      toast.error("Please select at least one music genre!");
      return;
    }
    createBookingMutation.mutate({
      eventName: formData.eventName,
      eventDate: new Date(formData.eventDate),
      eventLocation: formData.eventLocation,
      eventType: formData.eventType,
      guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
      budget: formData.budget,
      description: formData.description + "\nGenres: " + selectedGenres.join(", "),
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
    });
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage = {
      sender: 'user' as const,
      message: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');

    // Simulate DJ response
    setTimeout(() => {
      const responses = [
        "Sounds amazing! 🔥 Tell me more about your event.",
        "I love that vibe! What's your budget range?",
        "Perfect! When are you looking to book?",
        "That's my specialty! Let me check my calendar.",
        "Awesome! I can definitely bring that energy! 🎵",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages(prev => [...prev, {
        sender: 'dj',
        message: randomResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1000);
  };

  const handleSocialBooking = (method: string) => {
    const socialLinks = {
      facebook: 'https://www.facebook.com/djdannyhecticb',
      instagram: 'https://www.instagram.com/djdannyhecticb',
      tiktok: 'https://www.tiktok.com/@djdannyhecticb',
    };

    if (socialLinks[method as keyof typeof socialLinks]) {
      window.open(socialLinks[method as keyof typeof socialLinks], '_blank');
      toast.success(`Opening ${method}! Send DJ Danny a message about your booking.`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Sign In Required</h1>
          <p className="text-muted-foreground">Please sign in to view and create bookings.</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600">
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
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
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

      <div className="flex gap-6 p-6 md:p-8 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-900/40 via-amber-900/40 to-black p-8 md:p-12 border border-orange-500/20">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-screen filter blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500 rounded-full mix-blend-screen filter blur-3xl" />
            </div>

            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Book DJ Danny Hectic B 🎵</h1>
              <p className="text-lg text-gray-300 mb-6">
                Ready to bring the heat to your event? Choose your favorite genres and let's make it happen!
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start Booking
                </Button>
                <Button variant="outline">
                  View Pricing
                </Button>
              </div>
            </div>
          </div>

          {/* Social Booking Methods */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Quick Book on Social Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {BOOKING_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => method.id !== 'form' ? handleSocialBooking(method.id) : setShowForm(true)}
                    className="group relative overflow-hidden rounded-xl p-6 text-left transition-all hover:scale-105"
                  >
                    <div className={`absolute inset-0 ${method.color} opacity-20 group-hover:opacity-30 transition`} />
                    <div className="relative z-10 space-y-3">
                      <Icon className="w-8 h-8" />
                      <div>
                        <h3 className="font-bold text-lg">{method.name}</h3>
                        <p className="text-sm text-gray-400">{method.description}</p>
                      </div>
                      <div className="text-xs font-semibold text-orange-400">Click to book →</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Booking Form */}
          {showForm && (
            <Card className="p-8 border-orange-500/30 bg-card/50 backdrop-blur">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Event Details</h2>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-card rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Genre Selection */}
                <div>
                  <label className="block text-sm font-bold mb-4">Select Your Vibe(s) 🎶</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {GENRES.map((genre) => (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() => setSelectedGenres(prev =>
                          prev.includes(genre.id)
                            ? prev.filter(g => g !== genre.id)
                            : [...prev, genre.id]
                        )}
                        className={`p-4 rounded-lg font-semibold transition-all transform hover:scale-105 ${selectedGenres.includes(genre.id)
                            ? `bg-gradient-to-r ${genre.color} text-white shadow-lg`
                            : 'bg-card border border-border hover:border-accent'
                          }`}
                      >
                        <span className="text-xl mr-2">{genre.icon}</span>
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.eventName}
                      onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., Summer House Party"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Type *</label>
                    <select
                      required
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  <div className="md:col-span-1">
                    <BookingCalendar
                      selected={formData.eventDate ? new Date(formData.eventDate) : undefined}
                      onSelect={(date) => setFormData({ ...formData, eventDate: date.toISOString() })}
                    />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Location *</label>
                      <input
                        type="text"
                        required
                        value={formData.eventLocation}
                        onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="City, Venue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Guest Count</label>
                      <input
                        type="number"
                        value={formData.guestCount}
                        onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Estimated guests"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Budget</label>
                      <input
                        type="text"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., $500-$1000"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tell us about your event</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="What's the vibe? Any special requests?"
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
                      className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={createBookingMutation.isPending}
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                  >
                    {createBookingMutation.isPending ? "Submitting..." : "🎉 Submit Booking"}
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
          )}

          {/* Your Bookings */}
          {bookings && bookings.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Bookings</h2>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="p-6 hover:border-accent transition border-border/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{booking.eventName}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-400" />
                            {formatDate(new Date(booking.eventDate), 'EEEE, MMMM d, yyyy h:mm a')}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-amber-400" />
                            {booking.eventLocation}
                          </div>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                        }`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Chat Sidebar */}
        <div className={`fixed bottom-0 right-0 top-0 w-full md:w-96 bg-card border-l border-border flex flex-col transition-transform ${showChat ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:relative md:top-auto md:bottom-auto md:right-auto`}>
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">DJ Danny Hectic B</h3>
                <p className="text-xs text-white/80">Usually replies in minutes</p>
              </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="md:hidden p-1 hover:bg-white/20 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === 'user'
                    ? 'bg-orange-600 text-white rounded-br-none'
                    : 'bg-card border border-border text-foreground rounded-bl-none'
                  }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about booking..."
                className="flex-1 px-3 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center">💬 Chat with DJ Danny now!</p>
          </div>
        </div>

        {/* Chat Toggle Button (Mobile) */}
        {!showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="fixed bottom-4 right-4 md:hidden w-14 h-14 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 flex items-center justify-center text-white shadow-lg z-30"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
