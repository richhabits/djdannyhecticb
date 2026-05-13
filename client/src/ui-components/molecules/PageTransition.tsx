import { useEffect, useState } from 'react';

export interface PageTransitionProps {
  children: React.ReactNode;
  direction?: 'in' | 'out';
  duration?: 'fast' | 'base' | 'slow';
  className?: string;
}

/**
 * PageTransition - Smooth page enter/exit animations
 *
 * Provides elegant fade and scale transitions for page navigation
 * with customizable speed and direction.
 *
 * @example
 * ```tsx
 * <PageTransition direction="in" duration="base">
 *   <MyPage />
 * </PageTransition>
 * ```
 */
export function PageTransition({
  children,
  direction = 'in',
  duration = 'base',
  className = '',
}: PageTransitionProps) {
  const durationMap = {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
  };

  const easingMap = {
    in: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    out: 'cubic-bezier(0.4, 0, 1, 1)',
  };

  const animationName = direction === 'in' ? 'pageEnter' : 'pageExit';

  return (
    <div
      className={className}
      style={{
        animation: `${animationName} ${durationMap[duration]} ${easingMap[direction]} forwards`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * FadeInUp - Fade in with upward movement
 */
export function FadeInUp({
  children,
  duration = 'base',
  className = '',
}: Omit<PageTransitionProps, 'direction'>) {
  const durationMap = {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
  };

  return (
    <div
      className={className}
      style={{
        animation: `fadeInUp ${durationMap[duration]} cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * FadeOutDown - Fade out with downward movement
 */
export function FadeOutDown({
  children,
  duration = 'base',
  className = '',
}: Omit<PageTransitionProps, 'direction'>) {
  const durationMap = {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
  };

  return (
    <div
      className={className}
      style={{
        animation: `fadeOutDown ${durationMap[duration]} cubic-bezier(0.4, 0, 1, 1) forwards`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * StaggeredTransition - Applies staggered animation delays to children
 */
export interface StaggeredTransitionProps {
  children: React.ReactNode;
  staggerDelay?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StaggeredTransition({
  children,
  staggerDelay = 'md',
  className = '',
}: StaggeredTransitionProps) {
  const delayMap = {
    sm: 50,
    md: 100,
    lg: 150,
  };

  const delay = delayMap[staggerDelay];

  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              style={{
                animation: `fadeInUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                animationDelay: `${index * delay}ms`,
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
