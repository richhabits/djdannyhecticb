import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Share2, Twitter, Facebook, MessageCircle, Mail, Link2, 
  Instagram, Music, Copy, Check, QrCode, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

interface ShareConfig {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  image?: string;
  incentive?: string;
}

const SHARE_PLATFORMS = [
  {
    id: "twitter",
    name: "Twitter/X",
    icon: Twitter,
    color: "bg-black hover:bg-gray-800",
    getUrl: (config: ShareConfig) => {
      const params = new URLSearchParams({
        text: `${config.title}${config.description ? ` - ${config.description}` : ""}`,
        url: config.url,
        hashtags: config.hashtags?.join(",") || "",
      });
      return `https://twitter.com/intent/tweet?${params}`;
    },
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600 hover:bg-blue-700",
    getUrl: (config: ShareConfig) => {
      const params = new URLSearchParams({
        u: config.url,
        quote: `${config.title}${config.description ? ` - ${config.description}` : ""}`,
      });
      return `https://www.facebook.com/sharer/sharer.php?${params}`;
    },
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircle,
    color: "bg-green-500 hover:bg-green-600",
    getUrl: (config: ShareConfig) => {
      const text = `${config.title}${config.description ? `\n\n${config.description}` : ""}\n\n${config.url}`;
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    },
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    color: "bg-gray-600 hover:bg-gray-700",
    getUrl: (config: ShareConfig) => {
      const params = new URLSearchParams({
        subject: config.title,
        body: `${config.description || config.title}\n\n${config.url}`,
      });
      return `mailto:?${params}`;
    },
  },
];

// Twitter/X viral thread templates
export const VIRAL_THREAD_TEMPLATES = [
  {
    id: "event_hype",
    name: "Event Hype Thread",
    template: `🔥 THREAD: Why you NEED to be at {event_name}

1/ The lineup is absolutely STACKED. We're talking:
{lineup}

2/ The vibes? Unmatched. Last time the energy was electric from start to finish.

3/ {custom_hook}

4/ Don't miss out - link in bio. RT to help a friend catch the wave 🌊

{hashtags}`,
  },
  {
    id: "mix_release",
    name: "New Mix Release",
    template: `NEW MIX DROP 🎵

Just uploaded a fresh {genre} mix that took me {hours} hours to perfect.

What you'll hear:
• {highlight_1}
• {highlight_2}  
• {highlight_3}

Link: {url}

Let me know your fave track in the replies 👇

{hashtags}`,
  },
  {
    id: "story_time",
    name: "Story Time Thread",
    template: `Story time: How I went from playing in my bedroom to {achievement} 🧵

1/ It all started when {origin_story}

2/ The first gig was {first_gig_story}

3/ The breakthrough moment? {breakthrough}

4/ Now? {current_status}

5/ My advice: {advice}

If this inspired you, RT for others to see 💪`,
  },
];

interface EnhancedSocialShareProps {
  config: ShareConfig;
  className?: string;
  showIncentive?: boolean;
  compact?: boolean;
}

