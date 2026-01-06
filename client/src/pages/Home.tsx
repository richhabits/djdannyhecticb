/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Music, ArrowRight, Play, Disc } from "lucide-react";
import { APP_LOGO } from "@/const";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { MetaTagsComponent } from "@/components/MetaTags";
import { WebsiteStructuredData } from "@/components/StructuredData";
import { DannyStatus } from "@/components/DannyStatus";
import { HeroVideo } from "@/components/HeroVideo";
import { trpc } from "@/lib/trpc";
import { SocialLinks } from "@/components/SocialLinks";
import { GlobalSearch } from "@/components/GlobalSearch";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { data: activeStream } = trpc.streams.active.useQuery(undefined, { retry: false });

  return (
    <>
      <MetaTagsComponent
        title="HECTIC RADIO | RAW & UNCUT - DJ Danny Hectic B"
        description="DJ Danny Hectic B - Legendary UK Garage and House DJ. Live streams, mixes, events, and merchandise. 30+ years in the game."
        url="/"
        type="website"
        keywords="DJ Danny Hectic B, UK Garage, House Music, DJ, Music, Radio, Hectic Radio, Live Stream, Mixes, Events"
        canonical={typeof window !== "undefined" ? window.location.origin : "https://djdannyhecticb.co.uk"}
      />
      <WebsiteStructuredData
        name="Hectic Radio - DJ Danny Hectic B"
        description="Legendary UK Garage and House DJ. Live streams, mixes, events, and merchandise."
        url={typeof window !== "undefined" ? window.location.origin : "https://djdannyhecticb.co.uk"}
        potentialAction={{
          "@type": "SearchAction",
          target: `${typeof window !== "undefined" ? window.location.origin : "https://djdannyhecticb.co.uk"}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        }}
      />

      <div className="min-h-screen bg-background text-foreground pt-14">

        {/* HERO: Full Screen Video + Raw Text */}
        <section className="relative h-[calc(100vh-3.5rem)] w-full overflow-hidden flex flex-col justify-between border-b border-foreground">
          <HeroVideo
            videoUrl={import.meta.env.VITE_HERO_VIDEO_URL}
            className="absolute inset-0 grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay */}

          <div className="relative z-10 p-4 md:p-6 flex justify-between items-start">
            <div className="bg-background/90 p-2 border border-foreground inline-block">
              <p className="text-xs font-bold uppercase tracking-widest">Signal Status: <span className="text-green-500">ONLINE</span></p>
              <p className="text-xs font-bold uppercase tracking-widest">Loc: London, UK</p>
            </div>
            <DannyStatus />
          </div>

          <div className="relative z-10 p-4 md:p-6 pb-12 md:pb-20">
            <h1 className="text-[15vw] leading-[0.8] font-black uppercase tracking-tighter text-white mix-blend-difference mb-4">
              HECTIC<br />EMPIRE
            </h1>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <Link href="/mixes">
                <Button className="bg-white text-black text-lg h-auto py-4 px-8 border border-black hover:bg-accent hover:text-white uppercase font-bold tracking-wider rounded-none">
                  Start Listening
                </Button>
              </Link>
              <p className="text-white text-sm md:text-base font-medium max-w-md bg-black/50 p-2 backdrop-blur-sm">
                The underground isn't a place, it's a frequency. Lock in to 30 years of UK Garage & House culture.
              </p>
            </div>
          </div>
        </section>

        {/* UTILITY GRID: The Feed */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-foreground border-b border-foreground">

          {/* Item 1: Latest Drop */}
          <div className="bg-background aspect-square relative group cursor-pointer border-r border-foreground md:border-none">
            <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2670&auto=format&fit=crop"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-0" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity duration-0">
              <Play className="w-20 h-20 text-white fill-white" />
            </div>
            <div className="absolute top-0 left-0 bg-foreground text-background px-2 py-1 text-xs font-bold uppercase">
              Latest Drop
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-background border-t border-foreground p-3">
              <h3 className="font-bold uppercase truncated">Summer Vibes Vol. 4</h3>
            </div>
          </div>

          {/* Item 2: Shop Promo */}
          <div className="bg-background aspect-square flex flex-col justify-between p-6 hover:bg-accent hover:text-white transition-colors duration-0 cursor-pointer group">
            <Link href="/shop" className="h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h3 className="text-4xl font-black uppercase leading-none">Empire<br />Supply</h3>
                <ArrowRight className="w-8 h-8 -rotate-45 group-hover:rotate-0 transition-transform duration-0" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase border-t border-current pt-2 mt-4">New Merch Available</p>
                <p className="text-xs uppercase mt-1 opacity-70">Vinyl / Apparel / Digital</p>
              </div>
            </Link>
          </div>

          {/* Item 3: Live Status / Schedule */}
          <div className="bg-background aspect-square p-6 flex flex-col border-r border-foreground md:border-none">
            <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /> Live Feed
            </h3>
            <div className="flex-1 space-y-4 overflow-y-auto font-mono text-sm">
              <div className="border-b border-muted pb-2">
                <span className="text-xs opacity-50 block">20:00 GMT</span>
                <span className="font-bold">DJ Danny Hectic B</span>
                <span className="block text-xs uppercase">Garage Classics</span>
              </div>
              <div className="border-b border-muted pb-2">
                <span className="text-xs opacity-50 block">22:00 GMT</span>
                <span className="font-bold">Guest Mix: DJ EZ</span>
                <span className="block text-xs uppercase">UKG Special</span>
              </div>
              <div className="border-b border-muted pb-2">
                <span className="text-xs opacity-50 block">TOMORROW</span>
                <span className="font-bold">Morning Coffee</span>
                <span className="block text-xs uppercase">Deep House</span>
              </div>
            </div>
            <Link href="/live-studio">
              <Button className="w-full mt-4 rounded-none border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background uppercase font-bold">
                Tune In
              </Button>
            </Link>
          </div>

          {/* Item 4: Bio / Identity */}
          <div className="bg-background aspect-square relative group">
            <img src="/danny-main.jpg" className="w-full h-full object-cover grayscale contrast-125" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-3xl font-black uppercase leading-none text-foreground mb-2">30 Years<br />Deep</h2>
              <Link href="/bio" className="inline-block border-b-2 border-foreground hover:border-accent hover:text-accent font-bold uppercase text-lg">
                Read The Story
              </Link>
            </div>
          </div>

        </section>

        {/* Footer Area - Brutalist List */}
        <section className="p-6 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Connect</h4>
              <div className="flex flex-col gap-2 items-start">
                <a href="#" className="text-4xl md:text-6xl font-black uppercase hover:text-accent transition-colors duration-0">Instagram</a>
                <a href="#" className="text-4xl md:text-6xl font-black uppercase hover:text-accent transition-colors duration-0">TikTok</a>
                <a href="#" className="text-4xl md:text-6xl font-black uppercase hover:text-accent transition-colors duration-0">YouTube</a>
              </div>
            </div>
            <div className="flex flex-col justify-end items-start md:items-end">
              <p className="font-mono text-sm max-w-xs text-right mb-4">
                EST. 2024 London.<br />
                All Rights Reserved.<br />
                Hectic Empire Ltd.
              </p>
              <img src={APP_LOGO} className="w-16 h-16 grayscale opacity-50" />
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
