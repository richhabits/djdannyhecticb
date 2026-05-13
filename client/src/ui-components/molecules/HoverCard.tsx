/**
 * HoverCard Component
 * Card component with interactive hover effects
 */

import React, { ReactNode } from 'react';

interface HoverCardProps {
  children: ReactNode;
  scale?: boolean;
  glow?: boolean;
  lift?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function HoverCard({
  children,
  scale = false,
  glow = false,
  lift = false,
  className = '',
  onClick,
  disabled = false,
}: HoverCardProps) {
  const classes = [
    'transition-base',
    scale && 'hover-scale',
    glow && 'hover-glow',
    lift && 'hover-lift',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-disabled={disabled}
      onKeyDown={
        onClick && !disabled
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

/**
 * Interactive Card with State
 */
interface InteractiveCardProps {
  children: ReactNode;
  isActive?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onHover?: (isHovered: boolean) => void;
  className?: string;
}

export function InteractiveCard({
  children,
  isActive = false,
  isLoading = false,
  isError = false,
  onHover,
  className = '',
}: InteractiveCardProps) {
  const stateClass = isLoading ? 'opacity-60' : isError ? 'border-accent-danger' : '';

  return (
    <div
      className={`
        transition-base
        ${isActive ? 'bg-dark-tertiary' : ''}
        ${isError ? 'border-accent-danger' : ''}
        ${stateClass}
        ${className}
      `}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {children}
    </div>
  );
}

/**
 * Lift Card - elevates on hover
 */
interface LiftCardProps {
  children: ReactNode;
  className?: string;
}

export function LiftCard({ children, className = '' }: LiftCardProps) {
  return (
    <div
      className={`
        hover-lift
        rounded-lg
        border border-border-primary
        bg-dark-surface
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Glow Card - adds glow effect on hover
 */
interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowCard({
  children,
  className = '',
  glowColor = 'rgba(255, 68, 68, 0.5)',
}: GlowCardProps) {
  return (
    <div
      className={`
        hover-glow
        rounded-lg
        border border-border-primary
        bg-dark-surface
        transition-base
        ${className}
      `}
      style={
        {
          '--hover-glow-color': glowColor,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
