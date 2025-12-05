import { useListenerStats } from '@/hooks/useRealtime';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveListenerCountProps {
  variant?: 'default' | 'compact' | 'badge';
  showPeak?: boolean;
}

export function LiveListenerCount({ variant = 'default', showPeak = true }: LiveListenerCountProps) {
  const { count, peak, isConnected } = useListenerStats();

  if (variant === 'badge') {
    return (
      <Badge variant={isConnected ? "default" : "secondary"} className="gap-1.5">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <Users className="h-3 w-3" />
        <AnimatePresence mode="wait">
          <motion.span
            key={count}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {count.toLocaleString()}
          </motion.span>
        </AnimatePresence>
        {isConnected ? 'listening' : 'connecting...'}
      </Badge>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${isConnected ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <Users className="h-4 w-4" />
          <AnimatePresence mode="wait">
            <motion.span
              key={count}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="font-semibold"
            >
              {count.toLocaleString()}
            </motion.span>
          </AnimatePresence>
        </div>
        {showPeak && peak > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs">Peak: {peak.toLocaleString()}</span>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <span className="text-sm font-medium text-muted-foreground">
          {isConnected ? 'LIVE NOW' : 'CONNECTING...'}
        </span>
      </div>
      
      <div className="flex items-baseline gap-2">
        <Users className="h-6 w-6 text-primary" />
        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="text-4xl font-bold"
          >
            {count.toLocaleString()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <span className="text-sm text-muted-foreground">
        {count === 1 ? 'Listener' : 'Listeners'} Locked In
      </span>

      {showPeak && peak > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 pt-2 border-t border-primary/10">
          <TrendingUp className="h-3 w-3" />
          <span>Peak Today: {peak.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

// Animated counter for hero sections
export function LiveListenerCountHero() {
  const { count, isConnected } = useListenerStats();

  return (
    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
      <div className="relative">
        <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
        {isConnected && (
          <>
            <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-500 animate-ping" />
            <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-500 animate-pulse" />
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-white/80 text-sm font-medium">LIVE</span>
        <div className="h-4 w-px bg-white/20" />
        <AnimatePresence mode="wait">
          <motion.span
            key={count}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="text-white font-bold text-lg"
          >
            {count.toLocaleString()}
          </motion.span>
        </AnimatePresence>
        <Users className="h-4 w-4 text-white/60" />
      </div>
    </div>
  );
}
