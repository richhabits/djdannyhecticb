import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Music, Calendar, MapPin, Mail, Plus, Send, X, Zap } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { formatDate } from "date-fns";
import { toast } from "sonner";
import { BookingCalendar } from "@/components/BookingCalendar";

const GENRES = [
  { id: 'house', name: 'House', color: 'bg-white text-black', icon: '🎵' },
  { id: 'garage', name: 'Garage', color: 'bg-accent text-white', icon: '🔥' },
  { id: 'soulful', name: 'Soulful', color: 'bg-white text-black', icon: '💫' },
  { id: 'funky', name: 'Funky', color: 'bg-accent text-white', icon: '✨' },
  { id: 'grime', name: 'Grime', color: 'bg-black text-white border-white', icon: '⚡' },
  { id: 'amapiano', name: 'Amapiano', color: 'bg-white text-black', icon: '🎶' },
];

export default function Bookings() {
  const { isAuthenticated, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 pirate-scanlines">
        <div className="text-center space-y-8">
          <div className="tape-strip bg-accent text-white border-white text-4xl">ACCESS DENIED</div>
          <p className="text-xl font-bold uppercase">SIGN IN REQUIRED TO BOOK THE FREQUENCY</p>
          <Link href="/">
            <button className="tape-strip bg-white text-black border-black px-12 py-4 text-xl">BACK TO SIGNAL</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent pirate-scanlines pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">

        {/* HERO SECTION */}
        <section className="relative border-b-4 border-white pb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <div className="space-y-6">
              <div className="tape-strip bg-accent text-white border-white">ESTABLISHED 1994</div>
              <h1 className="text-8xl md:text-[12rem] font-black uppercase tracking-tighter leading-[0.75] italic">
                BOOKING<br />DESK
              </h1>
            </div>
            <div className="max-w-md space-y-4">
              <p className="text-lg font-bold uppercase bg-white text-black px-4 py-2 inline-block">SECURE THE SIGNAL</p>
              <p className="text-white/60 font-medium uppercase leading-tight">
                PROFESSIONAL AUDIO DELIVERY FOR CLUBS, FESTIVALS, AND PRIVATE OPS. FULL TECH RIDER AVAILABLE UPON REQUEST.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* LEFT: INFO & DATES */}
          <div className="lg:col-span-1 space-y-12">
            <div className="flyer-card p-8 space-y-6">
              <div className="tape-strip bg-white text-black border-black">LIVE_AVAILABILITY</div>
              <BookingCalendar
                selected={formData.eventDate ? new Date(formData.eventDate) : undefined}
                onSelect={(date) => setFormData({ ...formData, eventDate: date.toISOString() })}
              />
            </div>

            {bookings && bookings.length > 0 && (
              <div className="space-y-6">
                <div className="tape-strip bg-accent text-white border-white">ACTIVE_SESSIONS</div>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flyer-card p-6 flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="font-black italic text-xl uppercase">{booking.eventName}</h3>
                        <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                          {formatDate(new Date(booking.eventDate), 'MMM d, yyyy')} | {booking.eventLocation}
                        </p>
                      </div>
                      <div className={`tape-strip text-[10px] ${booking.status === 'confirmed' ? 'bg-green-500' : 'bg-white text-black'}`}>
                        {booking.status.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: THE BRUTAL FORM */}
          <div className="lg:col-span-2">
            <div className="bg-black border-4 border-white p-12 space-y-12 shadow-[20px_20px_0px_#F97316]">
              <div className="flex justify-between items-start">
                <div className="tape-strip bg-white text-black border-black text-2xl">INQUIRY_FORM_v2.0</div>
                <Zap className="w-8 h-8 text-accent animate-pulse" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-12 text-black">
                {/* GENRE SELECTOR */}
                <div className="space-y-6">
                  <label className="tape-strip bg-black text-white border-white text-xs">SELECT_SONIC_DIRECTION</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {GENRES.map((genre) => (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() => setSelectedGenres(prev =>
                          prev.includes(genre.id) ? prev.filter(g => g !== genre.id) : [...prev, genre.id]
                        )}
                        className={`p-6 border-2 font-black uppercase text-sm transition-all text-center flex flex-col items-center gap-2 ${selectedGenres.includes(genre.id)
                            ? "bg-accent border-black text-white scale-105 shadow-[4px_4px_0px_#000]"
                            : "bg-white border-black text-black hover:bg-neutral-100"
                          }`}
                      >
                        <span className="text-3xl italic">{genre.icon}</span>
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <input
                    required
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    className="w-full bg-white border-4 border-black p-4 font-black uppercase placeholder:text-black/30 outline-none focus:bg-accent focus:text-white"
                    placeholder="EVENT_NAME"
                  />
                  <select
                    required
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full bg-white border-4 border-black p-4 font-black uppercase outline-none focus:bg-accent focus:text-white"
                  >
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate</option>
                    <option value="club">Club/Bar Slot</option>
                    <option value="private">Private Party</option>
                    <option value="festival">Festival</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <input
                    required
                    value={formData.eventLocation}
                    onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                    className="w-full bg-white border-4 border-black p-4 font-black uppercase placeholder:text-black/30 outline-none focus:bg-accent focus:text-white"
                    placeholder="LOCATION_CITY_VENUE"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                      className="w-full bg-white border-4 border-black p-4 font-black uppercase placeholder:text-black/30 outline-none focus:bg-accent focus:text-white"
                      placeholder="GUESTS"
                    />
                    <input
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full bg-white border-4 border-black p-4 font-black uppercase placeholder:text-black/30 outline-none focus:bg-accent focus:text-white"
                      placeholder="BUDGET"
                    />
                  </div>
                </div>

                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border-4 border-black p-4 h-40 font-black uppercase placeholder:text-black/30 outline-none focus:bg-accent focus:text-white"
                  placeholder="SPECIFIC_REQUIREMENTS / VIBE_CHECK"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full bg-white border-4 border-black p-4 font-black uppercase placeholder:text-black/30 outline-none focus:bg-accent focus:text-white"
                    placeholder="EMAIL_IDENTITY"
                  />
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full bg-white border-4 border-black p-4 font-black uppercase placeholder:text-black/30 outline-none focus:bg-accent focus:text-white"
                    placeholder="PHONE_SIGNAL"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createBookingMutation.isPending}
                  className="w-full tape-strip bg-accent text-white border-white py-8 text-4xl hover:bg-black hover:border-white transition-all disabled:opacity-50"
                >
                  {createBookingMutation.isPending ? "LOGGING_SIGNAL..." : "SUBMIT_REQUEST_VOICE"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
