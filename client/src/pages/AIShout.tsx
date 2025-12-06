import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MetaTagsComponent } from "@/components/MetaTags";
import { AlertTriangle, Sparkles, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AIShout() {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    email: "",
    recipient: "",
    vibe: "Fun" as "Fun" | "Savage" | "Romantic" | "Motivational",
    message: "",
    includeVoice: false,
    aiContentConsent: false,
    marketingConsent: false,
    dataShareConsent: false,
  });

  const [promoForm, setPromoForm] = useState({
    campaignName: "",
    eventDate: "",
    platform: "instagram",
    callToAction: "",
    includeVoice: true,
    email: "",
    aiContentConsent: false,
    marketingConsent: false,
    dataShareConsent: false,
  });

  const createScript = trpc.aiStudio.scripts.create.useMutation();
  const createVoice = trpc.aiStudio.voice.create.useMutation();
  const createPromoScript = trpc.aiStudio.scripts.create.useMutation();
  const createPromoVoice = trpc.aiStudio.voice.create.useMutation();
  const createConsent = trpc.aiStudio.consents.createOrUpdate.useMutation();
  const { data: studioStatus } = trpc.aiStudio.status.useQuery();
  const { data: shoutGallery } = trpc.aiStudio.shouts.list.useQuery({ limit: 12 });

  const studioDisabled = !!studioStatus && (!studioStatus.aiStudioEnabled || !studioStatus.fanFacingEnabled);
  const isShoutSubmitting = createScript.isPending || createVoice.isPending || createConsent.isPending;
  const isPromoSubmitting = createPromoScript.isPending || createPromoVoice.isPending || createConsent.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aiContentConsent) {
      toast.error("Please consent to AI content usage");
      return;
    }

    if (studioDisabled) {
      toast.error("AI Shout Studio is currently disabled.");
      return;
    }

    try {
      await createConsent.mutateAsync({
        email: formData.email || undefined,
        aiContentConsent: formData.aiContentConsent,
        marketingConsent: formData.marketingConsent,
        dataShareConsent: formData.dataShareConsent,
      });

      const job = await createScript.mutateAsync({
        type: "fanShout",
        context: {
          shoutData: {
            name: formData.name,
            location: formData.location,
            message: formData.message,
            vibe: formData.vibe,
          },
          userInfo: {
            name: formData.recipient || formData.name,
            email: formData.email || undefined,
          },
        },
      });

      toast.success("Your Hectic AI Shout is being cooked! Check back soon.");

      if (formData.includeVoice && job?.id) {
        try {
          await createVoice.mutateAsync({
            scriptJobId: job.id,
            voiceProfile: "hectic_main",
          });
          toast.success("Voice generation started!");
        } catch (voiceError) {
          const voiceMessage = voiceError instanceof Error ? voiceError.message : "Failed to start voice job";
          toast.error(voiceMessage);
        }
      }

      setFormData({
        name: "",
        location: "",
        email: "",
        recipient: "",
        vibe: "Fun",
        message: "",
        includeVoice: false,
        aiContentConsent: false,
        marketingConsent: false,
        dataShareConsent: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create shout";
      toast.error(message);
    }
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!promoForm.aiContentConsent) {
      toast.error("Please consent to AI content usage");
      return;
    }

    if (studioDisabled) {
      toast.error("AI Promo Packs are currently disabled.");
      return;
    }

    try {
      await createConsent.mutateAsync({
        email: promoForm.email || undefined,
        aiContentConsent: promoForm.aiContentConsent,
        marketingConsent: promoForm.marketingConsent,
        dataShareConsent: promoForm.dataShareConsent,
      });

      const job = await createPromoScript.mutateAsync({
        type: "promo",
        context: {
          eventInfo: {
            title: promoForm.campaignName,
            date: promoForm.eventDate,
          },
          platform: promoForm.platform,
          keywords: promoForm.callToAction ? [promoForm.callToAction] : undefined,
          userInfo: {
            name: promoForm.campaignName,
            email: promoForm.email || undefined,
          },
        },
      });

      toast.success("Promo pack in production! We’ll drop it soon.");

      if (promoForm.includeVoice && job?.id) {
        try {
          await createPromoVoice.mutateAsync({
            scriptJobId: job.id,
            voiceProfile: "hectic_main",
          });
        } catch (voiceError) {
          const voiceMessage = voiceError instanceof Error ? voiceError.message : "Failed to start voice job";
          toast.error(voiceMessage);
        }
      }

      setPromoForm({
        campaignName: "",
        eventDate: "",
        platform: "instagram",
        callToAction: "",
        includeVoice: true,
        email: "",
        aiContentConsent: false,
        marketingConsent: false,
        dataShareConsent: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create promo pack";
      toast.error(message);
    }
  };

  const galleryItems = shoutGallery || [];

  return (
    <>
      <MetaTagsComponent
        title="AI Shout Studio - Get a Personalized Shout from AI Danny"
        description="Create a personalized AI-generated shout from Danny Hectic B"
        url="/ai-shout"
      />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">AI Shout Studio</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Get a personalized shout from AI Danny! Fill out the form and we'll generate a custom message just for you.
          </p>
        </div>

        {studioDisabled && (
          <Card className="mb-8 border-destructive/40 bg-destructive/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div className="text-left">
                <p className="font-semibold">AI Shout Studio is paused</p>
                <p className="text-sm text-muted-foreground">
                  Fan-facing AI tools are currently disabled. You can still browse previous shouts below.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Your AI Shout</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="We’ll send your AI shout here"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="recipient">Who is this shout for?</Label>
                  <Input
                    id="recipient"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    placeholder="Leave empty if it's for you"
                  />
                </div>

                <div>
                  <Label htmlFor="vibe">Vibe *</Label>
                  <Select
                    value={formData.vibe}
                    onValueChange={(value: any) => setFormData({ ...formData, vibe: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fun">Fun</SelectItem>
                      <SelectItem value="Savage">Savage</SelectItem>
                      <SelectItem value="Romantic">Romantic</SelectItem>
                      <SelectItem value="Motivational">Motivational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Your Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    required
                    placeholder="What do you want Danny to say?"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeVoice"
                    checked={formData.includeVoice}
                    onCheckedChange={(checked) => setFormData({ ...formData, includeVoice: checked === true })}
                  />
                  <Label htmlFor="includeVoice" className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Include AI voice (TTS)
                  </Label>
                </div>

                <ConsentFields
                  data={formData}
                  idPrefix="shout"
                  onChange={(patch) => setFormData({ ...formData, ...patch })}
                />

                <Button type="submit" className="w-full" disabled={isShoutSubmitting || studioDisabled}>
                  {isShoutSubmitting ? "Submitting..." : studioDisabled ? "AI Studio Disabled" : "Create AI Shout"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Promo Pack</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePromoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campaignName">Campaign / Show *</Label>
                    <Input
                      id="campaignName"
                      value={promoForm.campaignName}
                      onChange={(e) => setPromoForm({ ...promoForm, campaignName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventDate">Date *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={promoForm.eventDate}
                      onChange={(e) => setPromoForm({ ...promoForm, eventDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="promo-email">Email *</Label>
                  <Input
                    id="promo-email"
                    type="email"
                    value={promoForm.email}
                    onChange={(e) => setPromoForm({ ...promoForm, email: e.target.value })}
                    placeholder="Shareable link delivered here"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="platform">Primary Platform</Label>
                  <Select
                    value={promoForm.platform}
                    onValueChange={(value: any) => setPromoForm({ ...promoForm, platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="multi">Multi-channel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="callToAction">Call to action</Label>
                  <Textarea
                    id="callToAction"
                    value={promoForm.callToAction}
                    onChange={(e) => setPromoForm({ ...promoForm, callToAction: e.target.value })}
                    rows={3}
                    placeholder="Link in bio, grab tickets, drop a comment, etc."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="promo-voice"
                    checked={promoForm.includeVoice}
                    onCheckedChange={(checked) => setPromoForm({ ...promoForm, includeVoice: checked === true })}
                  />
                  <Label htmlFor="promo-voice" className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Include hype voiceover
                  </Label>
                </div>

                <ConsentFields
                  data={promoForm}
                  idPrefix="promo"
                  onChange={(patch) => setPromoForm({ ...promoForm, ...patch })}
                />

                <Button type="submit" className="w-full" disabled={isPromoSubmitting || studioDisabled}>
                  {isPromoSubmitting ? "Cooking promo..." : studioDisabled ? "AI Studio Disabled" : "Request Promo Pack"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Completed Shouts */}
        {galleryItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Shouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {galleryItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {item.shoutData?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.shoutData?.location ? `${item.shoutData.location} · ` : ""}
                        {format(new Date(item.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    {item.shoutData?.vibe && <Badge variant="outline">{item.shoutData.vibe}</Badge>}
                  </div>
                  {item.resultText && (
                    <p className="text-sm italic text-muted-foreground">"{item.resultText}"</p>
                  )}
                  {item.voice?.audioUrl && (
                    <audio controls className="w-full">
                      <source src={item.voice.audioUrl} type="audio/mpeg" />
                    </audio>
                  )}
                  {item.video?.videoUrl && (
                    <video
                      controls
                      className="w-full rounded-md"
                      poster={item.video.thumbnailUrl || undefined}
                    >
                      <source src={item.video.videoUrl} type="video/mp4" />
                    </video>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

type ConsentState = {
  aiContentConsent: boolean;
  marketingConsent: boolean;
  dataShareConsent: boolean;
};

function ConsentFields({
  data,
  onChange,
  idPrefix,
}: {
  data: ConsentState;
  onChange: (patch: Partial<ConsentState>) => void;
  idPrefix: string;
}) {
  const marketingId = `${idPrefix}-marketing`;
  const dataShareId = `${idPrefix}-data`;
  const contentId = `${idPrefix}-content`;

  return (
    <>
      <div className="flex items-start space-x-2">
        <Checkbox
          id={marketingId}
          checked={data.marketingConsent}
          onCheckedChange={(checked) => onChange({ marketingConsent: checked === true })}
        />
        <Label htmlFor={marketingId} className="text-sm">
          I’d like occasional drops, missions, and updates from Danny.
        </Label>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id={dataShareId}
          checked={data.dataShareConsent}
          onCheckedChange={(checked) => onChange({ dataShareConsent: checked === true })}
        />
        <Label htmlFor={dataShareId} className="text-sm">
          Allow anonymised usage to improve the AI experience.
        </Label>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id={contentId}
          checked={data.aiContentConsent}
          onCheckedChange={(checked) => onChange({ aiContentConsent: checked === true })}
          required
        />
        <Label htmlFor={contentId} className="text-sm">
          I'm cool with Danny using this content (or an anonymised version) in shows, clips, and AI training. *
        </Label>
      </div>
    </>
  );
}

