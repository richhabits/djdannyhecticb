import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Twitter, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ThreadTweet {
  id: string;
  text: string;
}

export function TwitterThreadTemplate() {
  const [title, setTitle] = useState("");
  const [tweets, setTweets] = useState<ThreadTweet[]>([
    { id: "1", text: "" },
  ]);
  const [hashtags, setHashtags] = useState("");

  const addTweet = () => {
    setTweets([...tweets, { id: Date.now().toString(), text: "" }]);
  };

  const removeTweet = (id: string) => {
    if (tweets.length > 1) {
      setTweets(tweets.filter((t) => t.id !== id));
    }
  };

  const updateTweet = (id: string, text: string) => {
    setTweets(tweets.map((t) => (t.id === id ? { ...t, text } : t)));
  };

  const generateThread = () => {
    const threadText = tweets
      .filter((t) => t.text.trim())
      .map((tweet, index) => `${index + 1}/${tweets.length} ${tweet.text}`)
      .join("\n\n");
    
    const fullText = title ? `${title}\n\n${threadText}` : threadText;
    const withHashtags = hashtags
      ? `${fullText}\n\n${hashtags.split(",").map((h) => `#${h.trim()}`).join(" ")}`
      : fullText;
    
    return withHashtags;
  };

  const copyToClipboard = () => {
    const thread = generateThread();
    navigator.clipboard.writeText(thread);
    toast.success("Thread copied to clipboard!");
  };

  const shareToTwitter = () => {
    const thread = generateThread();
    const firstTweet = tweets[0]?.text || "";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      firstTweet.substring(0, 280)
    )}`;
    window.open(url, "_blank");
    toast.info("Share the remaining tweets manually as replies!");
  };

  const templates = [
    {
      name: "Event Announcement",
      tweets: [
        "🎉 BIG ANNOUNCEMENT 🎉",
        "I'm excited to announce my upcoming event!",
        "📅 Date: [DATE]\n📍 Location: [LOCATION]",
        "This is going to be INSANE! 🔥",
        "Get your tickets now: [LINK]",
      ],
    },
    {
      name: "New Mix Release",
      tweets: [
        "🎵 NEW MIX OUT NOW 🎵",
        "Just dropped my latest mix featuring the best UK Garage, House & Amapiano vibes!",
        "Tracklist includes:\n• [Track 1]\n• [Track 2]\n• [Track 3]",
        "Stream it now on [PLATFORM]",
        "Let me know what you think! 👇",
      ],
    },
    {
      name: "Behind the Scenes",
      tweets: [
        "📸 BEHIND THE SCENES 📸",
        "Here's what goes into creating a Hectic Radio show:",
        "1️⃣ Planning the tracklist\n2️⃣ Prepping the script\n3️⃣ Setting up the studio",
        "It's all about the details! 💯",
        "What would you like to see more of?",
      ],
    },
  ];

  const loadTemplate = (template: typeof templates[0]) => {
    setTitle(template.name);
    setTweets(
      template.tweets.map((text, index) => ({
        id: (index + 1).toString(),
        text,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Twitter/X Thread Builder</h2>
          <p className="text-muted-foreground">
            Create viral Twitter threads with this template builder
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {templates.map((template) => (
            <Button
              key={template.name}
              variant="outline"
              onClick={() => loadTemplate(template)}
              className="h-auto p-4 flex flex-col items-start"
            >
              <span className="font-semibold">{template.name}</span>
              <span className="text-xs text-muted-foreground mt-1">
                {template.tweets.length} tweets
              </span>
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Thread Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 🎉 BIG ANNOUNCEMENT 🎉"
            />
          </div>

          <div>
            <Label>Tweets</Label>
            <div className="space-y-3 mt-2">
              {tweets.map((tweet, index) => (
                <Card key={tweet.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Tweet {index + 1} / {tweets.length}
                    </span>
                    {tweets.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTweet(tweet.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={tweet.text}
                    onChange={(e) => updateTweet(tweet.id, e.target.value)}
                    placeholder="Type your tweet here..."
                    className="min-h-[100px]"
                    maxLength={280}
                  />
                  <div className="text-xs text-muted-foreground mt-1 text-right">
                    {tweet.text.length}/280
                  </div>
                </Card>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={addTweet}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tweet
            </Button>
          </div>

          <div>
            <Label htmlFor="hashtags">Hashtags (comma-separated)</Label>
            <Input
              id="hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="hecticradio, djdannyhecticb, ukgarage"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={copyToClipboard} className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              Copy Thread
            </Button>
            <Button
              onClick={shareToTwitter}
              variant="default"
              className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8]"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Share First Tweet
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
