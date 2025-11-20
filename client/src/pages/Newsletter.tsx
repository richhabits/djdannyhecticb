import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Mail, Bell, Zap, Gift, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState("weekly");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    
    setTimeout(() => {
      toast.success("Welcome! Check your email for confirmation.");
      setEmail("");
      setIsSubscribing(false);
    }, 1500);
  };

  const benefits = [
    {
      icon: Music,
      title: "Exclusive Mixes",
      description: "Get first access to new mixes and unreleased tracks",
    },
    {
      icon: Zap,
      title: "DJ Tips",
      description: "Weekly DJ tips, tricks, and production insights",
    },
    {
      icon: Gift,
      title: "Special Offers",
      description: "Exclusive discounts and early access to sales",
    },
    {
      icon: TrendingUp,
      title: "Industry News",
      description: "Stay updated with the latest music industry trends",
    },
    {
      icon: Bell,
      title: "Event Updates",
      description: "Never miss upcoming events and live streams",
    },
    {
      icon: Mail,
      title: "Personal Stories",
      description: "Behind-the-scenes stories and personal updates",
    },
  ];

  const emailSequences = [
    {
      name: "Welcome Series",
      emails: 3,
      description: "Get to know DJ Danny Hectic B with an intro series",
      icon: "👋",
    },
    {
      name: "Weekly Mixes",
      emails: "Every week",
      description: "New mix recommendations and exclusive releases",
      icon: "🎵",
    },
    {
      name: "DJ Tips",
      emails: "Twice weekly",
      description: "Professional DJ tips and production techniques",
      icon: "🎧",
    },
    {
      name: "Event Alerts",
      emails: "As needed",
      description: "Notifications about upcoming events and bookings",
      icon: "🎪",
    },
    {
      name: "Exclusive Offers",
      emails: "Monthly",
      description: "Special promotions and member-only deals",
      icon: "🎁",
    },
    {
      name: "Community Highlights",
      emails: "Monthly",
      description: "Best moments from our community and members",
      icon: "⭐",
    },
  ];

  const testimonials = [
    {
      name: "Jordan Lee",
      role: "DJ & Producer",
      quote: "The weekly tips have improved my mixing significantly!",
      avatar: "👨‍💻",
    },
    {
      name: "Emma Davis",
      role: "Music Enthusiast",
      quote: "Love the exclusive mixes! Worth subscribing just for that.",
      avatar: "👩‍🎤",
    },
    {
      name: "Chris Martinez",
      role: "Club Owner",
      quote: "Great way to stay connected with the latest from Danny.",
      avatar: "👨‍💼",
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
            <Link href="/contact" className="text-sm hover:text-accent">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-purple-900/20 to-background border-b border-border">
        <div className="container max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Stay Connected</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Subscribe to get exclusive mixes, DJ tips, event updates, and special offers delivered to your inbox.
          </p>

          {/* Subscription Form */}
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="flex-1 px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3"
              >
                {isSubscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ✓ No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </form>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12 text-center">What You'll Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <Card key={idx} className="p-6 hover:border-accent transition">
                  <Icon className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Email Sequences */}
      <section className="py-16 md:py-24 border-t border-border bg-card/50">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12 text-center">Email Sequences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emailSequences.map((sequence, idx) => (
              <Card key={idx} className="p-6 hover:border-accent transition">
                <div className="text-5xl mb-4">{sequence.icon}</div>
                <h3 className="text-lg font-bold mb-2">{sequence.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{sequence.description}</p>
                <p className="text-sm font-semibold text-purple-400">{sequence.emails}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Frequency Selection */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container max-w-2xl">
          <h2 className="text-4xl font-bold mb-12 text-center">Choose Your Frequency</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: "daily", label: "Daily", description: "Get updates every day" },
              { id: "weekly", label: "Weekly", description: "Digest every Sunday" },
              { id: "monthly", label: "Monthly", description: "Summary each month" },
            ].map((freq) => (
              <button
                key={freq.id}
                onClick={() => setSelectedFrequency(freq.id)}
                className={`p-6 rounded-lg border-2 transition text-center ${
                  selectedFrequency === freq.id
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-border hover:border-accent"
                }`}
              >
                <p className="font-bold mb-2">{freq.label}</p>
                <p className="text-sm text-muted-foreground">{freq.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 border-t border-border bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12 text-center">What Subscribers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="p-6">
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                <p className="font-bold">{testimonial.name}</p>
                <p className="text-sm text-purple-400">{testimonial.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Subscribers", value: "5,000+" },
              { label: "Open Rate", value: "45%" },
              { label: "Click Rate", value: "12%" },
              { label: "Satisfaction", value: "98%" },
            ].map((stat, idx) => (
              <Card key={idx} className="p-6 text-center">
                <p className="text-3xl font-bold text-purple-400 mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 border-t border-border bg-card/50">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold mb-12 text-center">Newsletter FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "How often will I receive emails?",
                a: "It depends on your preference! You can choose daily, weekly, or monthly updates. You can also customize which types of emails you want to receive.",
              },
              {
                q: "Can I unsubscribe anytime?",
                a: "Absolutely! Every email has an unsubscribe link at the bottom. You can also manage your preferences in your account settings.",
              },
              {
                q: "Will you share my email?",
                a: "Never. We take your privacy seriously. Your email is only used for our newsletter and will never be shared with third parties.",
              },
              {
                q: "What if I miss an email?",
                a: "All newsletters are archived in your account dashboard. You can access past emails anytime.",
              },
              {
                q: "Can I customize what I receive?",
                a: "Yes! In your preferences, you can choose which topics interest you most and adjust your frequency.",
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

      {/* Final CTA */}
      <section className="py-16 md:py-24 border-t border-border bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="container max-w-3xl text-center space-y-6">
          <h2 className="text-4xl font-bold">Join 5,000+ Subscribers</h2>
          <p className="text-lg text-muted-foreground">
            Get exclusive content, DJ tips, and special offers delivered to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              className="px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto"
            />
            <Button
              type="submit"
              disabled={isSubscribing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3"
            >
              {isSubscribing ? "Subscribing..." : "Subscribe Now"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
