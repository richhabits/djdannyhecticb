import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Link as LinkIcon, Check, Zap, Users, Share2, Gift, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Integrations() {
  const [connectedServices, setConnectedServices] = useState<string[]>([]);

  const handleConnect = (service: string) => {
    if (connectedServices.includes(service)) {
      setConnectedServices(connectedServices.filter(s => s !== service));
      toast.success(`Disconnected from ${service}`);
    } else {
      setConnectedServices([...connectedServices, service]);
      toast.success(`Connected to ${service}!`);
    }
  };

  const socialLogins = [
    { name: "Google", icon: "🔍", color: "from-orange-500 to-orange-600", description: "Sign in with Google account" },
    { name: "Facebook", icon: "📘", color: "from-orange-600 to-orange-700", description: "Connect with Facebook friends" },
    { name: "Apple", icon: "🍎", color: "from-gray-800 to-black", description: "Sign in with Apple ID" },
    { name: "Spotify", icon: "🎵", color: "from-green-500 to-green-600", description: "Sync your music taste" },
    { name: "Instagram", icon: "📸", color: "from-amber-500 to-orange-600", description: "Share to Instagram stories" },
    { name: "TikTok", icon: "🎬", color: "from-black to-gray-900", description: "Create TikTok challenges" },
    { name: "Twitter/X", icon: "🐦", color: "from-orange-400 to-orange-500", description: "Share updates on X" },
    { name: "YouTube", icon: "▶️", color: "from-red-500 to-red-600", description: "Access YouTube mixes" },
  ];

  const musicPlatforms = [
    { name: "Spotify", icon: "🎵", description: "Stream mixes and playlists", features: ["Playlist sync", "Listening history", "Recommendations"] },
    { name: "Apple Music", icon: "🎶", description: "Access exclusive content", features: ["Library sync", "Offline playback", "Radio integration"] },
    { name: "SoundCloud", icon: "☁️", description: "Upload and share mixes", features: ["Track uploads", "Comments", "Reposts"] },
    { name: "Mixcloud", icon: "🎧", description: "Professional DJ mixes", features: ["Mix uploads", "Analytics", "Monetization"] },
    { name: "Beatport", icon: "🎹", description: "Purchase tracks", features: ["Track purchases", "Charts", "Playlists"] },
    { name: "Bandcamp", icon: "🎸", description: "Support independent artists", features: ["Direct purchases", "Fan support", "Merch"] },
  ];

  const calendarIntegrations = [
    { name: "Google Calendar", icon: "📅", description: "Sync event dates", features: ["Auto-sync events", "Reminders", "RSVP tracking"] },
    { name: "Apple Calendar", icon: "🗓️", description: "Add to Apple devices", features: ["iCloud sync", "Notifications", "Siri integration"] },
    { name: "Outlook", icon: "📧", description: "Microsoft calendar sync", features: ["Exchange sync", "Team calendars", "Meeting scheduling"] },
    { name: "Eventbrite", icon: "🎟️", description: "Ticketing platform", features: ["Ticket sales", "Attendee management", "Analytics"] },
  ];

  const marketingTools = [
    { name: "Mailchimp", icon: "📬", description: "Email marketing", features: ["Email campaigns", "Automation", "Segmentation"] },
    { name: "SendGrid", icon: "✉️", description: "Transactional emails", features: ["Email delivery", "Templates", "Analytics"] },
    { name: "Hotjar", icon: "🔥", description: "User behavior analytics", features: ["Heatmaps", "Session recording", "Surveys"] },
    { name: "Google Analytics", icon: "📊", description: "Website analytics", features: ["Traffic analysis", "Conversion tracking", "Reports"] },
    { name: "Mixpanel", icon: "📈", description: "Product analytics", features: ["Event tracking", "Funnels", "Cohorts"] },
    { name: "Facebook Pixel", icon: "👁️", description: "Ad tracking", features: ["Conversion tracking", "Retargeting", "Lookalike audiences"] },
  ];

  const paymentGateways = [
    { name: "Stripe", icon: "💳", description: "Accept payments", features: ["Credit cards", "Subscriptions", "Invoicing"] },
    { name: "PayPal", icon: "💰", description: "PayPal payments", features: ["PayPal checkout", "Venmo", "Pay Later"] },
    { name: "Apple Pay", icon: "📱", description: "Mobile payments", features: ["One-tap checkout", "Secure", "Fast"] },
    { name: "Google Pay", icon: "🔐", description: "Google wallet", features: ["Quick checkout", "Saved cards", "Rewards"] },
  ];

  const viralGrowthTools = [
    { name: "Facebook Invites", icon: "👥", description: "Invite friends to events", features: ["Friend suggestions", "Bulk invites", "Tracking"] },
    { name: "Referral Program", icon: "🎁", description: "Reward referrals", features: ["Unique links", "Rewards tracking", "Leaderboard"] },
    { name: "Instagram Stories", icon: "📲", description: "Share to stories", features: ["Custom stickers", "Swipe-up links", "Analytics"] },
    { name: "WhatsApp Groups", icon: "💬", description: "Community groups", features: ["Group invites", "Broadcast lists", "Auto-messages"] },
    { name: "Social Proof", icon: "⭐", description: "Live notifications", features: ["Recent signups", "Popular content", "Trending"] },
    { name: "Contests", icon: "🏆", description: "Run giveaways", features: ["Entry tracking", "Winner selection", "Prize management"] },
  ];

  const renderIntegrationSection = (title: string, description: string, items: any[], icon: any) => {
    const Icon = icon;
    return (
      <section className="py-16 border-t border-border">
        <div className="container">
          <div className="flex items-center gap-3 mb-4">
            <Icon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-3xl font-bold">{title}</h2>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {items.map((item, idx) => {
              const isConnected = connectedServices.includes(item.name);
              return (
                <Card key={idx} className="p-6 glass hover-lift">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{item.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    {isConnected && (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  {item.features && (
                    <ul className="space-y-2 mb-4">
                      {item.features.map((feature: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    onClick={() => handleConnect(item.name)}
                    className={`w-full ${isConnected ? 'bg-green-600 hover:bg-green-700' : 'gradient-bg'}`}
                  >
                    {isConnected ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Connected
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-dark backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 smooth-transition">
            <Music className="w-6 h-6 text-accent" />
            <span className="font-bold">DJ Danny Hectic B</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm hover:text-accent smooth-transition">Dashboard</Link>
            <Link href="/integrations" className="text-sm font-semibold text-accent">Integrations</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-background to-amber-900/20" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
              <span className="gradient-text">Connect Everything</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Integrate your favorite platforms, grow your audience, and track every interaction. All in one place.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <div className="flex items-center gap-2 px-6 py-3 rounded-full glass">
                <Zap className="w-5 h-5 text-accent" />
                <span className="font-semibold">{connectedServices.length} Connected</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 rounded-full glass">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="font-semibold">Unlimited Integrations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Login Options */}
      {renderIntegrationSection(
        "Social Login & Authentication",
        "One-click login with your favorite platforms",
        socialLogins,
        Users
      )}

      {/* Music Platforms */}
      {renderIntegrationSection(
        "Music Streaming Platforms",
        "Connect to streaming services and share your music",
        musicPlatforms,
        Music
      )}

      {/* Calendar Integrations */}
      {renderIntegrationSection(
        "Calendar & Event Management",
        "Sync events and manage bookings seamlessly",
        calendarIntegrations,
        LinkIcon
      )}

      {/* Marketing Tools */}
      {renderIntegrationSection(
        "Marketing & Analytics",
        "Track performance and engage your audience",
        marketingTools,
        TrendingUp
      )}

      {/* Payment Gateways */}
      {renderIntegrationSection(
        "Payment Processing",
        "Accept payments securely from anywhere",
        paymentGateways,
        Zap
      )}

      {/* Viral Growth Tools */}
      {renderIntegrationSection(
        "Viral Growth & Referrals",
        "Grow your audience exponentially with social features",
        viralGrowthTools,
        Share2
      )}

      {/* CTA Section */}
      <section className="py-20 border-t border-border bg-card/30">
        <div className="container max-w-3xl text-center space-y-6">
          <Gift className="w-16 h-16 text-accent mx-auto" />
          <h2 className="text-4xl font-bold">Need a Custom Integration?</h2>
          <p className="text-lg text-muted-foreground">
            We can build custom integrations for your specific needs. Contact us to discuss your requirements.
          </p>
          <Button size="lg" className="gradient-bg hover-lift">
            Request Custom Integration
          </Button>
        </div>
      </section>
    </div>
  );
}
