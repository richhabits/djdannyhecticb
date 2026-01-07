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
import { Instagram, Music, Youtube, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
}

interface SocialLinksProps {
  variant?: "default" | "compact" | "magazine";
  className?: string;
}

// Social media URLs - can be moved to env vars later
const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "Instagram",
    url: import.meta.env.VITE_INSTAGRAM_URL || "https://instagram.com/djdannyhecticb",
    icon: <Instagram className="w-5 h-5" />,
  },
  {
    name: "TikTok",
    url: import.meta.env.VITE_TIKTOK_URL || "https://tiktok.com/@djdannyhecticb",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a4.83 4.83 0 0 0-1-.1 4.85 4.85 0 0 0-4.83 4.83 4.83 4.83 0 0 0 8.47 3.41V12.7a6.27 6.27 0 0 0 3.77 1.26V9.4a6.29 6.29 0 0 0 1.4-.16v3.35a4.85 4.85 0 0 1-2.23 4.09 4.83 4.83 0 0 1-7.37-2.59 4.85 4.85 0 0 1 4.83-4.83c.35 0 .69.05 1.02.13v-3.4z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    url: import.meta.env.VITE_YOUTUBE_URL || "https://youtube.com/@djdannyhecticb",
    icon: <Youtube className="w-5 h-5" />,
  },
  {
    name: "Mixcloud",
    url: import.meta.env.VITE_MIXCLOUD_URL || "https://mixcloud.com/djdannyhecticb",
    icon: <Music className="w-5 h-5" />,
  },
  {
    name: "WhatsApp Channel",
    url: import.meta.env.VITE_WHATSAPP_CHANNEL_URL || "https://wa.me/447957432842",
    icon: <MessageCircle className="w-5 h-5" />,
  },
].filter((link) => link.url); // Filter out empty URLs

export function SocialLinks({ variant = "default", className }: SocialLinksProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent transition-colors"
            aria-label={link.name}
          >
            {link.icon}
          </a>
        ))}
      </div>
    );
  }

  // New Magazine / Premium Variant
  // Uses sharp edges, magazine-border style, and monochrome/high-contrast look
  if (variant === "magazine") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            className="group relative inline-flex items-center justify-center p-3 text-sm font-bold text-white transition-all duration-200 bg-transparent border border-white/20 hover:border-accent hover:bg-accent/10 sharp-edge"
          >
            <span className="mr-2 opacity-70 group-hover:opacity-100 transition-opacity">{link.icon}</span>
            <span className="uppercase tracking-wider text-xs">{link.name}</span>
          </a>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {SOCIAL_LINKS.map((link) => (
        <Button
          key={link.name}
          variant="outline"
          size="sm"
          className="hover-lift"
          asChild
        >
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
          >
            {link.icon}
            <span className="ml-2">{link.name}</span>
          </a>
        </Button>
      ))}
    </div>
  );
}

