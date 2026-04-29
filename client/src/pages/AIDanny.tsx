/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Send, Bot, CheckCircle2, AlertCircle } from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";
import { AIChatBox, type Message } from "@/components/AIChatBox";

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function AIDanny() {
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("hectic-session-id");
    const newId = stored || generateSessionId();
    if (!stored) localStorage.setItem("hectic-session-id", newId);
    return newId;
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Yo! I'm Hectic – Danny's AI assistant. I can help with bookings, answer music questions, or just vibe. What's on your mind?",
    },
  ]);

  // Load conversation history
  const { data: history } = trpc.hectic.history.useQuery({ sessionId });

  useEffect(() => {
    if (history && history.length > 0) {
      const historyMessages = history.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      }));
      // Filter out system messages and keep user/assistant
      setMessages(
        historyMessages.filter((m) => m.role !== "system")
      );
    }
  }, [history]);

  const chatMutation = trpc.hectic.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);

      // Show signup prompt if needed
      if (data.shouldPromptSignup) {
        toast.info(
          "Create a free account to save your booking request! Takes 30 seconds.",
          {
            action: {
              label: "Sign up",
              onClick: () => (window.location.href = "/signup"),
            },
          }
        );
      }
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to send message";
      toast.error(message);
    },
  });

  const handleSendMessage = (content: string) => {
    // Optimistic update
    setMessages((prev) => [...prev, { role: "user", content }]);

    chatMutation.mutate({
      message: content,
      sessionId,
    });
  };

  const extractedData = chatMutation.data?.extractedData;

  return (
    <>
      <MetaTagsComponent
        title="Chat with Hectic - Book DJ Danny"
        description="Chat with Hectic AI to book DJ Danny Hectic B or ask questions about music."
        url="/ai-danny"
      />
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto p-6 max-w-5xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Bot className="h-8 w-8 text-orange-500" />
              Hectic
            </h1>
            <p className="text-muted-foreground text-lg">
              Danny's booking assistant. Tell me about your event and I'll lock
              it in.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Chat */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>Chat with Hectic</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col overflow-hidden">
                  <AIChatBox
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={chatMutation.isPending}
                    placeholder="Tell me about your event, or just ask a question..."
                    height="100%"
                    suggestedPrompts={[
                      "Book Danny for my event",
                      "What's your pricing?",
                      "Tell me about the music",
                      "Listen to mixes",
                    ]}
                    emptyStateMessage="Start chatting to book or learn more about DJ Danny Hectic B"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar: Booking Progress & Info */}
            <div className="space-y-4">
              {/* Extracted Data Progress */}
              {extractedData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Booking Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {extractedData.name && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Name</p>
                          <p className="font-medium text-sm">
                            {extractedData.name}
                          </p>
                        </div>
                      </div>
                    )}
                    {extractedData.email && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Email
                          </p>
                          <p className="font-medium text-sm break-all">
                            {extractedData.email}
                          </p>
                        </div>
                      </div>
                    )}
                    {extractedData.location && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-1 text-orange-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Location
                          </p>
                          <p className="font-medium text-sm">
                            {extractedData.location}
                          </p>
                        </div>
                      </div>
                    )}
                    {extractedData.eventDate && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-1 text-orange-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="font-medium text-sm">
                            {extractedData.eventDate}
                          </p>
                        </div>
                      </div>
                    )}
                    {extractedData.budget && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-1 text-orange-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Budget
                          </p>
                          <p className="font-medium text-sm">
                            £{extractedData.budget}
                          </p>
                        </div>
                      </div>
                    )}

                    {!extractedData.email && (
                      <div className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                        <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                        <p className="text-xs text-yellow-700">
                          Share your email to lock in your booking
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">About Danny</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>30+ years</strong> UK Garage, House, Jungle, Grime
                  </p>
                  <p>
                    <strong>Clean DBS</strong> check & valid USA Visa
                  </p>
                  <p className="text-muted-foreground">
                    Typical fees: Club £500-1500, Private £800-2500, Corporate
                    £2000+
                  </p>
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => (window.location.href = "/bookings")}
                  >
                    Full Booking Form
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
