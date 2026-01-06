/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

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
import { Sparkles, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AIShout() {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    recipient: "",
    vibe: "Fun" as "Fun" | "Savage" | "Romantic" | "Motivational",
    message: "",
    includeVoice: false,
    aiContentConsent: false,
  });

  const createScript = trpc.aiStudio.scripts.create.useMutation({
    onSuccess: async (job) => {
      toast.success("Your Hectic AI Shout is being cooked! Check back soon.");
      
      // If includeVoice is checked, create voice job
      if (formData.includeVoice && job.id) {
        createVoice.mutate({
          scriptJobId: job.id,
          voiceProfile: "hectic_main",
        });
      }
      
      setFormData({
        name: "",
        location: "",
        recipient: "",
        vibe: "Fun",
        message: "",
        includeVoice: false,
        aiContentConsent: false,
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create shout";
      toast.error(message);
    },
  });

  const createVoice = trpc.aiStudio.voice.create.useMutation({
    onSuccess: () => {
      toast.success("Voice generation started!");
    },
    onError: (error: unknown) => {
      console.error("Voice creation error:", error);
    },
  });

  const { data: completedShouts } = trpc.aiStudio.scripts.list.useQuery({
    type: "fanShout",
    limit: 20,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aiContentConsent) {
      toast.error("Please consent to AI content usage");
      return;
    }

    createScript.mutate({
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
        },
      },
    });
  };

  const completed = completedShouts?.filter((s) => s.status === "completed") || [];

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

        <Card className="mb-8">
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

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="aiContentConsent"
                  checked={formData.aiContentConsent}
                  onCheckedChange={(checked) => setFormData({ ...formData, aiContentConsent: checked === true })}
                  required
                />
                <Label htmlFor="aiContentConsent" className="text-sm">
                  I'm cool with Danny using this content (or an anonymised version) in shows, clips, and AI training. *
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={createScript.isPending}>
                {createScript.isPending ? "Creating..." : "Create AI Shout"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Completed Shouts */}
        {completed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Shouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {completed.slice(0, 5).map((shout) => {
                const context = JSON.parse(shout.inputContext || "{}");
                const shoutData = context.shoutData || {};
                return (
                  <div key={shout.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{shoutData.name || "Anonymous"}</p>
                        {shoutData.location && (
                          <p className="text-sm text-muted-foreground">{shoutData.location}</p>
                        )}
                      </div>
                      <Badge variant="outline">{shoutData.vibe || "Fun"}</Badge>
                    </div>
                    {shout.resultText && (
                      <p className="text-sm mt-2 italic">"{shout.resultText}"</p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

