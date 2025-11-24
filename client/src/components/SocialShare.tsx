import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, Link2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
  variant?: "default" | "compact" | "icon-only";
}

export function SocialShare({
  url = typeof window !== "undefined" ? window.location.href : "",
  title = "DJ Danny Hectic B",
  description = "",
  className,
  variant = "default",
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareData = {
    url,
    title,
    description,
  };

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          toast.success("Link copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
          return;
        } catch (error) {
          toast.error("Failed to copy link");
          return;
        }
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      // Fallback to copy
      handleShare("copy");
    }
  };

  if (variant === "icon-only") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("facebook")}
          title="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("twitter")}
          title="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("linkedin")}
          title="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </Button>
        {'share' in navigator && typeof navigator.share === 'function' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNativeShare}
            title="Share"
          >
            <Link2 className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleShare("copy")}
          title="Copy link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("facebook")}
        >
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("twitter")}
        >
          <Twitter className="w-4 h-4 mr-2" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("copy")}
        >
          {copied ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          Copy Link
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-sm font-semibold">Share</div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => handleShare("facebook")}
          className="flex-1 min-w-[120px]"
        >
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </Button>
        <Button
          variant="outline"
          onClick={() => handleShare("twitter")}
          className="flex-1 min-w-[120px]"
        >
          <Twitter className="w-4 h-4 mr-2" />
          Twitter
        </Button>
        <Button
          variant="outline"
          onClick={() => handleShare("linkedin")}
          className="flex-1 min-w-[120px]"
        >
          <Linkedin className="w-4 h-4 mr-2" />
          LinkedIn
        </Button>
        {'share' in navigator && typeof navigator.share === 'function' && (
          <Button
            variant="outline"
            onClick={handleNativeShare}
            className="flex-1 min-w-[120px]"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => handleShare("copy")}
          className="flex-1 min-w-[120px]"
        >
          {copied ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          Copy Link
        </Button>
      </div>
    </div>
  );
}
