import { useEffect, useState } from "react";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  name: string;
  date: string;
  time?: string;
  venue: string;
  city: string;
  state?: string;
  url: string;
  image?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface UpcomingEventsProps {
  maxEvents?: number;
  compact?: boolean;
}

export function UpcomingEvents({ maxEvents = 5, compact = false }: UpcomingEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/ticketmaster/events/upcoming");
        if (response.ok) {
          const data = await response.json();
          setEvents(data.slice(0, maxEvents));
        }
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 3600000); // Refresh every hour
    return () => clearInterval(interval);
  }, [maxEvents]);

  if (loading) {
    return (
      <div className="bg-[#0A0A0A] rounded-lg border border-[#333333] p-4">
        <p className="text-xs text-[#999999]">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-[#0A0A0A] rounded-lg border border-[#333333] p-4">
        <p className="text-xs text-[#999999]">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] rounded-lg border border-[#333333] p-4 space-y-4">
      <h3 className="text-sm font-bold text-white">🎪 UPCOMING EVENTS</h3>

      <div className="space-y-3">
        {events.map((event) => (
          <a
            key={event.id}
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg bg-[#1F1F1F] hover:bg-[#2F2F2F] transition border border-[#333333] hover:border-[#FF4444]"
          >
            {event.image && !compact && (
              <img
                src={event.image}
                alt={event.name}
                className="w-full h-32 object-cover rounded mb-2"
              />
            )}

            <p className="text-xs font-bold text-white truncate">{event.name}</p>

            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-2 text-xs text-[#999999]">
                <Calendar className="w-3 h-3" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
                {event.time && <span className="text-[#FF4444]">{event.time}</span>}
              </div>

              <div className="flex items-center gap-2 text-xs text-[#999999]">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {event.venue}, {event.city} {event.state}
                </span>
              </div>

              {event.minPrice && (
                <div className="flex items-center gap-2 text-xs text-[#FF4444]">
                  <Ticket className="w-3 h-3" />
                  <span>
                    ${event.minPrice} {event.maxPrice && event.maxPrice !== event.minPrice && `- $${event.maxPrice}`}
                  </span>
                </div>
              )}
            </div>

            {!compact && (
              <Button
                size="sm"
                className="w-full mt-3 h-7 text-xs bg-[#FF4444] text-white hover:bg-[#FF5555]"
              >
                Get Tickets
              </Button>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
