/**
 * Card Composition Patterns
 * Reusable card layouts: media, text, actions, interactive states
 * Last updated: 2026-05-01
 */

import React, { ReactNode } from 'react';
import clsx from 'clsx';

/* ============================================================================
   CARD WITH MEDIA (IMAGE/VIDEO HEADER)
   ============================================================================ */

interface CardWithMediaProps {
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  mediaAlt?: string;
  title: string;
  subtitle?: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  variant?: 'default' | 'overlay' | 'featured';
  className?: string;
}

export const CardWithMedia = ({
  mediaUrl,
  mediaType = 'image',
  mediaAlt = '',
  title,
  subtitle,
  description,
  children,
  actions,
  variant = 'default',
  className,
}: CardWithMediaProps) => {
  return (
    <div
      className={clsx(
        'bg-dark-surface rounded-lg overflow-hidden border border-dark-border transition-all duration-base hover:shadow-lg',
        variant === 'featured' && 'shadow-md',
        className
      )}
    >
      {/* Media Section */}
      <div className="relative overflow-hidden bg-dark-bg aspect-video">
        {mediaType === 'image' ? (
          <img
            src={mediaUrl}
            alt={mediaAlt}
            className="w-full h-full object-cover transition-transform duration-slow hover:scale-105"
          />
        ) : (
          <video
            src={mediaUrl}
            className="w-full h-full object-cover"
            controls={false}
          />
        )}

        {variant === 'overlay' && (
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent" />
        )}
      </div>

      {/* Content Section */}
      <div className="p-lg">
        {subtitle && (
          <p className="text-caption text-text-secondary mb-xs font-medium uppercase tracking-wider">
            {subtitle}
          </p>
        )}

        <h3 className="text-h2 font-bold mb-sm text-text-primary">{title}</h3>

        {description && (
          <p className="text-body text-text-secondary mb-md leading-relaxed">
            {description}
          </p>
        )}

        {children}
      </div>

      {/* Action Section */}
      {actions && (
        <div className="px-lg pb-lg flex gap-sm flex-wrap">{actions}</div>
      )}
    </div>
  );
};

/* ============================================================================
   CARD WITH SIDE MEDIA (IMAGE ON LEFT/RIGHT)
   ============================================================================ */

