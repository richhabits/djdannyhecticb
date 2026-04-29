/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  MessageSquare,
  Copy,
  Sparkles,
  Instagram,
  Music,
  Zap,
  MapPin,
  Loader2,
} from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";

type Platform = "instagram" | "tiktok" | "x";

export default function AdminMarketing() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [topic, setTopic] = useState("");
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const jarvisChat = trpc.jarvis.chat.useMutation({
    onSuccess: (data) => {
      setGeneratedCopy(data.response);
      setIsGenerating(false);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to generate copy";
      toast.error(message);
      setIsGenerating(false);
    },
  });

  const { data: contentQueue } = trpc.integrations.contentQueue.useQuery();
  const { data: leadsQueue } = trpc.jarvis.leadsQueue.useQuery();

  const handleGenerateCopy = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    const prompt =
      platform === "instagram"
        ? `Write an engaging Instagram caption about: ${topic}. Include relevant emojis, hashtags, and a call-to-action. Max 2 paragraphs.`
        : platform === "tiktok"
          ? `Write a viral TikTok hook/caption idea about: ${topic}. Make it punchy, trendy, and shareable. Include relevant sounds/trends. One paragraph.`
          : `Write a Twitter/X post about: ${topic}. Keep it sharp, witty, and under 280 characters. Include 1-2 relevant hashtags.`;

    jarvisChat.mutate({
      message: prompt,
      sessionId: `marketing_${Date.now()}`,
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCopy);
    toast.success("Copied to clipboard!");
  };

  const bookingsByCity = leadsQueue?.reduce(
    (acc, lead) => {
      if (lead.location) {
        acc[lead.location] = (acc[lead.location] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  ) || {};

  const topCities = Object.entries(bookingsByCity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <>
      <MetaTagsComponent
        title="Marketing Studio - DJ Danny Hectic B"
        description="AI-powered marketing copy generator, content queue, and venue outreach tools."
        url="/admin/marketing"
      />
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto p-6 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-orange-500" />
              Marketing Studio
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-powered copy generation, content management, and venue outreach.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Copy Generator */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    AI Copy Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Platform Selector */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Platform
                    </label>
                    <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">
                          <span className="flex items-center gap-2">
                            <Instagram className="h-4 w-4" />
                            Instagram
                          </span>
                        </SelectItem>
                        <SelectItem value="tiktok">
                          <span className="flex items-center gap-2">
                            <Music className="h-4 w-4" />
                            TikTok
                          </span>
                        </SelectItem>
                        <SelectItem value="x">
                          <span className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            X (Twitter)
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Topic Input */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Topic or Context
                    </label>
                    <Input
                      placeholder="e.g., Upcoming show at Fabric, new mix release, booking availability..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateCopy}
                    disabled={isGenerating || !topic.trim()}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Copy
                      </>
                    )}
                  </Button>

                  {/* Generated Copy Display */}
                  {generatedCopy && (
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <div className="text-sm whitespace-pre-wrap">
                        {generatedCopy}
                      </div>
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Content Queue */}
              {contentQueue && contentQueue.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Content Queue</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contentQueue.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border rounded-lg bg-card space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm">{item.title}</p>
                          {item.status && (
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                              {item.status}
                            </span>
                          )}
                        </div>
                        {item.body && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.body}
                          </p>
                        )}
                        {item.scheduledAt && (
                          <p className="text-xs text-muted-foreground">
                            📅 {new Date(item.scheduledAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar: Insights */}
            <div className="space-y-4">
              {/* Top Cities */}
              {topCities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      Top Booking Cities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {topCities.map(([city, count]) => (
                      <div
                        key={city}
                        className="flex items-center justify-between p-2 bg-orange-500/10 rounded border border-orange-500/20"
                      >
                        <p className="text-sm font-medium">{city}</p>
                        <span className="text-xs bg-orange-500/20 px-2 py-1 rounded">
                          {count} leads
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Booking Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Booking Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total Leads</p>
                    <p className="text-2xl font-bold">
                      {leadsQueue?.length || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">New Leads</p>
                    <p className="text-2xl font-bold">
                      {leadsQueue?.filter((l) => l.status === "new").length || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Active Cities</p>
                    <p className="text-2xl font-bold">{topCities.length}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pro Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    ✨ Use specific details (venue names, dates) for better AI
                    copy
                  </p>
                  <p>
                    🎯 Tailor copy tone to each platform's audience
                  </p>
                  <p>
                    📅 Schedule posts during peak listener hours
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
