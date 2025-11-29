import { Button } from "@/components/ui/button";
import { MessageCircle, Twitter, Facebook, Send, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  getWhatsAppShareUrl,
  getTwitterShareUrl,
  getFacebookShareUrl,
  getTelegramShareUrl,
  copyToClipboard,
  ShareOptions,
} from "@/lib/shareUtils";

interface SocialShareBarProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  showCopy?: boolean;
}

export function SocialShareBar({
  url,
  title,
  description,
  className = "",
  showCopy = true,
}: SocialShareBarProps) {
  const [copied, setCopied] = useState(false);

  const shareOptions: ShareOptions = {
    url,
    title,
    description,
  };

  const handleCopy = async () => {
    const fullUrl = typeof window !== "undefined" ? window.location.origin + url : url;
    const success = await copyToClipboard(fullUrl);
    if (success) {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground mr-2">Share:</span>
      
      <Button
        size="sm"
        variant="outline"
        className="hover-lift"
        asChild
      >
        <a
          href={getWhatsAppShareUrl({ ...shareOptions, source: "whatsapp" })}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          WhatsApp
        </a>
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="hover-lift"
        asChild
      >
        <a
          href={getTwitterShareUrl({ ...shareOptions, source: "twitter" })}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X (Twitter)"
        >
          <Twitter className="w-4 h-4 mr-1" />
          X
        </a>
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="hover-lift"
        asChild
      >
        <a
          href={getFacebookShareUrl({ ...shareOptions, source: "facebook" })}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4 mr-1" />
          Facebook
        </a>
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="hover-lift"
        asChild
      >
        <a
          href={getTelegramShareUrl({ ...shareOptions, source: "telegram" })}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Telegram"
        >
          <Send className="w-4 h-4 mr-1" />
          Telegram
        </a>
      </Button>

      {showCopy && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="hover-lift"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copy Link
            </>
          )}
        </Button>
      )}
    </div>
  );
}

