/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Star, Calendar } from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";

const awards = [
  {
    id: 1,
    title: "Best DJ - Garage Nation Awards",
    organization: "Garage Nation",
    year: 2023,
    category: "Performance",
    description: "Recognized for outstanding contributions to the UK garage scene",
    icon: Trophy,
  },
  {
    id: 2,
    title: "Radio Show of the Year",
    organization: "UK Radio Awards",
    year: 2023,
    category: "Broadcasting",
    description: "Hectic Radio show recognized for excellence in radio programming",
    icon: Award,
  },
  {
    id: 3,
    title: "Breakthrough Artist",
    organization: "Electronic Music Awards",
    year: 2022,
    category: "Achievement",
    description: "Awarded for significant impact in electronic music",
    icon: Star,
  },
  {
    id: 4,
    title: "Best Mix Series",
    organization: "Mixcloud Awards",
    year: 2023,
    category: "Content",
    description: "Hectic Beats mix series recognized for quality and consistency",
    icon: Trophy,
  },
  {
    id: 5,
    title: "Club DJ of the Month",
    organization: "DJ Mag",
    year: 2024,
    category: "Performance",
    description: "Featured as top club DJ for exceptional live performances",
    icon: Star,
  },
  {
    id: 6,
    title: "Community Impact Award",
    organization: "London Music Scene",
    year: 2023,
    category: "Community",
    description: "Recognized for contributions to the London music community",
    icon: Award,
  },
];

const achievements = [
  {
    title: "1M+ Streams",
    description: "Total streams across all platforms",
    icon: Star,
  },
  {
    title: "500+ Live Shows",
    description: "Performances at clubs, festivals, and events",
    icon: Trophy,
  },
  {
    title: "50+ Releases",
    description: "Original tracks, remixes, and collaborations",
    icon: Award,
  },
  {
    title: "10+ Years",
    description: "Dedicated to the UK garage and electronic music scene",
    icon: Calendar,
  },
];

export default function Awards() {
  return (
    <>
      <MetaTagsComponent
        title="Awards & Achievements | DJ Danny Hectic B"
        description="Recognition, awards, and achievements earned by DJ Danny Hectic B throughout his career."
        url="/awards"
      />
      <div className="min-h-screen bg-background text-foreground pt-14">
        {/* Hero Section */}
        <section className="border-b border-foreground px-4 py-12 md:py-20">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">
              Awards & Achievements
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Recognition and milestones achieved throughout an incredible journey in music.
            </p>
          </div>
        </section>

        {/* Achievements Stats */}
        <section className="py-12 md:py-20 px-4 border-b border-foreground">
          <div className="container max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-8 text-center">
              Milestones
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((achievement, idx) => {
                const Icon = achievement.icon;
                return (
                  <Card key={idx} className="text-center">
                    <CardHeader>
                      <Icon className="w-12 h-12 mx-auto mb-4 text-accent" />
                      <CardTitle className="text-2xl">{achievement.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{achievement.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Awards Grid */}
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-8 text-center">
              Awards & Recognition
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {awards.map((award) => {
                const Icon = award.icon;
                return (
                  <Card key={award.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Icon className="w-8 h-8 text-accent" />
                        <span className="text-xs font-bold uppercase bg-accent text-background px-2 py-1">
                          {award.year}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{award.title}</CardTitle>
                      <CardDescription className="font-semibold">
                        {award.organization}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="mb-4">
                        <span className="text-xs font-bold uppercase text-muted-foreground">
                          {award.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{award.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-20 px-4 border-t border-foreground bg-muted/10">
          <div className="container max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-6">
              Book an Award-Winning DJ
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Experience the quality that has earned recognition across the industry.
            </p>
            <a href="/book-danny">
              <button className="px-8 py-4 bg-foreground text-background hover:bg-accent hover:text-foreground uppercase font-bold transition-colors">
                Book Now
              </button>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

