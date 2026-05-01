import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  isBot?: boolean;
  emoji?: string;
}

export interface MobileBottomSheetProps {
  onClose: () => void;
}

export function MobileBottomSheet({ onClose }: MobileBottomSheetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      user: "DJ_Fan",
      message: "Vibes are immaculate!",
      timestamp: new Date(),
      emoji: "🔥",
    },
    {
      id: "2",
      user: "StreamKing",
      message: "FIRE DROP 🔥",
      timestamp: new Date(),
      emoji: "✨",
    },
    {
      id: "3",
      user: "MusicHead",
      message: "What track is this?",
      timestamp: new Date(),
      emoji: "🎧",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      message: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-sm">
      {/* Animated slide up */}
      <div className="animate-in slide-in-from-bottom duration-300 bg-[#1F1F1F] rounded-t-2xl border-t border-[#333333] h-[70vh] max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#333333] flex-shrink-0">
          <h3 className="font-bold text-white">LIVE CHAT</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2F2F2F] rounded-full transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2">
              <div className="text-xs px-3 py-2 rounded bg-[#2F2F2F] hover:bg-[#3F3F3F] transition">
                <div className="flex items-center gap-2 mb-1">
                  {msg.emoji && <span className="text-sm">{msg.emoji}</span>}
                  <span className="font-bold text-white">{msg.user}</span>
                  <span className="text-[#999999] text-xs">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-white/90">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[#333333] p-3 flex-shrink-0 space-y-2 bg-[#0A0A0A]">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Send a message..."
              className="flex-1 px-3 py-2.5 rounded bg-[#2F2F2F] border border-[#333333] text-white placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#FF4444] text-sm"
              maxLength={200}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="p-2.5 rounded bg-[#FF4444] hover:bg-[#FF5555] disabled:opacity-50 text-white transition-colors h-10 w-10 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-1 flex-wrap">
            {["🔥", "✨", "❤️", "🙌"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setInputValue((prev) => prev + emoji);
                }}
                className="text-lg p-1.5 rounded hover:bg-[#2F2F2F] transition active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#999999] text-center">
            {inputValue.length}/200
          </p>
        </div>
      </div>
    </div>
  );
}
