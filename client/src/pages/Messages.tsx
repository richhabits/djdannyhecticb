/**
 * Direct Messages Page - Private Messaging System
 */

import React, { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { useAtom } from "jotai";
import { userAtom } from "../stores/user";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, Send, Search, Plus, Check, CheckCheck, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function Messages() {
  const [user] = useAtom(userAtom);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: conversations, isLoading: conversationsLoading } = trpc.messages.getConversations.useQuery(
    { limit: 50 },
    { enabled: !!user?.id }
  );

  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = trpc.messages.getMessages.useQuery(
    { conversationId: selectedConversationId || 0, limit: 50 },
    { enabled: !!selectedConversationId }
  );

  const { data: unreadCount } = trpc.messages.getUnreadCount.useQuery(
    { conversationId: selectedConversationId || 0 },
    { enabled: !!selectedConversationId }
  );

  // Mutations
  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
      toast.success("Message sent!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const markAsReadMutation = trpc.messages.markAsRead.useMutation({
    onSuccess: () => {
      refetchMessages();
    },
  });

  const deleteMessageMutation = trpc.messages.deleteMessage.useMutation({
    onSuccess: () => {
      refetchMessages();
      toast.success("Message deleted");
    },
  });

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (selectedConversationId && unreadCount && unreadCount.unreadCount > 0) {
      markAsReadMutation.mutate({ conversationId: selectedConversationId });
    }
  }, [selectedConversationId]);

  const handleSendMessage = (recipientId?: number) => {
    if (!messageText.trim() || !selectedConversationId) return;

    const targetConv = conversations?.find((c) => c.id === selectedConversationId);
    const recipientUserId = targetConv?.user1Id === user?.id ? targetConv?.user2Id : targetConv?.user1Id;

    if (recipientUserId) {
      sendMessageMutation.mutate({
        recipientId: recipientUserId,
        content: messageText,
      });
    }
  };

  const filteredConversations = conversations?.filter((conv) =>
    conv.lastMessageAt?.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white mb-4">Messages</h1>
          <div className="flex gap-2">
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-400"
            />
            <Button size="icon" variant="outline">
              <Plus size={20} />
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {conversationsLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : filteredConversations && filteredConversations.length > 0 ? (
            <div className="space-y-2 p-2">
              {filteredConversations.map((conv) => {
                const otherUserId = conv.user1Id === user?.id ? conv.user2Id : conv.user1Id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full p-3 rounded-lg text-left transition ${
                      selectedConversationId === conv.id
                        ? "bg-slate-700 border border-blue-500"
                        : "hover:bg-slate-700 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">User {otherUserId}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>No conversations yet</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Messages Area */}
      {selectedConversationId ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-700 bg-slate-800">
            <h2 className="text-lg font-semibold text-white">Conversation</h2>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin" />
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg p-3 ${
                        msg.senderId === user?.id
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-100"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                        <span>{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                        {msg.senderId === user?.id && (
                          msg.readAt ? <CheckCheck size={12} /> : <Check size={12} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-slate-700 bg-slate-800">
            <div className="flex gap-2">
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-400 resize-none"
                rows={3}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                size="icon"
                className="self-end"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
