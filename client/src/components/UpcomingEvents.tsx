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
  soldOut?: boolean;
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${dayName}, ${formatted}`;
  };

  const formatPrice = (min?: number, max?: number) => {
    if (!min) return null;
    if (max && max !== min) {
      return `$${min}–$${max}`;
    }
    return `$${min}`;
  };

  if (loading) {
    return (
      <div className="bg-dark-surface rounded-lg border border-border-primary p-md">
        <p className="text-caption text-text-secondary">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-dark-surface rounded-lg border border-border-primary p-md">
        <p className="text-caption text-text-secondary">No upcoming events</p>
      </div>
    );
  }

  return (
    <div
      className="bg-dark-surface rounded-lg border border-border-primary p-md space-y-md"
      role="region"
      aria-label="Upcoming DJ Danny Hectic B events"
    >
      <h3 className="text-body font-bold text-white">
        <span aria-hidden="true">🎪</span> Upcoming Events
      </h3>

      <div
        className="grid grid-cols-1 gap-md tablet:grid-cols-2 desktop:grid-cols-2 wide:grid-cols-3"
        role="list"
      >
        {events.map((event) => {
          const eventDate = new Date(event.date);
          const formattedDate = formatDate(event.date);
          const fullEventDescription = `${event.name} - ${event.venue}, ${event.city}${event.state ? ` ${event.state}` : ''} on ${formattedDate}${event.time ? ` at ${event.time}` : ''}`;

          return (
            <a
              key={event.id}
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-lg border border-border-primary bg-dark-bg hover:border-accent-red hover:shadow-lg transition-all duration-base overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-red"
              role="listitem"
              aria-label={`${event.soldOut ? 'Sold Out: ' : ''}Get tickets for ${fullEventDescription}`}
            >
              {/* Image with zoom effect */}
              {event.image && !compact && (
                <div className="relative overflow-hidden bg-dark-bg">
                  <img
                    src={event.image}
                    alt={`${event.name} - ${event.venue}`}
                    loading="lazy"
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-base"
                  />
                  {event.soldOut && (
                    <div
                      className="absolute inset-0 bg-black/60 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <p className="text-body font-bold text-white">Sold Out</p>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex flex-col flex-1 p-md space-y-sm">
                {/* Event name */}
                <p className="text-body font-bold text-white truncate group-hover:text-accent-red transition-colors duration-base">
                  {event.name}
                </p>

                {/* Details */}
                <div className="space-y-xs flex-1">
                  {/* Date */}
                  <div
                    className="flex items-center gap-xs text-caption text-text-secondary"
                    title={eventDate.toLocaleDateString()}
                  >
                    <Calendar
                      className="w-4 h-4 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>{formattedDate}</span>
                  </div>

                  {/* Time */}
                  {event.time && (
                    <div
                      className="text-caption text-text-secondary"
                      title={`Event starts at ${event.time}`}
                    >
                      {event.time}
                    </div>
                  )}

                  {/* Venue */}
                  <div className="flex items-start gap-xs text-caption text-text-secondary">
                    <MapPin
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      {event.venue}, {event.city} {event.state}
                    </span>
                  </div>

                  {/* Price */}
                  {event.minPrice && (
                    <div className="flex items-center gap-xs text-caption font-semibold text-accent-red pt-xs">
                      <Ticket
                        className="w-4 h-4 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>{formatPrice(event.minPrice, event.maxPrice)}</span>
                    </div>
                  )}
                </div>

                {/* Button */}
                {!compact && (
                  <Button
                    size="sm"
                    disabled={event.soldOut}
                    className="w-full mt-md h-10 text-caption font-bold bg-accent-red text-white hover:bg-red-600 border-0 transition-all duration-base hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-red"
                    aria-label={`${event.soldOut ? 'Sold out: ' : ''}Get tickets for ${fullEventDescription}`}
                  >
                    {event.soldOut ? "Sold Out" : "Get Tickets"}
                  </Button>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
