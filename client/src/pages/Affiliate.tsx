/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, TrendingUp, Gift, Users, Copy, CheckCircle, DollarSign, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Affiliate() {
  const [copied, setCopied] = useState(false);
  const referralCode = "HECTIC2024";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const commissionTiers = [
    {
      tier: "Bronze",
      commission: "10%",
      requirements: "0-10 referrals",
      benefits: ["10% commission", "Basic support", "Monthly reports"],
      icon: "🥉",
    },
    {
      tier: "Silver",
      commission: "15%",
      requirements: "11-50 referrals",
      benefits: ["15% commission", "Priority support", "Weekly reports", "Marketing materials"],
      icon: "🥈",
      featured: true,
    },
    {
      tier: "Gold",
      commission: "20%",
      requirements: "51+ referrals",
      benefits: ["20% commission", "VIP support", "Daily reports", "Custom materials", "Exclusive events"],
      icon: "🥇",
    },
  ];

  const stats = [
    { label: "Active Affiliates", value: "250+", icon: "👥" },
    { label: "Total Commissions Paid", value: "$50K+", icon: "💰" },
    { label: "Average Commission", value: "$200/mo", icon: "📈" },
    { label: "Top Earner", value: "$5K/mo", icon: "🏆" },
  ];

  const promotableItems = [
    {
      name: "Mixes & Tracks",
      commission: "20%",
      description: "Earn commission on every mix purchased",
      icon: "🎵",
    },
    {
      name: "Merchandise",
      commission: "15%",
      description: "Promote branded merchandise and apparel",
      icon: "👕",
    },
    {
      name: "DJ Lessons",
      commission: "25%",
      description: "Highest commission on private lessons",
      icon: "🎧",
    },
    {
      name: "Event Bookings",
      commission: "10%",
      description: "Earn from booking referrals",
      icon: "🎪",
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
            <Link href="/shop" className="text-sm hover:text-accent">Shop</Link>
            <Link href="/affiliate" className="text-sm hover:text-accent font-semibold text-accent">Affiliate</Link>
            <Link href="/contact" className="text-sm hover:text-accent">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-orange-900/20 to-background border-b border-border">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Affiliate Program</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-8">
            Earn generous commissions by promoting DJ Danny Hectic B's mixes, merchandise, and services.
          </p>
          <Link href="#join">
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-6 text-lg">
              Join the Program
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <Card key={idx} className="p-6 text-center">
                <div className="text-4xl mb-4">{stat.icon}</div>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold mb-12 text-center">How It Works</h2>
          <div className="space-y-6">
            {[
              {
                step: 1,
                title: "Sign Up",
                description: "Join our affiliate program and get your unique referral code and marketing materials.",
                icon: "📝",
              },
              {
                step: 2,
                title: "Promote",
                description: "Share your referral link on social media, blogs, or with your audience.",
                icon: "📢",
              },
              {
                step: 3,
                title: "Earn",
                description: "Get paid commissions every time someone purchases through your link.",
                icon: "💰",
              },
              {
                step: 4,
                title: "Grow",
                description: "As you earn more, unlock higher commission tiers and exclusive benefits.",
                icon: "📈",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                <div className="text-4xl">{item.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="py-16 md:py-24 border-t border-border bg-card/50">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12 text-center">Commission Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {commissionTiers.map((tier, idx) => (
              <Card
                key={idx}
                className={`p-8 flex flex-col ${
                  tier.featured
                    ? "border-2 border-orange-500 ring-2 ring-orange-500/20 relative"
                    : "border-border/50"
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <div className="text-5xl mb-4">{tier.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{tier.tier}</h3>
                <p className="text-4xl font-bold text-orange-400 mb-2">{tier.commission}</p>
                <p className="text-sm text-muted-foreground mb-6">{tier.requirements}</p>
                <ul className="space-y-3 flex-1 mb-6">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={
                    tier.featured
                      ? "w-full bg-gradient-to-r from-orange-600 to-amber-600"
                      : "w-full bg-card border border-border hover:border-accent"
                  }
                >
                  Join as {tier.tier}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Promotable Items */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12">What You Can Promote</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {promotableItems.map((item, idx) => (
              <Card key={idx} className="p-6 hover:border-accent transition text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <p className="text-2xl font-bold text-orange-400">{item.commission}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Code */}
      <section className="py-16 md:py-24 border-t border-border bg-gradient-to-r from-orange-900/20 to-amber-900/20">
        <div className="container max-w-2xl text-center space-y-6">
          <h2 className="text-4xl font-bold">Your Referral Code</h2>
          <p className="text-lg text-muted-foreground">
            Share this code with your audience to start earning commissions immediately.
          </p>
          <div className="flex items-center justify-center gap-3 bg-card border border-border rounded-lg p-4">
            <code className="text-2xl font-bold text-orange-400">{referralCode}</code>
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-background rounded transition"
            >
              {copied ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <Copy className="w-6 h-6 text-muted-foreground" />
              )}
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Use this code in your promotions: "Use code {referralCode} for exclusive DJ Danny content!"
          </p>
        </div>
      </section>

      {/* Marketing Materials */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold mb-12">Marketing Materials</h2>
          <div className="space-y-4">
            {[
              { name: "Social Media Graphics", icon: "🎨" },
              { name: "Email Templates", icon: "📧" },
              { name: "Blog Post Ideas", icon: "📝" },
              { name: "Video Scripts", icon: "🎬" },
              { name: "Banner Ads", icon: "🖼️" },
              { name: "Product Descriptions", icon: "📄" },
            ].map((material, idx) => (
              <Card key={idx} className="p-4 flex items-center justify-between hover:border-accent transition">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{material.icon}</span>
                  <span className="font-semibold">{material.name}</span>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 border-t border-border bg-card/50">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold mb-12 text-center">Affiliate FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "How often do I get paid?",
                a: "Commissions are paid monthly via PayPal or bank transfer on the 15th of each month.",
              },
              {
                q: "Is there a minimum payout?",
                a: "Yes, the minimum payout is $50. If you haven't reached $50, it rolls over to the next month.",
              },
              {
                q: "How long is the cookie duration?",
                a: "We use a 30-day cookie duration, so you earn commission on purchases made within 30 days of the click.",
              },
              {
                q: "Can I promote on social media?",
                a: "Absolutely! We encourage promotion on Instagram, TikTok, YouTube, and all social platforms.",
              },
              {
                q: "Do I need a website to join?",
                a: "No! You can promote through social media, email lists, or any other channel you have access to.",
              },
              {
                q: "What if someone returns a product?",
                a: "If a customer returns a product within 30 days, the commission is refunded.",
              },
            ].map((faq, idx) => (
              <details key={idx} className="group border border-border rounded-lg">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold hover:bg-background/50">
                  {faq.q}
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <div className="px-6 pb-6 text-muted-foreground border-t border-border">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="join" className="py-16 md:py-24 border-t border-border bg-gradient-to-r from-orange-900/20 to-amber-900/20">
        <div className="container max-w-3xl text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to Start Earning?</h2>
          <p className="text-lg text-muted-foreground">
            Join hundreds of affiliates already making money promoting DJ Danny Hectic B.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-6 text-lg">
              Apply Now
            </Button>
            <Link href="/contact">
              <Button variant="outline" className="px-8 py-6 text-lg">
                Ask Questions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
