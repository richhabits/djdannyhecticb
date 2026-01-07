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

import { ShoutForm } from "@/components/ShoutForm";
import { TrackRequests } from "@/components/TrackRequests";
import { NowPlaying } from "@/components/NowPlaying";
import { ShowSchedule } from "@/components/ShowSchedule";
import { HecticHotline } from "@/components/HecticHotline";
import { LockedInCounter } from "@/components/LockedInCounter";
import { SocialShareBar } from "@/components/SocialShareBar";
import { SocialLinks } from "@/components/SocialLinks";
import { MetaTagsComponent } from "@/components/MetaTags";
import { LiveChatDanny } from "@/components/LiveChatDanny";
import { trpc } from "@/lib/trpc";
import { Music, Radio } from "lucide-react";

export default function Live() {
  const { data: activeStream } = trpc.streams.active.useQuery(undefined, { retry: false });

  return (
    <>
      <MetaTagsComponent
        title="Hectic Radio - Live | DJ Danny Hectic B"
        description="Lock in with DJ Danny Hectic B on Hectic Radio. Listen live, request tracks, send shouts, and vibe with the crew."
        url="/live"
        type="music.radio_station"
      />
      <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-900/20 via-background to-background py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-orange-700/5" />
        <div className="container relative z-10">
          <div className="text-center space-y-6 md:space-y-8 px-4">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full glass border border-accent/50 text-sm text-accent font-semibold flex items-center gap-2 justify-center">
                <Radio className="w-4 h-4" />
                LIVE NOW on Hectic Radio
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              <span className="gradient-text">Hectic Radio</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Lock in with DJ Danny Hectic B. Request tracks, send shouts, and vibe with the crew.
            </p>
            <div className="flex justify-center">
              <LockedInCounter />
            </div>
            {activeStream && (
              <p className="text-sm text-muted-foreground">
                Currently streaming: <span className="font-semibold text-accent">{activeStream.name}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Now Playing */}
          <div className="lg:col-span-1">
            <NowPlaying />
          </div>

          {/* Track Requests */}
          <div className="lg:col-span-2">
            <TrackRequests />
          </div>
          
          {/* AI Chat */}
          <div className="lg:col-span-1">
            <LiveChatDanny />
          </div>
          
          {/* Show Schedule */}
          <div className="lg:col-span-2">
            <ShowSchedule />
          </div>
        </div>

        {/* Shout Form + Hotline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ShoutForm />
          <div className="flex items-center justify-center">
            <HecticHotline />
          </div>
        </div>

        {/* Social Share */}
        <div className="mb-8">
          <SocialShareBar
            url="/live"
            title="Hectic Radio - Live with DJ Danny Hectic B"
            description="Lock in and vibe with the crew. Listen live, request tracks, and send shouts!"
            className="justify-center"
          />
        </div>

        {/* Social Links */}
        <div className="mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">Follow Hectic Radio</p>
          <SocialLinks variant="compact" className="justify-center" />
        </div>
      </div>
      </div>
    </>
  );
}

