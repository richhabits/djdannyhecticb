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
import { Music, Lock, Users, Gift, Star, Zap, MessageSquare, Download } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Members() {
  const [selectedTier, setSelectedTier] = useState("pro");

  const membershipTiers = [
    {
      id: "free",
      name: "Free Member",
      price: "$0",
      period: "Forever",
      description: "Get started with essential DJ content",
      features: [
        "Access to free mixes",
        "Monthly newsletter",
        "Event notifications",
        "Community forum access",
        "Basic tutorials",
      ],
      icon: "🎧",
    },
    {
      id: "pro",
      name: "Pro Member",
      price: "$9.99",
      period: "/month",
      description: "Unlock exclusive content and early access",
      features: [
        "All Free features",
        "Exclusive mixes & remixes",
        "Early access to new releases",
        "Private Discord community",
        "Advanced tutorials",
        "Monthly live Q&A sessions",
        "10% shop discount",
        "Exclusive merchandise",
      ],
      icon: "⭐",
      featured: true,
    },
    {
      id: "vip",
      name: "VIP Member",
      price: "$24.99",
      period: "/month",
      description: "Premium experience with personal perks",
      features: [
        "All Pro features",
        "1-on-1 DJ consultation (monthly)",
        "Custom mix requests",
        "VIP event invitations",
        "Behind-the-scenes content",
        "Exclusive studio sessions",
        "20% shop discount",
        "Priority support",
        "Lifetime access to all content",
      ],
      icon: "👑",
    },
  ];

  const exclusiveContent = [
    {
      title: "Unreleased Mixes",
      description: "Access to exclusive mixes not available anywhere else",
      icon: "🎵",
      available: "Pro+",
    },
    {
      title: "Studio Sessions",
      description: "Watch live studio sessions and production breakdowns",
      icon: "🎛️",
      available: "Pro+",
    },
    {
      title: "DJ Masterclasses",
      description: "In-depth masterclasses on advanced DJ techniques",
      icon: "🎓",
      available: "Pro+",
    },
    {
      title: "Private Community",
      description: "Connect with other DJs in our exclusive Discord",
      icon: "💬",
      available: "Pro+",
    },
    {
      title: "Early Releases",
      description: "Get new tracks and mixes 2 weeks early",
      icon: "⏰",
      available: "Pro+",
    },
    {
      title: "Merchandise",
      description: "Exclusive member-only merchandise and apparel",
      icon: "👕",
      available: "Pro+",
    },
    {
      title: "Q&A Sessions",
      description: "Monthly live Q&A with DJ Danny Hectic B",
      icon: "❓",
      available: "Pro+",
    },
    {
      title: "Custom Mixes",
      description: "Request custom mixes for your events",
      icon: "🎧",
      available: "VIP",
    },
  ];

  const communityFeatures = [
    {
      title: "Discord Community",
      description: "Join our private Discord server with 2000+ members",
      icon: "💬",
      members: "2,000+",
    },
    {
      title: "Weekly Meetups",
      description: "Virtual meetups every Friday at 8 PM GMT",
      icon: "🤝",
      members: "100+",
    },
    {
      title: "Collaboration Hub",
      description: "Connect with other DJs for collaborations",
      icon: "🎵",
      members: "500+",
    },
    {
      title: "Resource Library",
      description: "Access 1000+ DJ resources, samples, and templates",
      icon: "📚",
      members: "All",
    },
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
            <Link href="/blog" className="text-sm hover:text-accent">Blog</Link>
            <Link href="/members" className="text-sm hover:text-accent font-semibold text-accent">Members</Link>
            <Link href="/contact" className="text-sm hover:text-accent">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-orange-900/20 to-background border-b border-border">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Join the Community</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Get exclusive access to unreleased mixes, masterclasses, and connect with DJs worldwide.
          </p>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12 text-center">Choose Your Membership</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {membershipTiers.map((tier) => (
              <Card
                key={tier.id}
                className={`p-8 flex flex-col relative ${
                  tier.featured
                    ? "border-2 border-orange-500 ring-2 ring-orange-500/20"
                    : "border-border/50"
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <div className="text-5xl mb-4">{tier.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-orange-400">{tier.price}</span>
                  <span className="text-muted-foreground ml-2">{tier.period}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-orange-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => setSelectedTier(tier.id)}
                  className={
                    tier.featured
                      ? "w-full bg-gradient-to-r from-orange-600 to-amber-600"
                      : "w-full bg-card border border-border hover:border-accent"
                  }
                >
                  {tier.id === "free" ? "Join Free" : "Subscribe Now"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Exclusive Content */}
      <section className="py-16 md:py-24 border-t border-border bg-card/50">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12">Exclusive Member Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {exclusiveContent.map((content, idx) => (
              <Card key={idx} className="p-6 hover:border-accent transition">
                <div className="text-5xl mb-4">{content.icon}</div>
                <h3 className="text-lg font-bold mb-2">{content.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{content.description}</p>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-400">{content.available}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Features */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12">Community Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communityFeatures.map((feature, idx) => (
              <Card key={idx} className="p-8 hover:border-accent transition">
                <div className="flex items-start gap-6">
                  <div className="text-5xl">{feature.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <p className="text-sm font-semibold text-orange-400">{feature.members} members</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Member Stories */}
      <section className="py-16 md:py-24 border-t border-border bg-gradient-to-r from-orange-900/20 to-amber-900/20">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12 text-center">What Members Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Alex Chen",
                role: "Aspiring DJ",
                quote: "The masterclasses transformed my mixing skills. Worth every penny!",
                avatar: "👨‍💼",
              },
              {
                name: "Sarah Johnson",
                role: "Music Producer",
                quote: "The community is so supportive. I've made amazing connections here.",
                avatar: "👩‍💼",
              },
              {
                name: "Marcus Williams",
                role: "Club DJ",
                quote: "Exclusive mixes are fire! My sets have never sounded better.",
                avatar: "👨‍🎤",
              },
            ].map((story, idx) => (
              <Card key={idx} className="p-6">
                <div className="text-4xl mb-4">{story.avatar}</div>
                <p className="text-muted-foreground mb-4 italic">"{story.quote}"</p>
                <p className="font-bold">{story.name}</p>
                <p className="text-sm text-orange-400">{story.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Comparison */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12 text-center">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-bold">Feature</th>
                  <th className="text-center py-4 px-4 font-bold">Free</th>
                  <th className="text-center py-4 px-4 font-bold">Pro</th>
                  <th className="text-center py-4 px-4 font-bold">VIP</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Free Mixes", free: true, pro: true, vip: true },
                  { feature: "Exclusive Mixes", free: false, pro: true, vip: true },
                  { feature: "Masterclasses", free: false, pro: true, vip: true },
                  { feature: "Discord Access", free: false, pro: true, vip: true },
                  { feature: "Monthly Q&A", free: false, pro: true, vip: true },
                  { feature: "1-on-1 Consultation", free: false, pro: false, vip: true },
                  { feature: "Custom Mixes", free: false, pro: false, vip: true },
                  { feature: "VIP Events", free: false, pro: false, vip: true },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    <td className="py-4 px-4">{row.feature}</td>
                    <td className="text-center py-4 px-4">
                      {row.free ? "✓" : "✗"}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.pro ? "✓" : "✗"}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.vip ? "✓" : "✗"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 border-t border-border bg-gradient-to-r from-orange-900/20 to-amber-900/20">
        <div className="container max-w-3xl text-center space-y-6">
          <h2 className="text-4xl font-bold">Join 2000+ Members Today</h2>
          <p className="text-lg text-muted-foreground">
            Start your journey with exclusive content, community support, and expert guidance.
          </p>
          <Button className="bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-6 text-lg">
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
}
