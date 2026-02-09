import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export function ShoutForm() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [trackRequest, setTrackRequest] = useState("");
  const [isTrackRequest, setIsTrackRequest] = useState(false);
  const [trackTitle, setTrackTitle] = useState("");
  const [trackArtist, setTrackArtist] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [heardFrom, setHeardFrom] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [canReadOnAir, setCanReadOnAir] = useState(false);

  const utils = trpc.useUtils();
  const createShout = trpc.shouts.create.useMutation({
    onSuccess: () => {
      toast.success("Shout sent! Big up, you're locked in.");
      setName("");
      setLocation("");
      setMessage("");
      setTrackRequest("");
      setIsTrackRequest(false);
      setTrackTitle("");
      setTrackArtist("");
      setPhone("");
      setEmail("");
      setHeardFrom("");
      setSelectedGenres([]);
      setWhatsappOptIn(false);
      setCanReadOnAir(false);
      utils.shouts.list.invalidate();
      utils.trackRequests.list.invalidate();
    },
    onError: (error) => {
      console.error("[ShoutForm] Error creating shout:", error);
      if (error.message?.includes("Database") || error.message?.includes("database")) {
        toast.error("Database not configured. Please set up DATABASE_URL to save shouts.");
      } else {
        toast.error(error.message || "Failed to send shout. Please try again.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("Name and message are required");
      return;
    }
    const isTrackReq = isTrackRequest && (trackTitle.trim() || trackArtist.trim());
    createShout.mutate({
      name: name.trim(),
      location: location.trim() || undefined,
      message: message.trim(),
      trackRequest: trackRequest.trim() || undefined,
      isTrackRequest: !!isTrackReq,
      trackTitle: isTrackReq ? trackTitle.trim() || undefined : undefined,
      trackArtist: isTrackReq ? trackArtist.trim() || undefined : undefined,
      phone: phone.trim() || undefined,
      whatsappOptIn,
      canReadOnAir,
    });
  };

  return (
    <Card className="glass hover-lift">
      <CardHeader>
        <CardTitle className="text-2xl font-bold gradient-text">
          Send Danny a Shout
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you listening from?"
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send a shout out to Danny and the crew..."
              required
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/2000 characters
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMessage("Yo Danny! Big up yourself and the Hectic Radio crew. Keep the vibes locked in! 🎵")}
              >
                General shout
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMessage("Yo Danny! It's my birthday today! Can you give me a birthday shout out? 🎉")}
              >
                Birthday shout
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMessage("Yo Danny! Can you play [track name]? That tune is fire! 🔥")}
              >
                Track request
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isTrackRequest"
                checked={isTrackRequest}
                onCheckedChange={(checked) => setIsTrackRequest(checked === true)}
              />
              <Label
                htmlFor="isTrackRequest"
                className="text-sm font-normal cursor-pointer"
              >
                This is a track request
              </Label>
            </div>
            {isTrackRequest ? (
              <div className="space-y-2 pl-6 border-l-2 border-accent/20">
                <div className="space-y-2">
                  <Label htmlFor="trackTitle">Track Title *</Label>
                  <Input
                    id="trackTitle"
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    placeholder="Enter track title"
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trackArtist">Artist *</Label>
                  <Input
                    id="trackArtist"
                    value={trackArtist}
                    onChange={(e) => setTrackArtist(e.target.value)}
                    placeholder="Enter artist name"
                    maxLength={255}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="trackRequest">Track Request (optional)</Label>
                <Input
                  id="trackRequest"
                  value={trackRequest}
                  onChange={(e) => setTrackRequest(e.target.value)}
                  placeholder="Request a track..."
                  maxLength={255}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp / Mobile Number (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07957 432842"
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              We don't show your number publicly. It's only for replies from Danny.
            </p>
          </div>

          {phone.trim() && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="whatsappOptIn"
                checked={whatsappOptIn}
                onCheckedChange={(checked) => setWhatsappOptIn(checked === true)}
              />
              <Label
                htmlFor="whatsappOptIn"
                className="text-sm font-normal cursor-pointer"
              >
                It's okay to contact me on WhatsApp about my shout.
              </Label>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="canReadOnAir"
              checked={canReadOnAir}
              onCheckedChange={(checked) => setCanReadOnAir(checked === true)}
            />
            <Label
              htmlFor="canReadOnAir"
              className="text-sm font-normal cursor-pointer"
            >
              Can we read this on air?
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full gradient-bg hover-lift"
            disabled={createShout.isPending}
          >
            {createShout.isPending ? "Sending..." : "Send Shout"}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Shouts will be read live on Hectic Radio once approved.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

