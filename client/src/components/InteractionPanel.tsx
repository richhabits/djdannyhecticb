import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Flame,
  Smile,
  HandThumbsUp,
  BarChart3,
} from "lucide-react";

export interface InteractionPanelProps {
  onReaction?: (type: string) => void;
  onPollVote?: (option: string) => void;
  onFollowClick?: () => void;
  compact?: boolean;
}

export function InteractionPanel({
  onReaction,
  onPollVote,
  onFollowClick,
  compact = false,
}: InteractionPanelProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [showPoll, setShowPoll] = useState(true);
  const [pollVotes, setPollVotes] = useState({
    vibe: 234,
    fire: 567,
    next: 189,
  });
  const totalVotes = Object.values(pollVotes).reduce((a, b) => a + b, 0);

  const reactions = [
    { type: "love", emoji: "❤️", label: "Love" },
    { type: "fire", emoji: "🔥", label: "Fire" },
    { type: "hype", emoji: "🙌", label: "Hype" },
    { type: "vibes", emoji: "✨", label: "Vibes" },
  ];

  const handleReaction = (type: string) => {
    setSelectedReaction(type);
    onReaction?.(type);
    setTimeout(() => setSelectedReaction(null), 300);
  };

  const handlePollVote = (option: string) => {
    setPollVotes((prev) => ({
      ...prev,
      [option]: prev[option as keyof typeof prev] + 1,
    }));
    onPollVote?.(option);
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Reactions */}
        <div className="flex gap-2 justify-between">
          {reactions.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              className="flex-1 h-9 bg-[#2F2F2F] hover:bg-[#FF4444] text-white rounded transition-colors duration-200 text-lg font-bold active:scale-95"
              title={reaction.label}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>

        {/* Mini Poll */}
        {showPoll && (
          <div className="bg-[#2F2F2F] rounded p-2 text-xs space-y-2">
            <p className="font-bold text-[#FF4444]">Vibe Check?</p>
            <div className="space-y-1">
              {[
                { label: "🔥 Fire", key: "fire", color: "bg-[#FF4444]" },
                { label: "✨ Vibe", key: "vibe", color: "bg-[#9333EA]" },
                { label: "👉 Next", key: "next", color: "bg-[#3B82F6]" },
              ].map((poll) => {
                const percentage = (
                  (pollVotes[poll.key as keyof typeof pollVotes] / totalVotes) *
                  100
                ).toFixed(0);
                return (
                  <button
                    key={poll.key}
                    onClick={() => handlePollVote(poll.key)}
                    className="w-full text-left hover:opacity-80 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold flex-shrink-0">
                        {poll.label}
                      </span>
                      <div className="flex-1 h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${poll.color} transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#999999] flex-shrink-0">
                        {percentage}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Reactions */}
      <div>
        <p className="text-xs font-bold text-[#999999] mb-2 uppercase tracking-wide">
          Quick Reactions
        </p>
        <div className="grid grid-cols-4 gap-2">
          {reactions.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              className={`
                p-3 rounded bg-[#2F2F2F] hover:bg-[#FF4444] text-white transition-all duration-200
                active:scale-90 border border-[#333333] hover:border-[#FF4444]
                ${selectedReaction === reaction.type ? "bg-[#FF4444] ring-2 ring-[#FF4444] ring-offset-2 ring-offset-[#0A0A0A]" : ""}
              `}
              title={reaction.label}
            >
              <div className="text-2xl">{reaction.emoji}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Poll */}
      {showPoll && (
        <div className="bg-[#2F2F2F] rounded p-3 border border-[#333333] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#FF4444]" />
              <p className="text-xs font-bold text-white">Vibe Check: Playlist Vibes?</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: "🔥 Fire!", key: "fire", color: "from-[#FF4444] to-[#FF6666]" },
              { label: "✨ Good Vibes", key: "vibe", color: "from-[#9333EA] to-[#B455FF]" },
              { label: "👉 Next Track", key: "next", color: "from-[#3B82F6] to-[#60A5FA]" },
            ].map((poll) => {
              const percentage = (
                (pollVotes[poll.key as keyof typeof pollVotes] / totalVotes) *
                100
              ).toFixed(0);
              return (
                <button
                  key={poll.key}
                  onClick={() => handlePollVote(poll.key)}
                  className="w-full text-left hover:opacity-80 transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white flex-shrink-0">
                      {poll.label}
                    </span>
                    <span className="text-xs text-[#999999] flex-shrink-0">
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${poll.color} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-[#999999] text-center">
            {totalVotes.toLocaleString()} votes • 2 min left
          </p>
        </div>
      )}

      {/* Social CTAs */}
      <div className="space-y-2">
        <Button
          onClick={onFollowClick}
          className="w-full h-10 bg-white text-black hover:bg-gray-200 font-bold text-sm"
        >
          FOLLOW FOR NOTIFICATIONS
        </Button>
      </div>
    </div>
  );
}