export function EnhancedSocialShare({ 
  config, 
  className, 
  showIncentive = true,
  compact = false 
}: EnhancedSocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(config.url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: typeof SHARE_PLATFORMS[0]) => {
    const url = platform.getUrl(config);
    window.open(url, "_blank", "width=600,height=400");
    
    // Track share event
    console.log("[Analytics] Share:", { platform: platform.id, ...config });
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: config.title,
          text: config.description,
          url: config.url,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {SHARE_PLATFORMS.slice(0, 3).map((platform) => (
          <Button
            key={platform.id}
            variant="ghost"
            size="icon"
            onClick={() => handleShare(platform)}
            className="w-8 h-8"
          >
            <platform.icon className="w-4 h-4" />
          </Button>
        ))}
        <Button variant="ghost" size="icon" onClick={copyLink} className="w-8 h-8">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn("p-6 glass", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share
          </h3>
          {"share" in navigator && (
            <Button variant="outline" size="sm" onClick={nativeShare}>
              More Options
            </Button>
          )}
        </div>

        {showIncentive && config.incentive && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-sm">
            🎁 {config.incentive}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SHARE_PLATFORMS.map((platform) => (
            <Button
              key={platform.id}
              onClick={() => handleShare(platform)}
              className={cn("flex items-center gap-2 text-white", platform.color)}
            >
              <platform.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{platform.name}</span>
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input value={config.url} readOnly className="flex-1" />
          <Button variant="outline" onClick={copyLink}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button variant="outline" onClick={() => setShowQR(!showQR)}>
            <QrCode className="w-4 h-4" />
          </Button>
        </div>

        {showQR && (
          <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg">
            <QRCodeSVG value={config.url} size={150} />
            <Button variant="outline" size="sm" onClick={() => {
              const svg = document.querySelector("#share-qr-code svg");
              if (svg) {
                const data = new XMLSerializer().serializeToString(svg);
                const blob = new Blob([data], { type: "image/svg+xml" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "share-qr-code.svg";
                a.click();
              }
            }}>
              <Download className="w-4 h-4 mr-2" />
              Download QR
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

// Shareable event card generator
export function ShareableEventCard({ 
  event 
}: { 
  event: { 
    title: string; 
    date: string; 
    location: string; 
    image?: string;
    dj: string;
  }
}) {
  return (
    <div className="bg-gradient-to-br from-purple-900 to-pink-900 p-6 rounded-xl text-white max-w-md">
      <div className="space-y-4">
        <div className="text-xs font-medium uppercase tracking-wider opacity-70">
          Live Event
        </div>
        <h2 className="text-2xl font-bold">{event.title}</h2>
        <div className="space-y-2 text-sm opacity-90">
          <p>📅 {event.date}</p>
          <p>📍 {event.location}</p>
          <p>🎧 {event.dj}</p>
        </div>
        <div className="pt-4 border-t border-white/20">
          <p className="text-xs opacity-70">@djdannyhecticb</p>
        </div>
      </div>
    </div>
  );
}

// Social proof notification component
export function SocialProofPopup({ 
  notification, 
  onClose 
}: { 
  notification: { 
    type: "join" | "purchase" | "shout" | "listen"; 
    name: string; 
    location?: string; 
    time: string; 
  }; 
  onClose: () => void;
}) {
  const messages = {
    join: `${notification.name} just joined from ${notification.location || "unknown"}`,
    purchase: `${notification.name} just purchased a mix`,
    shout: `${notification.name} just sent a shout`,
    listen: `${notification.name} is listening live`,
  };

  const icons = {
    join: "👋",
    purchase: "🛒",
    shout: "📢",
    listen: "🎧",
  };

  return (
    <div 
      className="fixed bottom-24 left-4 z-50 animate-slide-in-left cursor-pointer"
      onClick={onClose}
    >
      <Card className="p-4 glass shadow-lg max-w-xs">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{icons[notification.type]}</span>
          <div>
            <p className="text-sm font-medium">{messages[notification.type]}</p>
            <p className="text-xs text-muted-foreground">{notification.time}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Contest/Giveaway component
export function ContestWidget({ 
  contest 
}: { 
  contest: { 
    title: string; 
    prize: string; 
    endDate: string; 
    entries: number;
    actions: { type: string; points: number; completed: boolean }[];
  }
}) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  
  const totalPoints = contest.actions.reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = contest.actions
    .filter(a => completed.has(a.type))
    .reduce((sum, a) => sum + a.points, 0);

  const handleAction = (actionType: string) => {
    setCompleted(prev => new Set([...Array.from(prev), actionType]));
    toast.success(`+${contest.actions.find(a => a.type === actionType)?.points} entries earned!`);
  };

  return (
    <Card className="p-6 glass">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-accent font-medium uppercase tracking-wider">
              🎁 Giveaway
            </span>
            <h3 className="text-xl font-bold">{contest.title}</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{contest.entries.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">entries</p>
          </div>
        </div>

        <div className="bg-accent/10 rounded-lg p-4">
          <p className="text-sm font-medium">Prize: {contest.prize}</p>
          <p className="text-xs text-muted-foreground">Ends: {contest.endDate}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Your entries</span>
            <span className="font-medium">{earnedPoints} / {totalPoints}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all"
              style={{ width: `${(earnedPoints / totalPoints) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Earn more entries:</p>
          {contest.actions.map((action) => (
            <button
              key={action.type}
              onClick={() => !completed.has(action.type) && handleAction(action.type)}
              disabled={completed.has(action.type)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                completed.has(action.type)
                  ? "bg-green-500/10 border-green-500/20 text-green-500"
                  : "bg-card hover:bg-accent/10 border-border"
              )}
            >
              <span className="text-sm capitalize">{action.type.replace("_", " ")}</span>
              <span className="text-sm font-medium">
                {completed.has(action.type) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  `+${action.points} entries`
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default EnhancedSocialShare;
