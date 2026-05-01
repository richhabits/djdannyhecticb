import { Link } from "wouter";
import {
  Settings, Zap, Radio, Music, ShoppingCart, Brain, BarChart3, Megaphone,
  Users, Cpu, Code, Video, Volume2, Bookmark, Share2, TrendingUp,
  Lock, AlertCircle, Lightbulb, Monitor, Shield, Package, AlertTriangle
} from "lucide-react";

export default function AdminHub() {
  const sections = [
    {
      name: "Control Tower",
      description: "Master dashboard & system monitoring",
      icon: Cpu,
      href: "/admin/control",
      category: "core",
      color: "text-red-500",
    },
    {
      name: "Jarvis AI",
      description: "AI business intelligence & insights",
      icon: Brain,
      href: "/admin/jarvis",
      category: "ai",
      color: "text-purple-500",
    },
    {
      name: "Marketing",
      description: "Social media & content campaigns",
      icon: Megaphone,
      href: "/admin/marketing",
      category: "marketing",
      color: "text-orange-500",
    },
    {
      name: "Streams",
      description: "Live stream management",
      icon: Radio,
      href: "/admin/streams",
      category: "broadcast",
      color: "text-cyan-500",
    },
    {
      name: "Shows",
      description: "Podcast & show episodes",
      icon: Monitor,
      href: "/admin/shows",
      category: "broadcast",
      color: "text-blue-500",
    },
    {
      name: "Mixes",
      description: "DJ mixes & tracklists",
      icon: Music,
      href: "/admin/mixes",
      category: "content",
      color: "text-green-500",
    },
    {
      name: "Tracks",
      description: "Music catalogue management",
      icon: TrendingUp,
      href: "/admin/tracks",
      category: "content",
      color: "text-pink-500",
    },
    {
      name: "Bookings",
      description: "Event booking requests",
      icon: Bookmark,
      href: "/admin/bookings",
      category: "business",
      color: "text-yellow-500",
    },
    {
      name: "Shouts",
      description: "Fan shouts & custom messages",
      icon: Users,
      href: "/admin/shouts",
      category: "engagement",
      color: "text-indigo-500",
    },
    {
      name: "Podcasts",
      description: "Podcast publishing & episodes",
      icon: Volume2,
      href: "/admin/podcasts",
      category: "broadcast",
      color: "text-violet-500",
    },
    {
      name: "Streaming Links",
      description: "Platform streaming integrations",
      icon: Share2,
      href: "/admin/streaming-links",
      category: "integrations",
      color: "text-emerald-500",
    },
    {
      name: "AI Studio",
      description: "AI-powered content generation",
      icon: Zap,
      href: "/admin/ai-studio",
      category: "ai",
      color: "text-amber-500",
    },
    {
      name: "AI Scripts",
      description: "AI script templates & automation",
      icon: Code,
      href: "/admin/ai-scripts",
      category: "ai",
      color: "text-rose-500",
    },
    {
      name: "AI Voice",
      description: "Voice synthesis & narration",
      icon: Volume2,
      href: "/admin/ai-voice",
      category: "ai",
      color: "text-teal-500",
    },
    {
      name: "AI Video",
      description: "Video generation & editing",
      icon: Video,
      href: "/admin/ai-video",
      category: "ai",
      color: "text-fuchsia-500",
    },
    {
      name: "Show Live",
      description: "Live show broadcasting",
      icon: Radio,
      href: "/admin/show-live",
      category: "broadcast",
      color: "text-sky-500",
    },
    {
      name: "Now Playing",
      description: "Current track display",
      icon: Music,
      href: "/admin/now-playing",
      category: "broadcast",
      color: "text-lime-500",
    },
    {
      name: "Economy",
      description: "Revenue & financial tracking",
      icon: BarChart3,
      href: "/admin/economy",
      category: "business",
      color: "text-green-600",
    },
    {
      name: "Empire",
      description: "Multi-channel business hub",
      icon: Shield,
      href: "/admin/empire",
      category: "business",
      color: "text-orange-600",
    },
    {
      name: "Integrations",
      description: "Third-party API connections",
      icon: Settings,
      href: "/admin/integrations",
      category: "system",
      color: "text-slate-400",
    },
    {
      name: "Shop",
      description: "Products & merchandise management",
      icon: Package,
      href: "/admin/shop",
      category: "business",
      color: "text-cyan-400",
    },
    {
      name: "Merch",
      description: "Printfull integration & orders",
      icon: ShoppingCart,
      href: "/admin/merch",
      category: "business",
      color: "text-yellow-400",
    },
    {
      name: "Music Catalog",
      description: "SoundCloud, Spotify & Beatport sync",
      icon: Music,
      href: "/admin/music-catalog",
      category: "integrations",
      color: "text-purple-400",
    },
    {
      name: "Moderation",
      description: "Chat moderation, bans, mutes & warnings",
      icon: AlertTriangle,
      href: "/admin/moderation",
      category: "engagement",
      color: "text-red-500",
    },
    {
      name: "Analytics",
      description: "Stream metrics, chat stats & donations",
      icon: BarChart3,
      href: "/admin/analytics",
      category: "business",
      color: "text-green-500",
    },
    {
      name: "Stream Control",
      description: "Live stream management & quality control",
      icon: Radio,
      href: "/admin/stream-control",
      category: "broadcast",
      color: "text-red-600",
    },
  ];

  const categories = [
    { key: "core", label: "Core", icon: "⚙️" },
    { key: "ai", label: "AI Tools", icon: "🤖" },
    { key: "broadcast", label: "Broadcast", icon: "📡" },
    { key: "content", label: "Content", icon: "🎵" },
    { key: "engagement", label: "Engagement", icon: "👥" },
    { key: "business", label: "Business", icon: "💼" },
    { key: "marketing", label: "Marketing", icon: "📢" },
    { key: "integrations", label: "Integrations", icon: "🔗" },
    { key: "system", label: "System", icon: "⚡" },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <section className="mb-16">
          <div className="tape-strip bg-accent text-white border-white mb-6 inline-block text-xs">
            ADMIN_COMMAND_CENTER
          </div>
          <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.75] italic mb-6">
            CONTROL<br />PANEL
          </h1>
          <p className="text-white/60 max-w-2xl font-mono text-sm">
            Master dashboard for all DJ Danny Hectic B operations.
            Manage broadcasts, content, bookings, AI tools, and business analytics.
          </p>
        </section>

        {/* Quick Links */}
        <section className="mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Control Tower", href: "/admin/control", icon: Cpu, badge: "PRIORITY" },
            { name: "Jarvis AI", href: "/admin/jarvis", icon: Brain, badge: "AI" },
            { name: "Marketing", href: "/admin/marketing", icon: Megaphone, badge: "GROWTH" },
            { name: "Streams", href: "/admin/streams", icon: Radio, badge: "LIVE" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="border-2 border-white p-4 hover:border-accent hover:bg-accent/10 transition-all duration-150 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <item.icon className="w-6 h-6 text-accent" />
                  <span className="text-xs font-black uppercase text-accent bg-black border border-accent px-2 py-1">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-black uppercase text-sm">{item.name}</h3>
              </div>
            </Link>
          ))}
        </section>

        {/* All Sections by Category */}
        <section>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 border-b-2 border-white pb-4">
            All Tools
          </h2>

          <div className="space-y-12">
            {categories.map((category) => {
              const items = sections.filter((s) => s.category === category.key);
              if (items.length === 0) return null;

              return (
                <div key={category.key}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="text-lg font-black uppercase tracking-wider">{category.label}</h3>
                    <div className="flex-1 border-b border-white/20" />
                    <span className="text-xs text-white/60 font-mono">{items.length} tools</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((section) => {
                      const Icon = section.icon;
                      return (
                        <Link key={section.href} href={section.href}>
                          <div className="border-2 border-white p-6 hover:border-accent hover:bg-accent/5 transition-all duration-150 cursor-pointer group h-full">
                            <div className="flex items-start justify-between mb-3">
                              <Icon className={`w-8 h-8 ${section.color}`} />
                            </div>
                            <h4 className="font-black uppercase text-sm mb-2 group-hover:text-accent transition-colors">
                              {section.name}
                            </h4>
                            <p className="text-xs text-white/70 font-mono">{section.description}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer Info */}
        <section className="mt-16 border-t-4 border-white pt-8">
          <p className="text-xs text-white/60 font-mono uppercase tracking-wider">
            ⚠️ Admin access restricted to authorized users. All actions are logged.
          </p>
        </section>
      </div>
    </div>
  );
}
