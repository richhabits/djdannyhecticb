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

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Music, Users, ExternalLink } from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const eventTypes = ["All", "Clubs", "Festivals", "Private Events", "Radio Shows", "Corporate"];

const pastEvents = [
  {
    id: 1,
    title: "Garage Nation Festival 2024",
    type: "Festival",
    date: "2024-06-15",
    location: "London, UK",
    venue: "Olympia London",
    attendance: "15,000+",
    description: "Headlining performance at the UK's premier garage music festival",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2670",
    highlights: ["Main stage performance", "2-hour set", "Live streaming"],
  },
  {
    id: 2,
    title: "Ministry of Sound Residency",
    type: "Clubs",
    date: "2024-05-20",
    location: "London, UK",
    venue: "Ministry of Sound",
    attendance: "1,500",
    description: "Weekly residency at one of London's most iconic clubs",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670",
    highlights: ["Weekly residency", "Sold out", "Featured mix series"],
  },
  {
    id: 3,
    title: "Tech Company Launch Party",
    type: "Corporate",
    date: "2024-04-10",
    location: "Manchester, UK",
    venue: "Manchester Central",
    attendance: "500",
    description: "Corporate event for major tech company product launch",
    image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2670",
    highlights: ["Corporate event", "Custom playlist", "Multi-room setup"],
  },
  {
    id: 4,
    title: "Hectic Radio Live Broadcast",
    type: "Radio Shows",
    date: "2024-03-25",
    location: "London, UK",
    venue: "Hectic Radio Studio",
    attendance: "Online",
    description: "Special live broadcast celebrating 100 episodes of Hectic Radio",
    image: "https://images.unsplash.com/photo-1603048588665-791ca8aea616?q=80&w=2670",
    highlights: ["100th episode", "Live Q&A", "Exclusive tracks"],
  },
  {
    id: 5,
    title: "Summer Wedding Reception",
    type: "Private Events",
    date: "2023-08-12",
    location: "Surrey, UK",
    venue: "Private Estate",
    attendance: "200",
    description: "Beautiful outdoor wedding reception with custom playlist",
    image: "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?q=80&w=2676",
    highlights: ["Outdoor setup", "Custom playlist", "Extended set"],
  },
  {
    id: 6,
    title: "New Year's Eve Party",
    type: "Clubs",
    date: "2023-12-31",
    location: "Birmingham, UK",
    venue: "The Rainbow Venues",
    attendance: "2,000",
    description: "Epic New Year's Eve celebration with countdown and special effects",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2670",
    highlights: ["NYE countdown", "Special effects", "Midnight mix"],
  },
];

export default function Portfolio() {
  const [activeType, setActiveType] = useState("All");

  const filteredEvents = activeType === "All"
    ? pastEvents
    : pastEvents.filter(e => e.type === activeType || (activeType === "Private Events" && e.type === "Private Events"));

  return (
    <>
      <MetaTagsComponent
        title="Portfolio & Past Work | DJ Danny Hectic B"
        description="Showcase of past events, performances, and work from DJ Danny Hectic B."
        url="/portfolio"
      />
      <div className="min-h-screen bg-background text-foreground pt-14">
        {/* Hero Section */}
        <section className="border-b border-foreground px-4 py-12 md:py-20">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">
              Portfolio & Past Work
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A showcase of memorable events, performances, and collaborations throughout the journey.
            </p>
          </div>
        </section>

        {/* Type Filter */}
        <section className="sticky top-14 z-40 bg-background border-b border-foreground px-4 py-4">
          <div className="container max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={cn(
                    "px-4 py-2 uppercase font-bold text-sm tracking-wider transition-colors",
                    activeType === type
                      ? "bg-foreground text-background"
                      : "bg-transparent border border-foreground hover:bg-foreground hover:text-background"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="group overflow-hidden hover:scale-[1.02] transition-transform">
                  <div className="relative aspect-video bg-black">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                    <div className="absolute top-2 right-2 bg-background/90 px-2 py-1 text-xs font-bold uppercase">
                      {event.type}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}</span>
                      <span>•</span>
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold mb-1">{event.venue}</p>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{event.attendance} attendees</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {event.highlights.map((highlight, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-muted px-2 py-1 rounded uppercase font-semibold"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 md:py-20 px-4 border-t border-foreground bg-muted/10">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-8 text-center">
              By The Numbers
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-black">500+</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Events Completed</CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-black">50+</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Venues Performed</CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-black">100K+</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Total Attendees</CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-black">10+</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Years Experience</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-20 px-4 border-t border-foreground">
          <div className="container max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-6">
              Be Part of the Story
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Book DJ Danny Hectic B for your next event and create unforgettable memories.
            </p>
            <a href="/book-danny">
              <Button size="lg">
                Book Your Event
              </Button>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

