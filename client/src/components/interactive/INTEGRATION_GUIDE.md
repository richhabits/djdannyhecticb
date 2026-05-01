# Advanced Interactions Integration Guide

Quick start guide for implementing advanced micro-interactions in your djdannyhecticb pages.

## What's Included

### New Hooks (client/src/hooks/)
- **useGestureSupport.ts** - Touch gesture detection (swipe, long-press, double-tap)
- **useIntersectionAnimation.ts** - Scroll-triggered animations

### New Components (client/src/components/interactive/)
- **PageTransition.tsx** - Smooth page enter/exit transitions
- **SwipeableCard.tsx** - Interactive swipeable cards with dismissal
- **MorphShape.tsx** - Animated morphing background shapes

### New Styles (client/src/styles/)
- **advanced-animations.css** - 30+ animation keyframes and utility classes

### Demo & Documentation
- **InteractionDemo.tsx** - Comprehensive showcase of all interactions
- **ADVANCED_INTERACTIONS.md** - Complete API documentation

---

## Quick Start

### 1. Import Components
```tsx
// Page transitions
import { PageTransition, FadeInUp } from '@/components/interactive';

// Gesture support
import { SwipeableCard, SwipeableDismissCard } from '@/components/interactive';

// Animated shapes
import { MorphShape, FloatingShapeBackground } from '@/components/interactive';

// Hooks
import { useGestureSupport, useIntersectionAnimation } from '@/hooks';
```

### 2. Wrap Pages with Transitions
```tsx
export function MyPage() {
  return (
    <PageTransition direction="in" duration="base">
      <div className="space-y-8 p-8">
        {/* Your page content */}
      </div>
    </PageTransition>
  );
}
```

### 3. Add Swipeable Elements
```tsx
export function AlertList() {
  return (
    <div className="space-y-2">
      <SwipeableDismissCard
        onDismiss={() => removeAlert()}
        dismissDirection="left"
        showFeedback
      >
        <Alert message="Swipe me to dismiss!" />
      </SwipeableDismissCard>
    </div>
  );
}
```

### 4. Use Gesture Detection
```tsx
export function GestureComponent() {
  const gestureRef = useGestureSupport({
    onSwipeLeft: () => console.log('Left swipe'),
    onLongPress: () => console.log('Long press'),
    onDoubleTap: () => console.log('Double tap'),
  });

  return <div ref={gestureRef.current}>Tap and swipe me</div>;
}
```

### 5. Add Scroll Animations
```tsx
export function ScrollAnimatedSection() {
  const { ref, isVisible } = useIntersectionAnimation();

  return (
    <div
      ref={ref}
      className={isVisible ? 'animate-page-enter' : 'opacity-0'}
    >
      This animates in when scrolled into view
    </div>
  );
}
```

---

## Animation Utility Classes

Quick reference for available CSS animation classes:

### Page Entry/Exit
- `.animate-page-enter` - Fade in with bounce
- `.animate-page-exit` - Fade out
- `.animate-fade-in-up` - Fade in upward
- `.animate-fade-out-down` - Fade out downward

### Swipe Animations
- `.animate-swipe-out-left` - Swipe left exit
- `.animate-swipe-in-right` - Swipe right enter
- `.animate-swipe-out-right` - Swipe right exit
- `.animate-swipe-in-left` - Swipe left enter

### Floating & Morphing
- `.animate-float` - Gentle floating motion
- `.animate-bob` - Bobbing motion
- `.animate-morph` - Shape morphing
- `.animate-morph-pulse` - Morph with pulse

### Loading & Shimmer
- `.animate-shimmer-loading` - Shimmer loading effect
- `.animate-pulse-glow` - Pulsing glow
- `.animate-pulse-scale` - Scale pulsing

### Bounce & Elastic
- `.animate-bounce-in` - Bounce entrance
- `.animate-bounce-out` - Bounce exit
- `.animate-elastic-x` - Horizontal elastic

### Rotation
- `.animate-spin-fast` - Fast rotation
- `.animate-spin-slow` - Slow rotation
- `.animate-wobble` - Wobble shake

