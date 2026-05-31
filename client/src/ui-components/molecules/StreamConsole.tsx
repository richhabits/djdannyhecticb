import React, { useRef, useEffect } from 'react';
import { Terminal, Wifi, WifiOff, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'error' | 'success';
}

interface StreamConsoleProps {
  logs: LogEntry[];
  isConnected: boolean;
  status: string;
}

const StreamConsole: React.FC<StreamConsoleProps> = ({ logs, isConnected, status }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full min-h-[300px] border border-white/10 bg-black/60 backdrop-blur-2xl rounded-xl overflow-hidden glassmorphism group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">
            Broadcast Matrix Console
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-white/5">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-[9px] font-black uppercase italic ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              {status}
            </span>
          </div>
          {isConnected ? <Wifi size={14} className="text-green-500" /> : <WifiOff size={14} className="text-red-500" />}
        </div>
      </div>

      {/* Log Window */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-2 custom-scrollbar selection:bg-red-500 selection:text-white"
      >
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2 opacity-50">
            <Activity size={32} strokeWidth={1} className="animate-pulse" />
            <p className="uppercase tracking-widest text-[9px]">Initializing telemetry link...</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 border-l border-white/5 pl-3 hover:bg-white/5 transition-colors duration-150"
            >
              <span className="text-zinc-600 shrink-0 select-none">[{log.timestamp}]</span>
              <span className={`break-all ${
                log.type === 'error' ? 'text-red-400 font-bold' :
                log.type === 'warn' ? 'text-amber-400' :
                log.type === 'success' ? 'text-green-400' :
                'text-zinc-300'
              }`}>
                <span className="text-white/20 mr-2 opacity-50">❯</span>
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex justify-between items-center">
        <div className="text-[9px] font-medium text-zinc-500 uppercase tracking-tighter">
          Buffer: {logs.length} events
        </div>
        <div className="flex items-center gap-1">
           <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
           <span className="text-[9px] font-black italic text-red-500 uppercase">Live Output</span>
        </div>
      </div>
    </div>
  );
};

export default StreamConsole;
