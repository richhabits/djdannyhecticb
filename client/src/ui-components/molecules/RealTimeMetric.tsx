import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface RealTimeMetricProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

const RealTimeMetric: React.FC<RealTimeMetricProps> = ({
  label,
  value,
  icon: Icon,
  unit,
  trend,
  color = 'red'
}) => {
  const colorClasses: Record<string, string> = {
    red: 'from-red-500/20 to-red-600/5 border-red-500/20 text-red-500',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-500',
    green: 'from-green-500/20 to-green-600/5 border-green-500/20 text-green-500',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-500',
    gold: 'from-amber-400/20 to-amber-600/5 border-amber-500/20 text-amber-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`relative p-4 rounded-xl border bg-gradient-to-br ${colorClasses[color] || colorClasses.red} backdrop-blur-md overflow-hidden glassmorphism`}
    >
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1 leading-none">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-black italic tracking-tighter text-white">
              {value}
            </h3>
            {unit && (
              <span className="text-[10px] font-bold text-white/30 uppercase italic">
                {unit}
              </span>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg bg-black/40 border border-white/5`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>

      {/* Decorative pulse element */}
      <div className="absolute -bottom-2 -right-2 opacity-10">
        <Icon size={64} />
      </div>

      {/* Dynamic scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-scanline opacity-[0.03]" />
    </motion.div>
  );
};

export default RealTimeMetric;
