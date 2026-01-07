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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Mic2, Video, ExternalLink, Calendar } from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";
import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = ["All", "Interviews", "Reviews", "Features", "Podcasts", "Videos"];

const pressItems = [
  {
    id: 1,
    title: "DJ Danny Hectic B: The Rise of UK Garage",
    type: "Feature",
    category: "Features",
    publication: "DJ Mag",
    date: "2024-01-15",
    excerpt: "An in-depth look at the journey and impact of DJ Danny Hectic B on the UK garage scene...",
    url: "https://djmag.com/example",
    icon: Newspaper,
  },
  {
    id: 2,
    title: "Exclusive Interview: Behind the Hectic Empire",
    type: "Interview",
    category: "Interviews",
    publication: "Mixmag",
    date: "2023-12-10",
    excerpt: "Sitting down with DJ Danny to discuss his latest releases, live shows, and future plans...",
    url: "https://mixmag.net/example",
    icon: Mic2,
  },
  {
    id: 3,
    title: "Hectic Radio: A New Era of Garage Broadcasting",
    type: "Review",
    category: "Reviews",
    publication: "Electronic Beats",
    date: "2023-11-20",
    excerpt: "Review of the Hectic Radio show and its impact on the garage music community...",
    url: "https://electronicbeats.net/example",
    icon: Newspaper,
  },
  {
    id: 4,
    title: "Podcast: The Garage Nation Story",
    type: "Podcast",
    category: "Podcasts",
    publication: "Garage Nation Podcast",
    date: "2023-10-05",
    excerpt: "A deep dive into the history and future of garage music with DJ Danny Hectic B...",
    url: "https://podcast.example.com",
    icon: Mic2,
  },
  {
    id: 5,
    title: "Video Interview: Studio Session",
    type: "Video",
    category: "Videos",
    publication: "Boiler Room",
    date: "2023-09-15",
    excerpt: "Exclusive studio session and interview showcasing the creative process...",
    url: "https://boilerroom.tv/example",
    icon: Video,
  },
  {
    id: 6,
    title: "Festival Review: Garage Nation 2023",
    type: "Review",
    category: "Reviews",
    publication: "Resident Advisor",
    date: "2023-08-30",
    excerpt: "Review of the epic Garage Nation festival performance and crowd reaction...",
    url: "https://residentadvisor.net/example",
    icon: Newspaper,
  },
];

export default function Press() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems = activeCategory === "All"
    ? pressItems
    : pressItems.filter(item => item.category === activeCategory);

  return (
    <>
      <MetaTagsComponent
        title="Press & Media | DJ Danny Hectic B"
        description="Press coverage, interviews, reviews, and media features about DJ Danny Hectic B."
        url="/press"
      />
      <div className="min-h-screen bg-background text-foreground pt-14">
        {/* Hero Section */}
        <section className="border-b border-foreground px-4 py-12 md:py-20">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">
              Press & Media
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Interviews, features, reviews, and media coverage from across the music industry.
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="sticky top-14 z-40 bg-background border-b border-foreground px-4 py-4">
          <div className="container max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 uppercase font-bold text-sm tracking-wider transition-colors",
                    activeCategory === cat
                      ? "bg-foreground text-background"
                      : "bg-transparent border border-foreground hover:bg-foreground hover:text-background"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Press Items Grid */}
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.id} className="flex flex-col hover:scale-[1.02] transition-transform">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Icon className="w-6 h-6 text-accent" />
                        <span className="text-xs font-bold uppercase bg-accent text-background px-2 py-1">
                          {item.type}
                        </span>
                      </div>
                      <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span className="font-semibold">{item.publication}</span>
                        <span>•</span>
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.date).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground mb-4 flex-1">
                        {item.excerpt}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(item.url, "_blank")}
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Read Full Article
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Media Kit CTA */}
        <section className="py-12 md:py-20 px-4 border-t border-foreground bg-muted/10">
          <div className="container max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-6">
              Media Inquiries
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Press, media, or booking inquiries? Get in touch for press kits, high-res images, and interview requests.
            </p>
            <a href="/contact">
              <Button size="lg">
                Contact for Media Kit
              </Button>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

