/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Radio, Trophy, Users, Zap, Star } from "lucide-react";
import { Link } from "wouter";

export default function History() {
  const piratRadioStations = [
    {
      name: "Pirate Radio Network UK",
      years: "1990s - 2000s",
      description: "Founded and operated multiple pirate radio stations across the UK, building a loyal listener base and establishing credibility in the garage and house music scene.",
      highlights: ["24/7 Broadcasting", "Live DJ Sets", "Community Building"],
    },
  ];

  const majorPromotions = [
    {
      name: "Twice as Nice",
      icon: "🎵",
      description: "One of the UK's most legendary garage promotion brands, known for bringing together the best garage DJs and producers.",
      role: "Featured DJ",
      impact: "Performed at packed venues across the UK, helping define the garage sound of the era.",
    },
    {
      name: "Garage Nation",
      icon: "🔥",
      description: "The definitive garage music promotion that dominated UK nightlife, showcasing the finest garage talent.",
      role: "Regular Performer",
      impact: "Built reputation as a go-to DJ for high-energy garage sets that kept crowds dancing all night.",
    },
    {
      name: "Garage Fever",
      icon: "💫",
      description: "Iconic garage promotion known for discovering and promoting emerging talent in the UK garage scene.",
      role: "Headlining DJ",
      impact: "Established as a key figure in the garage movement, known for innovative mixing and track selection.",
    },
  ];

  const timeline = [
    {
      year: "1990s",
      title: "The Beginning",
      description: "Started DJ career on pirate radio stations, learning the craft and building a reputation for quality mixes and audience connection.",
      icon: "🎧",
    },
    {
      year: "Late 90s",
      title: "Rise in UK Garage Scene",
      description: "Became a regular performer at Twice as Nice and Garage Nation, establishing himself as a key figure in the UK garage movement.",
      icon: "🚀",
    },
    {
      year: "2000s",
      title: "Peak Years",
      description: "Headlined major events, collaborated with legendary producers, and played to thousands of fans across the UK.",
      icon: "👑",
    },
    {
      year: "Present",
      title: "Legacy & Evolution",
      description: "Continuing to deliver high-energy performances, blending classic garage with modern house, soulful, and grime influences.",
      icon: "✨",
    },
  ];

  const achievements = [
    { label: "Years in Music", value: "30+" },
    { label: "Pirate Stations", value: "5+" },
    { label: "Major Promotions", value: "50+" },
    { label: "Events Performed", value: "1000+" },
  ];

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
            <Link href="/about" className="text-sm hover:text-accent">About</Link>
            <Link href="/mixes" className="text-sm hover:text-accent">Mixes</Link>
            <Link href="/events" className="text-sm hover:text-accent">Events</Link>
            <Link href="/live-studio" className="text-sm hover:text-accent">Live</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-orange-900/20 to-background border-b border-border">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">A Legacy Built on Sound</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            From pirate radio stations to the biggest UK garage promotions, DJ Danny Hectic B has been shaping the sound of British electronic music for over three decades.
          </p>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, idx) => (
              <Card key={idx} className="p-6 text-center">
                <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-2">
                  {achievement.value}
                </p>
                <p className="text-muted-foreground">{achievement.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold mb-12">Journey Through Time</h2>
          <div className="space-y-8">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <div className="w-1 h-20 bg-gradient-to-b from-orange-500 to-amber-500" />
                </div>
                <div className="pb-8">
                  <p className="text-sm font-bold text-orange-400 mb-1">{item.year}</p>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pirate Radio Section */}
      <section className="py-16 md:py-24 border-t border-border bg-card/50">
        <div className="container">
          <div className="flex items-center gap-3 mb-12">
            <Radio className="w-8 h-8 text-orange-400" />
            <h2 className="text-4xl font-bold">Pirate Radio Legacy</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {piratRadioStations.map((station, idx) => (
              <Card key={idx} className="p-8 border-orange-500/30">
                <h3 className="text-2xl font-bold mb-2">{station.name}</h3>
                <p className="text-orange-400 font-semibold mb-4">{station.years}</p>
                <p className="text-muted-foreground mb-6">{station.description}</p>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Key Highlights:</p>
                  <ul className="space-y-2">
                    {station.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-amber-400" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
            
            {/* Pirate Radio Impact */}
            <Card className="p-8 border-amber-500/30 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Impact & Influence</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-bold text-orange-400 mb-2">5+</p>
                  <p className="text-muted-foreground">Active Pirate Stations</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-400 mb-2">24/7</p>
                  <p className="text-muted-foreground">Continuous Broadcasting</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-400 mb-2">Thousands</p>
                  <p className="text-muted-foreground">Loyal Listeners</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Major Promotions */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container">
          <div className="flex items-center gap-3 mb-12">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h2 className="text-4xl font-bold">Legendary UK Promotions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {majorPromotions.map((promotion, idx) => (
              <Card key={idx} className="p-8 hover:border-accent transition border-border/50">
                <div className="text-5xl mb-4">{promotion.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{promotion.name}</h3>
                <p className="text-muted-foreground mb-4">{promotion.description}</p>
                
                <div className="space-y-3 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-orange-400 font-bold mb-1">ROLE</p>
                    <p className="font-semibold">{promotion.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-400 font-bold mb-1">IMPACT</p>
                    <p className="text-sm text-muted-foreground">{promotion.impact}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition */}
      <section className="py-16 md:py-24 border-t border-border bg-gradient-to-r from-orange-900/20 to-amber-900/20">
        <div className="container max-w-3xl">
          <div className="text-center space-y-6">
            <div className="flex justify-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              <Star className="w-6 h-6 text-yellow-400" />
              <Star className="w-6 h-6 text-yellow-400" />
              <Star className="w-6 h-6 text-yellow-400" />
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <h2 className="text-3xl font-bold">Recognized Pioneer</h2>
            <p className="text-lg text-muted-foreground">
              DJ Danny Hectic B is recognized as a pioneer in the UK garage scene, having played a crucial role in shaping the sound and culture of electronic music in Britain. From pirate radio to major promotions, his influence continues to inspire new generations of DJs and producers.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/bookings">
                <Button className="bg-gradient-to-r from-orange-600 to-amber-600">
                  Book for Your Event
                </Button>
              </Link>
              <Link href="/live-studio">
                <Button variant="outline">
                  Watch Live Sessions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Media & Press */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12">Featured In</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['BBC Radio', 'DJ Mag', 'Resident Advisor', 'Mixmag'].map((media, idx) => (
              <Card key={idx} className="p-6 text-center hover:border-accent transition">
                <p className="font-bold text-lg">{media}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
