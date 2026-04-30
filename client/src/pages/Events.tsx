import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Link } from "wouter";
import { formatDate } from "date-fns";
import { BackButton } from "@/components/BackButton";

export default function Events() {
  const { data: events, isLoading } = trpc.events.upcoming.useQuery();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-16">

        {/* Back Button */}
        <BackButton />

        {/* Header */}
        <section className="relative border-b-4 border-white pb-8">
          <div className="tape-strip bg-accent text-white border-white mb-6 inline-block">LIVE_CALENDAR</div>
          <h1 className="text-8xl md:text-[12rem] font-black uppercase tracking-tighter leading-[0.75] italic">
            EVENTS<br />SCHEDULE
          </h1>
        </section>

        {/* Events List */}
        <section>
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flyer-card p-6 animate-pulse">
                  <div className="h-6 bg-white/20 w-1/3 mb-4" />
                  <div className="h-4 bg-white/20 w-full mb-2" />
                  <div className="h-4 bg-white/20 w-2/3" />
                </div>
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <div className="space-y-6">
              {events.map((event) => (
                <div key={event.id} className="flyer-card p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Event Image */}
                    {(event.imageUrl) && (
                      <div className="md:col-span-1">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-150"
                        />
                      </div>
                    )}

                    {/* Event Details */}
                    <div className={`md:col-span-${event.imageUrl ? 2 : 3} flex flex-col justify-between`}>
                      <div className="space-y-4">
                        <h3 className="text-4xl font-black uppercase italic leading-tight">{event.title}</h3>
                        {event.description && (
                          <p className="text-white/70 text-lg">{event.description}</p>
                        )}

                        <div className="space-y-2 text-sm font-mono">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-accent" />
                            <span className="font-black uppercase">
                              {formatDate(new Date(event.eventDate), 'EEEE, MMMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-accent" />
                            <span className="font-black uppercase">{event.location}</span>
                          </div>
                          {event.price && (
                            <div className="flex items-center gap-3">
                              <Ticket className="w-5 h-5 text-accent" />
                              <span className="font-black uppercase">{event.price}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        {event.ticketUrl ? (
                          <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <button className="tape-strip bg-white text-black border-black w-full py-3 text-lg hover:bg-accent hover:text-white transition-all duration-150">
                              GET_TICKETS
                            </button>
                          </a>
                        ) : (
                          <button className="tape-strip bg-white text-black border-black flex-1 py-3 text-lg opacity-50 cursor-not-allowed">
                            COMING_SOON
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flyer-card p-12 text-center space-y-6">
              <Calendar className="w-16 h-16 text-accent mx-auto" />
              <div>
                <p className="text-3xl font-black uppercase mb-2">NO EVENTS SCHEDULED</p>
                <p className="text-white/60 font-mono uppercase">Check back soon for upcoming gigs and appearances</p>
              </div>
            </div>
          )}
        </section>

        {/* Newsletter CTA */}
        <section className="border-t-4 border-white pt-16 text-center">
          <div className="space-y-8">
            <div>
              <p className="tape-strip bg-accent text-white border-white mb-6 inline-block">STAY_LOCKED_IN</p>
              <h2 className="text-4xl font-black uppercase mb-4">Never Miss A Transmission</h2>
              <p className="text-white/60 font-mono uppercase mb-8">Get event notifications sent straight to your inbox</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 border-2 border-white bg-black text-white placeholder-white/40 font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-accent"
              />
              <button className="tape-strip bg-white text-black border-black px-8 py-3 hover:bg-accent hover:text-white transition-all duration-150">
                NOTIFY_ME
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
