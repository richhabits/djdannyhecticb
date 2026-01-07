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

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Award, Users, Radio } from "lucide-react";
import { Link } from "wouter";

export default function About() {
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
            <Link href="/podcasts" className="text-sm hover:text-accent">Podcast</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-orange-900/20 to-background border-b border-border">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About DJ Danny Hectic B</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Professional DJ with a passion for creating unforgettable musical experiences.
          </p>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg blur-xl opacity-50" />
                <img
                  src="/dj-danny-bio.jpg"
                  alt="DJ Danny Hectic B"
                  className="relative w-full max-w-md rounded-lg shadow-2xl"
                />
              </div>
            </div>

            {/* Bio Text */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">The Artist</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  DJ Danny Hectic B is a dynamic and innovative DJ known for his electrifying performances and seamless mixing abilities. With years of experience in the music industry, Danny has built a reputation for delivering high-energy sets that keep crowds engaged and dancing all night long.
                </p>
                <p className="text-lg text-muted-foreground mb-4">
                  Specializing in electronic, house, and hip-hop music, DJ Danny Hectic B brings a unique blend of classic hits and contemporary tracks to every performance. His technical expertise and creative approach to mixing make him a sought-after DJ for weddings, corporate events, clubs, and private parties.
                </p>
                <p className="text-lg text-muted-foreground">
                  Beyond the turntables, Danny is passionate about connecting with his audience through music and creating memorable moments that last a lifetime. His dedication to his craft and genuine love for music shine through in every set.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Link href="/bookings">
                  <Button className="bg-gradient-to-r from-orange-600 to-amber-600">
                    Book DJ Danny
                  </Button>
                </Link>
                <Link href="/live-studio">
                  <Button variant="outline">
                    Watch Live
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 md:py-24 bg-card/50 border-t border-border">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose DJ Danny Hectic B?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2">Professional Experience</h3>
              <p className="text-sm text-muted-foreground">
                Years of experience performing at top venues and events
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Music className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="font-semibold mb-2">Diverse Music Selection</h3>
              <p className="text-sm text-muted-foreground">
                Wide range of genres to match any event vibe
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2">Audience Engagement</h3>
              <p className="text-sm text-muted-foreground">
                Keeps crowds energized and entertained all night
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Radio className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Professional Equipment</h3>
              <p className="text-sm text-muted-foreground">
                State-of-the-art sound and lighting systems
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-bold mb-12">Experience & Expertise</h2>
          <div className="space-y-8">
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-xl font-semibold mb-2">Wedding & Event DJ</h3>
              <p className="text-muted-foreground mb-2">
                Specializing in creating the perfect atmosphere for your special day. From ceremony music to reception entertainment, DJ Danny ensures every moment is memorable.
              </p>
              <p className="text-sm text-muted-foreground">Events: Weddings, Anniversaries, Engagements, Receptions</p>
            </div>

            <div className="border-l-4 border-amber-500 pl-6">
              <h3 className="text-xl font-semibold mb-2">Club & Nightlife DJ</h3>
              <p className="text-muted-foreground mb-2">
                High-energy performances at clubs, bars, and nightlife venues. Known for reading the crowd and delivering sets that keep the dance floor packed.
              </p>
              <p className="text-sm text-muted-foreground">Venues: Clubs, Bars, Lounges, Nightclubs</p>
            </div>

            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-xl font-semibold mb-2">Corporate Events</h3>
              <p className="text-muted-foreground mb-2">
                Professional DJ services for corporate parties, product launches, conferences, and company celebrations. Adaptable to any corporate environment.
              </p>
              <p className="text-sm text-muted-foreground">Events: Parties, Conferences, Launches, Celebrations</p>
            </div>

            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-semibold mb-2">Private Parties</h3>
              <p className="text-muted-foreground mb-2">
                Customized DJ services for birthdays, anniversaries, graduations, and intimate gatherings. Personalized music selection to match your vision.
              </p>
              <p className="text-sm text-muted-foreground">Events: Birthdays, Anniversaries, Graduations, Gatherings</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-orange-900/30 to-amber-900/30 border-t border-border">
        <div className="container max-w-2xl text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Book?</h2>
          <p className="text-lg text-muted-foreground">
            Let DJ Danny Hectic B bring the energy and excitement to your next event.
          </p>
          <Link href="/bookings">
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-6 text-lg">
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
