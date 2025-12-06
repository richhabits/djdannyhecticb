import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useRealtime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Radio, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LiveChatProps {
  username?: string;
  userId?: string;
}

export function LiveChat({ username, userId }: LiveChatProps) {
  const { messages, typingUsers, sendMessage, startTyping, stopTyping, isConnected } = useChat({
    username: username || 'Anonymous',
    userId,
    autoConnect: true,
  });

  const [inputMessage, setInputMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    
    sendMessage(inputMessage);
    setInputMessage('');
    stopTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    
    if (e.target.value.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2">
          <Radio className={`h-5 w-5 ${isConnected ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
          Live Chat
        </CardTitle>
        {isConnected ? (
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </Badge>
        ) : (
          <Badge variant="secondary">Connecting...</Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4" ref={scrollRef}>
          <div className="space-y-3 py-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No messages yet. Be the first to say hi! 👋</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${
                  msg.type === 'system' ? 'items-center' : 'items-start'
                }`}
              >
                {msg.type === 'system' ? (
                  <div className="text-xs text-muted-foreground italic">
                    {msg.message}
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm">{msg.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <div className="bg-muted px-3 py-2 rounded-lg max-w-[80%] break-words">
                      {msg.message}
                    </div>
                  </>
                )}
              </div>
            ))}

            {typingUsers.size > 0 && (
              <div className="text-xs text-muted-foreground italic flex items-center gap-1">
                <span className="flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                </span>
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="pt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex w-full gap-2"
        >
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onBlur={stopTyping}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            maxLength={500}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!isConnected || !inputMessage.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

// Compact version for sidebar/floating widget
export function LiveChatCompact({ username, userId }: LiveChatProps) {
  const { messages, sendMessage, isConnected } = useChat({
    username: username || 'Anonymous',
    userId,
    autoConnect: true,
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage('');
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg"
        size="icon"
      >
        <Radio className={isConnected ? 'animate-pulse' : ''} />
        {messages.length > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {messages.length > 9 ? '9+' : messages.length}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 shadow-2xl">
      <LiveChat username={username} userId={userId} />
      <Button
        onClick={() => setIsExpanded(false)}
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2"
      >
        ✕
      </Button>
    </div>
  );
}
