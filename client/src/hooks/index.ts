/**
 * Hooks Export Barrel
 * Central export point for all custom hooks
 */

// Accessibility & Mobile
export { useAccessibilityEnhancements } from './useAccessibilityEnhancements';
export { useMobile } from './useMobile';
export { usePrefersReducedMotion } from './usePrefersReducedMotion';

// State Management
export { useAlertQueue } from './useAlertQueue';
export { useAnimationState } from './useAnimationState';
export { useLoadingState } from './useLoadingState';

// Composition & Utilities
export { useComposition } from './useComposition';
export { usePersistFn } from './usePersistFn';
export { useLazyLoad } from './useLazyLoad';

// Animation Hooks
export { useStaggeredAnimation } from './useStaggeredAnimation';

// Advanced Gesture & Interaction Hooks
export { useGestureSupport, type GestureHandlers } from './useGestureSupport';
export { useIntersectionAnimation, type UseIntersectionAnimationOptions } from './useIntersectionAnimation';
