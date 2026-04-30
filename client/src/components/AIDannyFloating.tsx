import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MessageCircle, X, Minimize2, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function AIDannyFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("hectic-session-id");
    const newId = stored || generateSessionId();
    if (!stored) localStorage.setItem("hectic-session-id", newId);
    return newId;
  });

  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Yo! I'm Hectic – Danny's booking assistant. Want to lock in a show or just ask about the music?",
    },
  ]);
  const [input, setInput] = useState("");

  // Load messages from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`hectic-messages-${sessionId}`);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load messages:", e);
      }
    }
  }, [sessionId]);

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem(`hectic-messages-${sessionId}`, JSON.stringify(messages));
  }, [messages, sessionId]);

  const hectic = trpc.hectic.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
      setInput("");

      // Show signup prompt if needed
      if (data.shouldPromptSignup) {
        toast.info("Create a free account to save your booking request!", {
          action: {
            label: "Sign up",
            onClick: () => (window.location.href = "/signup"),
          },
        });
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to get response";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || hectic.isPending) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");

    hectic.mutate({ message: userMessage, sessionId });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-24 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 shadow-lg gradient-bg hover:scale-110 transition-transform"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <Card className="shadow-2xl border-accent/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-accent" />
              AI Danny
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {!isMinimized && (
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      msg.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {hectic.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Danny is typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Danny anything..."
                disabled={hectic.isPending}
                maxLength={500}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || hectic.isPending}
                className="shrink-0"
              >
                {hectic.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

