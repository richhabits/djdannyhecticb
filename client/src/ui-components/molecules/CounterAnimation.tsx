/**
 * CounterAnimation Component
 * Animates counting from 0 to a target number
 */

import { useState, useEffect } from 'react';

interface CounterAnimationProps {
  target: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
  start?: number;
  easing?: (progress: number) => number;
}

export function CounterAnimation({
  target,
  duration = 1000,
  format,
  className = '',
  start = 0,
  easing = (p) => p, // linear by default
}: CounterAnimationProps) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      setCount(Math.floor(start + (target - start) * easedProgress));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration, start, easing]);

  return <span className={className}>{format ? format(count) : count}</span>;
}

/**
 * Progress Counter with Label
 */
interface ProgressCounterProps {
  current: number;
  total: number;
  duration?: number;
  format?: (current: number, total: number) => string;
  className?: string;
}

export function ProgressCounter({
  current,
  total,
  duration = 1000,
  format,
  className = '',
}: ProgressCounterProps) {
  return (
    <div className={className}>
      <CounterAnimation
        target={current}
        duration={duration}
        format={(count) =>
          format ? format(count, total) : `${count} / ${total}`
        }
      />
    </div>
  );
}

/**
 * Percentage Counter with visual indicator
 */
interface PercentageCounterProps {
  percentage: number;
  duration?: number;
  showLabel?: boolean;
  className?: string;
}

export function PercentageCounter({
  percentage,
  duration = 1000,
  showLabel = true,
  className = '',
}: PercentageCounterProps) {
  return (
    <div className={className}>
      <div className="relative inline-block">
        <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="var(--color-bg-tertiary)"
            strokeWidth="4"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="var(--color-accent-primary)"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - percentage / 100)}`}
            style={{
              transition: `stroke-dashoffset ${duration}ms ease-out`,
            }}
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CounterAnimation
              target={percentage}
              duration={duration}
              format={(num) => `${num}%`}
              className="text-2xl font-bold"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Stat Counter - displays number with label
 */
interface StatCounterProps {
  label: string;
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function StatCounter({
  label,
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  className = '',
}: StatCounterProps) {
  return (
    <div className={`text-center ${className}`}>
      <div className="text-3xl font-bold mb-sm">
        {prefix}
        <CounterAnimation target={value} duration={duration} />
        {suffix}
      </div>
      <div className="text-text-secondary">{label}</div>
    </div>
  );
}

/**
 * Easing functions for counter animations
 */
export const easingFunctions = {
  linear: (p: number) => p,
  easeOut: (p: number) => 1 - Math.pow(1 - p, 3),
  easeIn: (p: number) => Math.pow(p, 3),
  easeInOut: (p: number) => (p < 0.5 ? 4 * p ** 3 : 1 - Math.pow(-2 * p + 2, 3) / 2),
};