---

## Integration Checklist

- [ ] Review `InteractionDemo.tsx` to see all interactions in action
- [ ] Update your pages to use `PageTransition` wrappers
- [ ] Add swipeable cards to dismissible alerts
- [ ] Use `useIntersectionAnimation` for scroll-triggered effects
- [ ] Apply morphing shapes as background decorations
- [ ] Test on mobile devices for touch interactions
- [ ] Verify `prefers-reduced-motion` is respected in browser settings
- [ ] Check accessibility: keyboard support for all gesture-based interactions

---

## Key Features

### Gesture Support
- **Swipe Detection**: Left, right, up, down with 50px threshold
- **Long Press**: 500ms duration with 10px movement tolerance
- **Double Tap**: 300ms window for rapid successive taps
- **Accessibility**: Keyboard fallbacks for all gesture interactions

### Animation Performance
- GPU-accelerated using `transform` and `opacity`
- Respects `prefers-reduced-motion` media query
- Efficient event listeners with proper cleanup
- ~30KB CSS (when minified and gzipped)

### Mobile Optimization
- Touch-optimized with 44×44px minimum touch targets
- Single-touch detection to prevent multi-touch interference
- No layout shifts or jank
- Fast, snappy animations (150-500ms range)

---

## Common Patterns

### Dismissible Alerts
```tsx
<SwipeableDismissCard onDismiss={handleDismiss} dismissDirection="left">
  <Alert severity="warning" message="Swipe to dismiss" />
</SwipeableDismissCard>
```

### Animated Page Navigation
```tsx
<PageTransition direction="in" duration="fast">
  <HomePage />
</PageTransition>
```

### Scroll-Triggered Effects
```tsx
const { ref, isVisible } = useIntersectionAnimation();
<div ref={ref} className={isVisible ? 'animate-page-enter' : 'opacity-0'}>
  Content
</div>
```

### Morphing Backgrounds
```tsx
<div className="relative bg-slate-900">
  <FloatingShapeBackground variant="primary" intensity="medium" />
  <div className="relative z-10">Your content</div>
</div>
```

---

## Testing

### Manual Testing
1. Test all swipe directions on mobile
2. Test long-press (hold for 500ms)
3. Test double-tap (two quick taps)
4. Verify animations run smoothly at 60fps
5. Check reduced motion support in accessibility settings

### Accessibility Testing
1. Test keyboard navigation (Tab, Enter, Space)
2. Test with screen readers
3. Verify touch targets are >= 44×44px
4. Check color contrast in all animation states
5. Verify animations respect `prefers-reduced-motion`

---

## Performance Tips

1. **Don't animate too many elements**: Limit concurrent animations to <5
2. **Use will-change sparingly**: Only on animated elements
3. **Lazy load animations**: Use `useIntersectionAnimation` for off-screen content
4. **Profile animations**: Use Chrome DevTools Performance tab
5. **Test on real devices**: Emulators don't match real performance

---

## Browser Support

| Feature | Support |
|---------|---------|
| Touch Gestures | iOS Safari 5+, Android Chrome 30+ |
| Intersection Observer | All modern browsers |
| CSS Animations | All modern browsers |
| Transform/Opacity | All modern browsers (GPU accelerated) |
| Reduced Motion | All modern browsers |

---

## Troubleshooting

### Swipes not detected
- Check that touch target is at least 44×44px
- Verify you're on a touch device (not mouse emulation)
- Check browser console for errors

### Animations janky or stuttering
- Check DevTools Performance tab for long tasks
- Reduce number of concurrent animations
- Use `will-change: transform` on heavily animated elements
- Profile with Lighthouse

### Touch feedback not working
- Verify `showFeedback={true}` prop is set
- Check that `-webkit-tap-highlight-color` is configured
- Test on real mobile device (not emulation)

---

See **ADVANCED_INTERACTIONS.md** for detailed API documentation.

See **InteractionDemo.tsx** for working examples of all features.
