/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Brain, Zap, TrendingUp, Users, AlertCircle, Loader2 } from "lucide-react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { MetaTagsComponent } from "@/components/MetaTags";

function generateSessionId() {
  return `jarvis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function AdminJarvis() {
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("jarvis-session-id");
    const newId = stored || generateSessionId();
    if (!stored) localStorage.setItem("jarvis-session-id", newId);
    return newId;
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "I'm JARVIS – your private business intelligence system. I have access to all your bookings, leads, and venue data. Ask me anything about growing your brand, venue opportunities, or marketing strategy.",
    },
  ]);

  const jarvis = trpc.jarvis.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to get response";
      toast.error(message);
    },
  });

  const { data: insights } = trpc.jarvis.insights.useQuery();

  const { data: leadsQueue } = trpc.jarvis.leadsQueue.useQuery();

  const generateSuggestions = trpc.jarvis.generateSuggestions.useMutation({
    onSuccess: () => {
      toast.success("New venue suggestions generated!");
      leadsQueue?.refetch?.();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to generate suggestions";
      toast.error(message);
    },
  });

  const handleSendMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
    jarvis.mutate({ message: content, sessionId });
  };

  const venueInsights = insights?.filter((i) => i.type === "venue_suggestion") || [];
  const newLeads = leadsQueue?.filter((l) => l.status === "new") || [];

  return (
    <>
      <MetaTagsComponent
        title="Jarvis Admin - Business Intelligence"
        description="Admin dashboard with AI business intelligence, venue suggestions, and lead management."
        url="/admin/jarvis"
      />
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Brain className="h-8 w-8 text-cyan-500" />
              JARVIS
            </h1>
            <p className="text-muted-foreground text-lg">
              Private AI intelligence. Full business context. Venue & lead analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chat */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>Business Intelligence Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col overflow-hidden">
                  <AIChatBox
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={jarvis.isPending}
                    placeholder="Ask JARVIS about bookings, venues, marketing strategy..."
                    height="100%"
                    suggestedPrompts={[
                      "Which UK cities have the most booking interest?",
                      "Generate venue outreach suggestions",
                      "What pricing should I target for high-value bookings?",
                      "Suggest Instagram post ideas from recent bookings",
                    ]}
                    emptyStateMessage="Start with a business question for JARVIS"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar: Insights & Leads */}
            <div className="space-y-4">
              {/* Generate Suggestions Button */}
              <Button
                onClick={() => generateSuggestions.mutate()}
                disabled={generateSuggestions.isPending}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                {generateSuggestions.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Suggestions
                  </>
                )}
              </Button>

              {/* Venue Insights */}
              {venueInsights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      Venue Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {venueInsights.slice(0, 3).map((insight) => (
                      <div
                        key={insight.id}
                        className="p-3 bg-accent/10 border border-accent/20 rounded-lg space-y-1"
                      >
                        <p className="font-medium text-sm">{insight.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {insight.content}
                        </p>
                        {insight.metadata?.city && (
                          <p className="text-xs text-accent">
                            📍 {insight.metadata.city}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* New Leads Queue */}
              {newLeads.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      New Leads ({newLeads.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {newLeads.slice(0, 5).map((lead) => (
                      <div
                        key={lead.id}
                        className="p-2 bg-green-500/10 border border-green-500/20 rounded text-sm space-y-0.5"
                      >
                        <p className="font-medium">{lead.name || "Unknown"}</p>
                        {lead.eventType && (
                          <p className="text-xs text-muted-foreground">
                            {lead.eventType} booking
                          </p>
                        )}
                        {lead.location && (
                          <p className="text-xs text-muted-foreground">
                            📍 {lead.location}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* No Data State */}
              {venueInsights.length === 0 && newLeads.length === 0 && (
                <Card>
                  <CardContent className="pt-6 flex flex-col items-center gap-3 text-center">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">No insights yet</p>
                      <p className="text-xs text-muted-foreground">
                        Run the generator to see venue suggestions and leads
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
