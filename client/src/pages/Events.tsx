import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Music, Calendar, MapPin, Ticket } from "lucide-react";
import { Link } from "wouter";
import { formatDate } from "date-fns";

export default function Events() {
  const { data: events, isLoading } = trpc.events.upcoming.useQuery();

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
            <Link href="/events" className="text-sm font-medium text-accent">Events</Link>
            <Link href="/live-studio" className="text-sm hover:text-accent">Live</Link>
            <Link href="/podcasts" className="text-sm hover:text-accent">Podcast</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-orange-900/20 to-background border-b border-border">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Check out where DJ Danny Hectic B will be performing next. Book tickets and don't miss the beat!
          </p>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16 md:py-24">
        <div className="container">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="flex gap-6">
                    <div className="w-48 h-48 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-4">
                      <div className="h-6 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <div className="space-y-6">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:border-accent transition">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                    {/* Event Image */}
                    <div className="md:col-span-1">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-white/50" />
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="md:col-span-3 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold mb-4">{event.title}</h3>
                        {event.description && (
                          <p className="text-muted-foreground mb-6 line-clamp-2">{event.description}</p>
                        )}

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-5 h-5 text-orange-400" />
                            <span>{formatDate(new Date(event.eventDate), 'EEEE, MMMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <MapPin className="w-5 h-5 text-amber-400" />
                            <span>{event.location}</span>
                          </div>
                          {event.price && (
                            <div className="flex items-center gap-3 text-sm">
                              <Ticket className="w-5 h-5 text-orange-400" />
                              <span>{event.price}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {event.ticketUrl ? (
                          <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-gradient-to-r from-orange-600 to-amber-600">
                              <Ticket className="w-4 h-4 mr-2" />
                              Get Tickets
                            </Button>
                          </a>
                        ) : (
                          <Button className="bg-gradient-to-r from-orange-600 to-amber-600">
                            <Ticket className="w-4 h-4 mr-2" />
                            Coming Soon
                          </Button>
                        )}
                        <Button variant="outline">
                          Add to Calendar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No upcoming events. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-orange-900/30 to-amber-900/30 border-t border-border">
        <div className="container max-w-2xl text-center space-y-6">
          <h2 className="text-3xl font-bold">Stay Updated</h2>
          <p className="text-lg text-muted-foreground">
            Subscribe to get notified about upcoming events and special performances.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
