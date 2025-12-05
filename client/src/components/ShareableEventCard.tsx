import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Share2, Download } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

interface ShareableEventCardProps {
  event: {
    id: number;
    title: string;
    description?: string;
    eventDate: Date;
    location: string;
    imageUrl?: string;
    ticketUrl?: string;
  };
  onShare?: (platform: string) => void;
}

export function ShareableEventCard({ event, onShare }: ShareableEventCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useState<HTMLDivElement | null>(null)[0];

  const handleDownload = () => {
    // In production, this would use html2canvas or a server-side image generation
    // For now, we'll copy the text content
    const text = `🎉 ${event.title}\n📅 ${format(new Date(event.eventDate), "MMM d, yyyy")}\n📍 ${event.location}`;
    navigator.clipboard.writeText(text);
    toast.success("Event details copied! Use screenshot to save as image.");
  };

  const handleShare = (platform: string) => {
    const text = `🎉 ${event.title}\n📅 ${format(new Date(event.eventDate), "MMM d, yyyy")}\n📍 ${event.location}\n\n`;
    const url = window.location.href;
    
    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + url)}`;
        break;
      default:
        navigator.clipboard.writeText(text + url);
        toast.success("Link copied to clipboard!");
        return;
    }
    
    window.open(shareUrl, "_blank");
    onShare?.(platform);
  };

  return (
    <div className="space-y-4">
      <Card
        ref={(el) => {
          if (el) (cardRef as any) = el;
        }}
        className="overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 text-white p-8 max-w-md mx-auto"
      >
        {event.imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        
        <div className="space-y-4">
          <h3 className="text-3xl font-bold">{event.title}</h3>
          
          {event.description && (
            <p className="text-white/80">{event.description}</p>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{format(new Date(event.eventDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{event.location}</span>
            </div>
          </div>
          
          {event.ticketUrl && (
            <Button
              className="w-full bg-white text-purple-900 hover:bg-white/90"
              onClick={() => window.open(event.ticketUrl, "_blank")}
            >
              Get Tickets
            </Button>
          )}
        </div>
      </Card>
      
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isGenerating}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Image
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("twitter")}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share on X
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("facebook")}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share on Facebook
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("whatsapp")}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share on WhatsApp
        </Button>
      </div>
    </div>
  );
}
