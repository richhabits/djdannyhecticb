/**
 * Social Share Buttons Component
 * Provides share functionality for content across multiple platforms
 */

import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Instagram, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface SocialShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  contentType?: "mix" | "event" | "post" | "page";
  contentId?: number;
  className?: string;
}

export function SocialShareButtons({
  url,
  title = "DJ Danny Hectic B",
  description = "Check this out on Hectic Radio!",
  contentType = "page",
  contentId,
  className = "",
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareMutation = trpc.analytics.track.useMutation();
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = `${title} - ${description}`;

  const handleShare = async (platform: string) => {
    const shareUrl = encodeURIComponent(currentUrl);
    const shareTitle = encodeURIComponent(title);
    const shareDesc = encodeURIComponent(description);

    let shareLink = "";

    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${shareTitle}%20${shareUrl}`;
        break;
      case "copy":
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(currentUrl);
          setCopied(true);
          toast.success("Link copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
        }
        break;
    }

    if (shareLink && platform !== "copy") {
      window.open(shareLink, "_blank", "width=600,height=400");
    }

    // Track share event
    if (contentId) {
      shareMutation.mutate({
        eventType: "share",
        eventName: "share",
        properties: {
          contentType,
          contentId,
          platform,
        },
      });
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("twitter")}
        className="flex items-center gap-2"
      >
        <Twitter className="h-4 w-4" />
        <span className="hidden sm:inline">Twitter</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("facebook")}
        className="flex items-center gap-2"
      >
        <Facebook className="h-4 w-4" />
        <span className="hidden sm:inline">Facebook</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("whatsapp")}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("copy")}
        className="flex items-center gap-2"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        <span className="hidden sm:inline">{copied ? "Copied!" : "Copy Link"}</span>
      </Button>
    </div>
  );
}
