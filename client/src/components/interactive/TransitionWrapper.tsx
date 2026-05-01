/**
 * TransitionWrapper Component
 * Provides smooth entrance and exit animations for content
 */

import React, { ReactNode } from 'react';

type AnimationType = 'slide-top' | 'fade-scale' | 'slide-right' | 'slide-bottom' | 'fade';
type DurationType = 'fast' | 'base' | 'slow';

interface TransitionWrapperProps {
  children: ReactNode;
  animateIn?: AnimationType;
  animateOut?: AnimationType;
  duration?: DurationType;
  isVisible?: boolean;
  className?: string;
  onAnimationComplete?: () => void;
}

const animationMap: Record<AnimationType, { in: string; out: string }> = {
  'slide-top': {
    in: 'animate-slide-in-top',
    out: 'animate-slide-out-top',
  },
  'fade-scale': {
    in: 'animate-fade-in-scale',
    out: 'animate-fade-out-scale',
  },
  'slide-right': {
    in: 'animate-slide-in-right',
    out: 'animate-slide-out-left',
  },
  'slide-bottom': {
    in: 'animate-slide-in-bottom',
    out: 'animate-slide-out-bottom',
  },
  'fade': {
    in: 'animate-fade-in',
    out: 'animate-fade-out',
  },
};

const durationMap: Record<DurationType, string> = {
  fast: 'animate-duration-fast',
  base: 'animate-duration-base',
  slow: 'animate-duration-slow',
};

export function TransitionWrapper({
  children,
  animateIn = 'fade-scale',
  animateOut = 'fade-scale',
  duration = 'base',
  isVisible = true,
  className = '',
  onAnimationComplete,
}: TransitionWrapperProps) {
  const animation = isVisible ? animationMap[animateIn].in : animationMap[animateOut].out;
  const durationClass = durationMap[duration];

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`${animation} ${durationClass} ${className}`}
      onAnimationEnd={onAnimationComplete}
    >
      {children}
    </div>
  );
}

/**
 * Staggered Transition Wrapper for Lists
 */
interface StaggeredTransitionProps {
  children: ReactNode;
  animateIn?: AnimationType;
  duration?: DurationType;
  staggerDelay?: number;
  isVisible?: boolean;
  className?: string;
}

export function StaggeredTransition({
  children,
  animateIn = 'fade-scale',
  duration = 'base',
  staggerDelay = 100,
  isVisible = true,
  className = '',
}: StaggeredTransitionProps) {
  const animation = animationMap[animateIn].in;
  const durationClass = durationMap[duration];

  if (!isVisible) {
    return null;
  }

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={`${animation} ${durationClass}`}
          style={{ animationDelay: `${index * staggerDelay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/**
 * Conditional Transition Wrapper
 * Smoothly transitions between two states
 */
interface ConditionalTransitionProps<T> {
  condition: boolean;
  trueComponent: ReactNode;
  falseComponent?: ReactNode;
  animateIn?: AnimationType;
  animateOut?: AnimationType;
  duration?: DurationType;
  className?: string;
}

export function ConditionalTransition<T>({
  condition,
  trueComponent,
  falseComponent,
  animateIn = 'fade-scale',
  animateOut = 'fade-scale',
  duration = 'base',
  className = '',
}: ConditionalTransitionProps<T>) {
  return (
    <TransitionWrapper
      isVisible={condition}
      animateIn={animateIn}
      animateOut={animateOut}
      duration={duration}
      className={className}
    >
      {trueComponent}
    </TransitionWrapper>
  );
}