interface CardWithSideMediaProps {
  mediaUrl: string;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  mediaPosition?: 'left' | 'right';
  mediaSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CardWithSideMedia = ({
  mediaUrl,
  title,
  description,
  children,
  actions,
  mediaPosition = 'left',
  mediaSize = 'md',
  className,
}: CardWithSideMediaProps) => {
  const mediaWidthClass = {
    sm: 'w-24',
    md: 'w-32',
    lg: 'w-48',
  }[mediaSize];

  return (
    <div
      className={clsx(
        'flex gap-md bg-dark-surface rounded-lg border border-dark-border overflow-hidden transition-all duration-base hover:shadow-lg',
        mediaPosition === 'right' && 'flex-row-reverse',
        className
      )}
    >
      {/* Media */}
      <div className={clsx('flex-shrink-0', mediaWidthClass, 'h-auto aspect-square')}>
        <img
          src={mediaUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-md flex flex-col justify-between">
        <div>
          <h3 className="text-h3 font-bold mb-sm text-text-primary">{title}</h3>
          {description && (
            <p className="text-body text-text-secondary">{description}</p>
          )}
          {children}
        </div>

        {actions && (
          <div className="flex gap-sm mt-md flex-wrap">{actions}</div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   INTERACTIVE CARD (HOVER REVEAL ACTIONS)
   ============================================================================ */

interface InteractiveCardProps {
  title: string;
  subtitle?: string;
  description: string;
  children?: ReactNode;
  actions: ReactNode;
  coverImage?: string;
  onClick?: () => void;
  className?: string;
}

export const InteractiveCard = ({
  title,
  subtitle,
  description,
  children,
  actions,
  coverImage,
  onClick,
  className,
}: InteractiveCardProps) => {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-lg border border-dark-border transition-all duration-base cursor-pointer group',
        'hover:shadow-lg hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      {coverImage && (
        <div className="absolute inset-0 -z-10">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-slow"
          />
          <div className="absolute inset-0 bg-dark-bg/80 group-hover:bg-dark-bg/60 transition-colors duration-base" />
        </div>
      )}

      <div className={clsx(!coverImage && 'bg-dark-surface', 'p-lg')}>
        {subtitle && (
          <p className="text-caption text-accent-primary font-semibold mb-xs uppercase tracking-wide">
            {subtitle}
          </p>
        )}

        <h3 className="text-h2 font-bold mb-sm text-text-primary group-hover:text-accent-red transition-colors">
          {title}
        </h3>

        <p className="text-body text-text-secondary mb-lg group-hover:text-text-primary transition-colors">
          {description}
        </p>

        {children}

        {/* Hidden action section, reveals on hover */}
        <div
          className={clsx(
            'mt-lg flex gap-sm opacity-0 group-hover:opacity-100 transition-opacity duration-base transform',
            'translate-y-2 group-hover:translate-y-0 transition-transform duration-base'
          )}
        >
          {actions}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   MINIMAL TEXT CARD
   ============================================================================ */

interface MinimalCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  accent?: boolean;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export const MinimalCard = ({
  title,
  description,
  icon,
  accent,
  onClick,
  className,
  children,
}: MinimalCardProps) => {
  return (
    <div
      className={clsx(
        'p-md rounded-lg border border-dark-border transition-all duration-base',
        accent
          ? 'bg-dark-bg border-accent-red/30 hover:border-accent-red hover:bg-dark-surface'
          : 'bg-dark-surface hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {icon && <div className="mb-md text-accent-red text-2xl">{icon}</div>}

      <h3 className="text-h3 font-bold mb-xs text-text-primary">{title}</h3>

      {description && (
        <p className="text-body text-text-secondary">{description}</p>
      )}

      {children}
    </div>
  );
};

/* ============================================================================
   STAT CARD (For metrics, numbers, KPIs)
   ============================================================================ */

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  icon?: ReactNode;
  className?: string;
}

export const StatCard = ({
  label,
  value,
  unit,
  trend,
  trendValue,
  icon,
  className,
}: StatCardProps) => {
  return (
    <div
      className={clsx(
        'bg-dark-surface p-lg rounded-lg border border-dark-border',
        'transition-all duration-base hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between mb-md">
        <span className="text-caption text-text-secondary font-medium uppercase">
          {label}
        </span>
        {icon && <div className="text-2xl text-accent-red">{icon}</div>}
      </div>

      <div className="mb-md">
        <span className="text-display font-bold text-text-primary">
          {value}
        </span>
        {unit && (
          <span className="text-body text-text-secondary ml-xs">{unit}</span>
        )}
      </div>

      {trend && trendValue && (
        <div
          className={clsx(
            'text-caption font-semibold',
            trend === 'up' && 'text-accent-success',
            trend === 'down' && 'text-accent-danger',
            trend === 'neutral' && 'text-text-secondary'
          )}
        >
          {trend === 'up' && '↑'} {trend === 'down' && '↓'} {trendValue}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   TIMELINE CARD
   ============================================================================ */

interface TimelineCardProps {
  timestamp: string;
  title: string;
  description?: string;
  status?: 'completed' | 'in-progress' | 'pending';
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const TimelineCard = ({
  timestamp,
  title,
  description,
  status = 'completed',
  icon,
  children,
  className,
}: TimelineCardProps) => {
  const statusClass = {
    completed: 'bg-accent-success',
    'in-progress': 'bg-accent-orange',
    pending: 'bg-text-tertiary',
  }[status];

  return (
    <div className={clsx('flex gap-lg', className)}>
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div
          className={clsx(
            'w-3 h-3 rounded-full border-2 border-dark-border',
            statusClass
          )}
        />
        <div className="w-0.5 h-12 bg-dark-border mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-lg">
        <div className="flex items-center gap-sm mb-xs">
          {icon && <span className="text-accent-red">{icon}</span>}
          <h4 className="text-h3 font-bold text-text-primary">{title}</h4>
        </div>

        <p className="text-caption text-text-secondary mb-sm">{timestamp}</p>

        {description && (
          <p className="text-body text-text-secondary mb-md">{description}</p>
        )}

        {children}
      </div>
    </div>
  );
};

/* ============================================================================
   FEATURE COMPARISON CARD
   ============================================================================ */

interface FeatureItemProps {
  label: string;
  included: boolean;
}

interface FeatureComparisonCardProps {
  title: string;
  price?: string | number;
  description?: string;
  features: FeatureItemProps[];
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  recommended?: boolean;
  className?: string;
}

export const FeatureComparisonCard = ({
  title,
  price,
  description,
  features,
  primaryAction,
  secondaryAction,
  recommended,
  className,
}: FeatureComparisonCardProps) => {
  return (
    <div
      className={clsx(
        'rounded-lg border transition-all duration-base',
        recommended
          ? 'border-accent-red bg-dark-bg/50 shadow-lg scale-105'
          : 'border-dark-border bg-dark-surface hover:shadow-md',
        className
      )}
    >
      {recommended && (
        <div className="bg-accent-red text-text-primary text-center py-xs text-caption font-bold uppercase tracking-wide">
          Most Popular
        </div>
      )}

      <div className="p-lg">
        <h3 className="text-h2 font-bold mb-xs text-text-primary">{title}</h3>

        {price && (
          <div className="text-display font-bold text-accent-red mb-md">
            ${price} <span className="text-h3 text-text-secondary">/mo</span>
          </div>
        )}

        {description && (
          <p className="text-body text-text-secondary mb-lg">{description}</p>
        )}

        {/* Features list */}
        <ul className="space-y-sm mb-lg border-b border-dark-border pb-lg">
          {features.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-center gap-sm text-body text-text-secondary"
            >
              <span
                className={clsx(
                  'w-4 h-4 rounded flex items-center justify-center text-xs',
                  feature.included
                    ? 'bg-accent-success text-dark-bg'
                    : 'bg-dark-border text-text-tertiary'
                )}
              >
                {feature.included ? '✓' : '−'}
              </span>
              {feature.label}
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex flex-col gap-sm">
          {primaryAction}
          {secondaryAction}
        </div>
      </div>
    </div>
  );
};
