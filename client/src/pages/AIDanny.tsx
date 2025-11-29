import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Send, Bot, User } from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function AIDanny() {
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("ai-danny-session");
    return stored || generateSessionId();
  });
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("ai-danny-session", sessionId);
  }, [sessionId]);

  const { data: history, refetch } = trpc.genz.aiDanny.history.useQuery({
    sessionId,
    limit: 100,
  });

  const chatMutation = trpc.genz.aiDanny.chat.useMutation({
    onSuccess: () => {
      setMessage("");
      refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to send message";
      toast.error(message);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    chatMutation.mutate({
      sessionId,
      message: message.trim(),
    });
  };

  const messages = history || [];

  return (
    <>
      <MetaTagsComponent
        title="AI Danny - Chat with Danny Hectic B"
        description="Chat with AI Danny - get help, ask questions, or just vibe!"
        url="/ai-danny"
      />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">AI Danny</h1>
          <p className="text-muted-foreground">Chat with Danny's AI assistant. Ask about tracks, shows, or just vibe!</p>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Danny Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Yo, it's Danny's AI – I can tell you what's playing, when the next show is, or how to get your shout on air.</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  {msg.message && (
                    <div className="flex items-start gap-2">
                      <User className="h-5 w-5 mt-1 text-muted-foreground" />
                      <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  )}
                  {msg.response && (
                    <div className="flex items-start gap-2 justify-end">
                      <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">{msg.response}</p>
                      </div>
                      <Bot className="h-5 w-5 mt-1 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={chatMutation.isPending}
              />
              <Button type="submit" disabled={chatMutation.isPending || !message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

