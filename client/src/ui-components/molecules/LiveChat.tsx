/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Live Chat Component with Real-time Messages & Moderation
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { MessageCircle, Trash2, Pin, Shield, Heart } from "lucide-react";

interface ChatMessage {
  id: number;
  message: string;
  usernameColor: string;
  isPinned: boolean;
  user: {
    id: number;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  badges: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface BadgeConfig {
  subscriber: { label: "Subscriber"; color: "bg-purple-500" };
  moderator: { label: "Mod"; color: "bg-red-500" };
  founder: { label: "Founder"; color: "bg-gold-500" };
  [key: string]: { label: string; color: string };
}

const BADGE_CONFIG: BadgeConfig = {
  subscriber: { label: "Subscriber", color: "bg-purple-500" },
  moderator: { label: "Mod", color: "bg-red-500" },
  founder: { label: "Founder", color: "bg-yellow-500" },
};

interface LiveChatProps {
  liveSessionId: number;
  isAdmin?: boolean;
  maxHeight?: string;
  onClose?: () => void;
}

export function LiveChat({
  liveSessionId,
  isAdmin = false,
  maxHeight = "h-96",
  onClose,
}: LiveChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch messages
  const { data: fetchedMessages, isLoading } = useQuery({
    queryKey: ["live:chat:messages", liveSessionId],
    queryFn: () =>
      trpc.live.chat.messages.query({
        liveSessionId,
        limit: 50,
        offset: 0,
      }),
    refetchInterval: 2000, // Poll every 2 seconds
    staleTime: 1000,
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (message: string) =>
      trpc.live.chat.send.mutate({
        liveSessionId,
        message,
        usernameColor: "#" + Math.floor(Math.random() * 16777215).toString(16),
      }),
    onSuccess: () => {
      setInputValue("");
      // Refetch messages
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    },
  });

  // Delete message mutation
  const deleteMutation = useMutation({
    mutationFn: (messageId: number) =>
      trpc.live.chat.delete.mutate({
        messageId,
        reason: "Moderation",
      }),
    onSuccess: () => {
      toast.success("Message deleted");
    },
  });

  // Pin message mutation
  const pinMutation = useMutation({
    mutationFn: (messageId: number) =>
      trpc.live.chat.pinMessage.mutate({ messageId }),
    onSuccess: () => {
      toast.success("Message pinned");
    },
  });

  // Update messages when fetched
  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    setAutoScroll(isAtBottom);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMutation.mutate(inputValue.trim());
    }
  };

  const renderBadges = (badges: any[]) => {
    if (!badges.length) return null;

    return (
      <div className="flex gap-1 ml-1">
        {badges.map((badge, idx) => {
          const config = BADGE_CONFIG[badge.badgeType];
          if (!config) return null;

          return (
            <span
              key={idx}
              className={`${config.color} text-white text-xs px-2 py-0.5 rounded`}
              title={config.label}
            >
              {config.label}
            </span>
          );
        })}
      </div>
    );
  };

  const renderMessage = (msg: ChatMessage) => {
    const displayName = msg.user?.displayName || "Anonymous";
    const avatarUrl = msg.user?.avatarUrl;

    return (
      <div
        key={msg.id}
        className={clsx(
          "px-3 py-2 mb-1 rounded group hover:bg-gray-800 transition-colors",
          msg.isPinned && "bg-yellow-900/20 border-l-2 border-yellow-500"
        )}
      >
        <div className="flex items-start gap-2">
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarImage src={avatarUrl || ""} />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span
                style={{ color: msg.usernameColor }}
                className="font-semibold text-sm"
              >
                {displayName}
              </span>
              {renderBadges(msg.badges)}
            </div>

            <p className="text-sm text-gray-200 break-words mt-1">
              {msg.message}
            </p>

            <span className="text-xs text-gray-500 mt-1">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
          </div>

          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100"
                >
                  ⋮
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => pinMutation.mutate(msg.id)}
                  disabled={msg.isPinned}
                >
                  <Pin className="mr-2 h-4 w-4" />
                  Pin Message
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => deleteMutation.mutate(msg.id)}
                  className="text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 rounded-lg border border-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-purple-400" />
          <span className="font-semibold">Live Chat</span>
          <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
            LIVE
          </span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className={`flex-1 ${maxHeight}`}>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto px-2 py-2"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">No messages yet</span>
            </div>
          ) : (
            messages.map(renderMessage)
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="px-3 py-3 border-t border-gray-800"
      >
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Send a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={sendMutation.isPending}
            className="flex-1 bg-gray-900 border-gray-700"
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={sendMutation.isPending || !inputValue.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Send
          </Button>
        </div>
      </form>

      {/* Auto-scroll indicator */}
      {!autoScroll && (
        <div className="px-3 py-2 bg-gray-900 border-t border-gray-800">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setAutoScroll(true);
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              }
            }}
            className="w-full"
          >
            ↓ New messages
          </Button>
        </div>
      )}
    </div>
  );
}
