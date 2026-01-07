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
import { Music, Play, Clock, BarChart3, Download, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Tutorials() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const tutorials = [
    {
      id: 1,
      title: "Beatmatching 101: The Foundation",
      category: "Beginner",
      duration: "12 min",
      level: "Beginner",
      icon: "🎧",
      description: "Learn the basics of beatmatching and tempo synchronization.",
      views: "2.3K",
    },
    {
      id: 2,
      title: "Advanced EQ Techniques",
      category: "Advanced",
      duration: "18 min",
      level: "Advanced",
      icon: "🎛️",
      description: "Master the art of EQ mixing for professional-sounding sets.",
      views: "1.8K",
    },
    {
      id: 3,
      title: "Mixing House Music Like a Pro",
      category: "Intermediate",
      duration: "15 min",
      level: "Intermediate",
      icon: "🎵",
      description: "Techniques for smooth transitions in house music sets.",
      views: "3.1K",
    },
    {
      id: 4,
      title: "Garage Music Essentials",
      category: "Beginner",
      duration: "14 min",
      level: "Beginner",
      icon: "🔥",
      description: "Understanding the fundamentals of UK garage music.",
      views: "2.9K",
    },
    {
      id: 5,
      title: "Production Basics: Making Your First Track",
      category: "Production",
      duration: "20 min",
      level: "Beginner",
      icon: "🎹",
      description: "Start your music production journey with these essentials.",
      views: "4.2K",
    },
    {
      id: 6,
      title: "Scratching Techniques Explained",
      category: "Advanced",
      duration: "16 min",
      level: "Advanced",
      icon: "✨",
      description: "Learn turntablism and scratching techniques.",
      views: "2.1K",
    },
    {
      id: 7,
      title: "Reading the Crowd: Energy Management",
      category: "Intermediate",
      duration: "11 min",
      level: "Intermediate",
      icon: "👥",
      description: "How to read your audience and manage energy throughout your set.",
      views: "3.5K",
    },
    {
      id: 8,
      title: "Equipment Setup Guide",
      category: "Beginner",
      duration: "13 min",
      level: "Beginner",
      icon: "🎚️",
      description: "Complete guide to setting up your DJ equipment properly.",
      views: "2.7K",
    },
  ];

  const guides = [
    {
      title: "Complete DJ Starter Guide",
      description: "Everything you need to know to start your DJ journey",
      pages: "45 pages",
      icon: "📚",
    },
    {
      title: "Music Production Handbook",
      description: "In-depth guide to producing electronic music",
      pages: "62 pages",
      icon: "📖",
    },
    {
      title: "Mixing & Mastering Secrets",
      description: "Professional techniques for studio-quality sound",
      pages: "38 pages",
      icon: "🎚️",
    },
  ];

  const categories = ["All", "Beginner", "Intermediate", "Advanced", "Production"];
  const filteredTutorials = selectedCategory === "All" 
    ? tutorials 
    : tutorials.filter(t => t.category === selectedCategory);

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
            <Link href="/blog" className="text-sm hover:text-accent">Blog</Link>
            <Link href="/tutorials" className="text-sm hover:text-accent font-semibold text-accent">Tutorials</Link>
            <Link href="/bookings" className="text-sm hover:text-accent">Bookings</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-orange-900/20 to-background border-b border-border">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">DJ Tips & Tutorials</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Learn from DJ Danny Hectic B with video tutorials, guides, and expert tips on mixing, production, and performing.
          </p>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-4xl font-bold mb-8">Video Tutorials</h2>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white'
                    : 'bg-card border border-border hover:border-accent'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Tutorials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTutorials.map((tutorial) => (
              <Card
                key={tutorial.id}
                className="overflow-hidden hover:border-accent transition border-border/50 flex flex-col cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 p-6 text-5xl flex items-center justify-center h-40 group-hover:scale-105 transition-transform relative">
                  {tutorial.icon}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold mb-2 group-hover:text-accent transition">
                    {tutorial.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 flex-1">
                    {tutorial.description}
                  </p>

                  {/* Meta */}
                  <div className="space-y-2 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tutorial.duration}
                      </div>
                      <span className="text-orange-400">{tutorial.views} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        tutorial.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                        tutorial.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {tutorial.level}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable Guides */}
      <section className="py-16 md:py-24 border-t border-border bg-card/50">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12">Free Downloadable Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides.map((guide, idx) => (
              <Card key={idx} className="p-8 hover:border-accent transition text-center">
                <div className="text-6xl mb-4">{guide.icon}</div>
                <h3 className="text-xl font-bold mb-2">{guide.title}</h3>
                <p className="text-muted-foreground mb-4">{guide.description}</p>
                <p className="text-sm text-orange-400 font-semibold mb-6">{guide.pages}</p>
                <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold mb-12">Recommended Learning Path</h2>
          
          <div className="space-y-6">
            {[
              {
                step: 1,
                title: "Beginner Fundamentals",
                description: "Start with beatmatching, equipment setup, and basic mixing techniques",
                tutorials: 4,
              },
              {
                step: 2,
                title: "Intermediate Skills",
                description: "Learn advanced mixing, reading the crowd, and energy management",
                tutorials: 3,
              },
              {
                step: 3,
                title: "Advanced Techniques",
                description: "Master scratching, advanced EQ, and professional production",
                tutorials: 3,
              },
              {
                step: 4,
                title: "Professional Development",
                description: "Build your brand, marketing, and business strategies",
                tutorials: 2,
              },
            ].map((path) => (
              <Card key={path.step} className="p-6 hover:border-accent transition">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold">
                      {path.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{path.title}</h3>
                    <p className="text-muted-foreground mb-3">{path.description}</p>
                    <p className="text-sm text-orange-400 font-semibold">{path.tutorials} tutorials</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 border-t border-border bg-gradient-to-r from-orange-900/20 to-amber-900/20">
        <div className="container max-w-3xl text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to Level Up Your DJ Skills?</h2>
          <p className="text-lg text-muted-foreground">
            Book a private lesson with DJ Danny Hectic B for personalized training.
          </p>
          <Link href="/contact">
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-6 text-lg">
              Book a Lesson
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
