/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Send, MessageCircle, Minimize2, Maximize2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
  avatar?: string;
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! 👋 Welcome to DJ Danny Hectic B support. How can I help you today?",
      sender: "agent",
      timestamp: new Date(),
      avatar: "🤖",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate agent typing
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me help you with that.",
        "I can definitely assist you with that. What specific information do you need?",
        "Thanks for reaching out! We're here to help. Can you tell me more?",
        "I'd be happy to help! Have you checked our FAQ section?",
        "That sounds interesting! Let me connect you with the right team member.",
        "We appreciate your interest! What can I do for you today?",
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: "agent",
        timestamp: new Date(),
        avatar: "🤖",
      };

      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = [
    "Book a DJ",
    "Pricing info",
    "Event details",
    "Contact support",
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 animate-bounce"
        title="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="flex flex-col h-[600px] bg-background border-border shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div>
            <h3 className="font-bold">DJ Danny Support</h3>
            <p className="text-xs text-orange-100">Usually replies instantly</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "agent" && (
                    <div className="text-2xl flex-shrink-0">{message.avatar}</div>
                  )}
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-br-none"
                        : "bg-card border border-border text-foreground rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "user"
                          ? "text-orange-100"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="text-2xl">🤖</div>
                  <div className="bg-card border border-border text-foreground rounded-lg rounded-bl-none px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-border space-y-2">
                <p className="text-xs text-muted-foreground font-semibold">
                  Quick replies:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => {
                        setInputValue(reply);
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      className="text-xs px-3 py-1 rounded-full bg-card border border-border hover:border-accent transition"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border p-4 space-y-3">
              <div className="flex gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
                  rows={2}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                💬 We typically respond within minutes
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
