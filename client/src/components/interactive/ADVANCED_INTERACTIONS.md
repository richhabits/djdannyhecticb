# Advanced Interactions & Micro-Animations

Professional gesture support, page transitions, and sophisticated animations for djdannyhecticb.

## Components Overview

### Gesture & Touch

#### `useGestureSupport` Hook
Touch gesture detection with support for:
- Swipe gestures (left, right, up, down)
- Long-press detection (500ms threshold)
- Double-tap detection
- Customizable touch thresholds

**Usage:**
```tsx
import { useGestureSupport } from '@/hooks/useGestureSupport';

const ref = useGestureSupport({
  onSwipeLeft: () => console.log('Swiped left'),
  onSwipeRight: () => console.log('Swiped right'),
  onLongPress: () => console.log('Long pressed'),
  onDoubleTap: () => console.log('Double tapped'),
}, elementRef);
```

**Key Features:**
- Single-touch detection for accuracy
- 50px minimum swipe threshold
- 500ms long-press duration with 10px movement tolerance
- 300ms double-tap window
- Automatic event cleanup

---

#### `SwipeableCard` Component
Interactive card with built-in gesture support and visual feedback.

**Usage:**
```tsx
import { SwipeableCard } from '@/components/interactive/SwipeableCard';

<SwipeableCard
  onSwipeLeft={() => handleDismiss()}
  onLongPress={() => handleOptions()}
  showFeedback
  className="my-card"
>
  <div>Your card content</div>
</SwipeableCard>
```

**Props:**
- `onSwipeLeft`, `onSwipeRight`, `onSwipeUp`, `onSwipeDown`: Swipe handlers
- `onLongPress`: Long-press handler
- `onDoubleTap`: Double-tap handler
- `showFeedback`: Enable visual feedback (scale, opacity)
- `animationDelay`: Delay before handler execution (default: 200ms)
- `className`: Additional CSS classes

---

#### `SwipeableDismissCard` Component
Specialized card that automatically dismisses on swipe.

**Usage:**
```tsx
import { SwipeableDismissCard } from '@/components/interactive/SwipeableCard';

<SwipeableDismissCard
  onDismiss={() => removeItem()}
  dismissDirection="left"
  showFeedback
>
  <Alert>Swipe to dismiss</Alert>
</SwipeableDismissCard>
```

---

### Page Transitions

#### `PageTransition` Component
Smooth page entry/exit animations with bounce easing.

**Usage:**
```tsx
import { PageTransition } from '@/components/interactive/PageTransition';

<PageTransition direction="in" duration="base">
  <MyPage />
</PageTransition>
```

**Props:**
- `direction`: 'in' | 'out' (default: 'in')
- `duration`: 'fast' (150ms) | 'base' (300ms) | 'slow' (500ms)
- `className`: Additional CSS classes

---

#### `FadeInUp` Component
Fade in with upward movement animation.

**Usage:**
```tsx
<FadeInUp duration="base">
  <div>Content fades in and slides up</div>
</FadeInUp>
```

---

#### `FadeOutDown` Component
Fade out with downward movement animation.

**Usage:**
```tsx
<FadeOutDown duration="base">
  <div>Content fades out and slides down</div>
</FadeOutDown>
```

---

#### `StaggeredTransition` Component
Apply staggered animation delays to multiple children.

**Usage:**
```tsx
<StaggeredTransition staggerDelay="md">
  {items.map(item => (
    <div key={item.id}>{item.name}</div>
  ))}
</StaggeredTransition>
```

**Props:**
- `staggerDelay`: 'sm' (50ms) | 'md' (100ms) | 'lg' (150ms)

---

### Animated Shapes

#### `MorphShape` Component
Organic, fluid shapes that morph and animate continuously.

**Usage:**
```tsx
import { MorphShape } from '@/components/interactive/MorphShape';

<MorphShape
  variant="accent"
  size="md"
  animation="morph"
/>
```

**Props:**
- `variant`: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `animation`: 'morph' | 'morph-pulse' | 'float' | 'bob'

---

#### `MorphShapeGroup` Component
Multiple morphing shapes in a layered composition.

**Usage:**
```tsx
<MorphShapeGroup
  shapes={[
    { variant: 'accent', size: 'lg', animation: 'morph' },
    { variant: 'warning', size: 'md', animation: 'float' },
    { variant: 'success', size: 'sm', animation: 'bob' },
  ]}
/>
```

---

#### `FloatingShapeBackground` Component
Full-viewport morphing shape background.

**Usage:**
```tsx
<FloatingShapeBackground
  variant="primary"
  intensity="medium"  // 'light' | 'medium' | 'heavy'
/>
```

---

#### `PulsingMorphShape` Component
Morphing shape with pulsing glow effect.

**Usage:**
```tsx
<PulsingMorphShape variant="info" size="lg" />
```

---

### Scroll Animations

#### `useIntersectionAnimation` Hook
Trigger animations when elements enter viewport.

**Usage:**
```tsx
import { useIntersectionAnimation } from '@/hooks/useIntersectionAnimation';

const { ref, isVisible } = useIntersectionAnimation({
  threshold: 0.1,
  rootMargin: '0px',
  triggerOnce: true,
});

<div
  ref={ref}
  className={isVisible ? 'animate-page-enter' : 'opacity-0'}
>
  Content
</div>
```

**Options:**
- `threshold`: 0-1 or array of thresholds (default: 0.1)
- `rootMargin`: CSS margin string (default: '0px')
- `triggerOnce`: Only animate once (default: true)

---

## CSS Animation Classes

All animations are available as utility classes:

### Page Transitions
```css
.animate-page-enter         /* Fade in with scale */
.animate-page-enter-slow    /* Slow version */
.animate-page-enter-fast    /* Fast version */
.animate-page-exit          /* Fade out with scale */
.animate-fade-in-up         /* Fade in with upward movement */
.animate-fade-out-down      /* Fade out with downward movement */
```

### Swipe Animations
```css
.animate-swipe-out-left     /* Swipe left exit */
.animate-swipe-in-right     /* Swipe right enter */
.animate-swipe-out-right    /* Swipe right exit */
.animate-swipe-in-left      /* Swipe left enter */
.animate-swipe-out-up       /* Swipe up exit */
.animate-swipe-in-down      /* Swipe down enter */
```

### Morphing & Organic
```css
.animate-morph              /* Continuous morphing */
.animate-morph-pulse        /* Morph with scale pulse */
```

### Floating & Bobbing
```css
.animate-float              /* Gentle vertical float */
.animate-float-small        /* Smaller float effect */
.animate-bob                /* Bobbing motion with rotation */
```

### Loading & Shimmer
```css
.animate-shimmer-loading    /* Shimmer loading effect */
.animate-pulse-glow         /* Pulsing glow */
.animate-pulse-scale        /* Pulsing scale effect */
```

### Bounce & Elastic
```css
.animate-bounce-in          /* Scale bounce entrance */
.animate-bounce-out         /* Scale bounce exit */
.animate-elastic-x          /* Horizontal elastic squeeze */
```

### Rotation & Spin
```css
.animate-spin-fast          /* Fast 360° rotation */
.animate-spin-slow          /* Slow 360° rotation */
.animate-wobble             /* Side-to-side shake */
```

### Advanced Effects
```css
.animate-skew-enter         /* Skewed entrance */
.animate-perspective-pop    /* 3D perspective entrance */
```

### Gesture-Friendly Utilities
```css
.cursor-grab                /* Grab cursor for draggable elements */
.active:cursor-grabbing     /* Grabbing cursor when active */
.touch-none                 /* Disable default touch behavior */
.gesture-friendly           /* Remove tap highlight, disable selection */
```

### Staggered Delays
```css
.animate-stagger-1          /* 0.05s delay */
.animate-stagger-2          /* 0.1s delay */
.animate-stagger-3          /* 0.15s delay */
.animate-stagger-4          /* 0.2s delay */
.animate-stagger-5          /* 0.25s delay */
```

---

## Advanced Examples

### Swipeable List with Dismiss
```tsx
import { useState } from 'react';
import { SwipeableDismissCard } from '@/components/interactive/SwipeableCard';

export function SwipeableList() {
  const [items, setItems] = useState([1, 2, 3]);

  const handleDismiss = (id: number) => {
    setItems(prev => prev.filter(item => item !== id));
  };

  return (
    <div className="space-y-2">
      {items.map(id => (
        <SwipeableDismissCard
          key={id}
          onDismiss={() => handleDismiss(id)}
          dismissDirection="left"
          showFeedback
        >
          <div className="bg-purple-600 p-4 rounded">
            Item {id}
          </div>
        </SwipeableDismissCard>
      ))}
    </div>
  );
}
```

### Page with Scroll Animations
```tsx
import { useIntersectionAnimation } from '@/hooks/useIntersectionAnimation';

export function HomePage() {
  const { ref: section1, isVisible: s1Visible } = useIntersectionAnimation();
  const { ref: section2, isVisible: s2Visible } = useIntersectionAnimation();

  return (
    <div className="space-y-12 py-12">
      <div
        ref={section1}
        className={`${s1Visible ? 'animate-page-enter' : 'opacity-0'}`}
      >
        <h2>Section 1</h2>
      </div>

      <div
        ref={section2}
        className={`${s2Visible ? 'animate-fade-in-up' : 'opacity-0'}`}
      >
        <h2>Section 2</h2>
      </div>
    </div>
  );
}
```

---

## Performance Considerations

1. **Reduced Motion Support**: All animations respect `prefers-reduced-motion` media query
2. **GPU Acceleration**: Animations use `transform` and `opacity` for hardware acceleration
3. **Event Delegation**: Gesture hooks use efficient event listeners with proper cleanup
4. **Lazy Animation**: Scroll animations only trigger when elements are in viewport
5. **Touch Optimization**: Single-touch detection prevents accidental multi-touch interference

---

## Browser Support

- **Touch Gestures**: iOS Safari 5+, Android Chrome 30+
- **Intersection Observer**: Modern browsers (with polyfill available)
- **CSS Animations**: All modern browsers
- **Transforms & Opacity**: All modern browsers with hardware acceleration

---

## Accessibility

- All gesture interactions have keyboard fallbacks
- Animations respect `prefers-reduced-motion` setting
- Components are semantic with proper ARIA labels
- Touch targets are minimum 44×44px
- Color contrast maintained in all states

---

## Tips & Best Practices

1. **Swipe Handling**: Provide visual feedback for better UX
2. **Animation Duration**: Keep animations under 300ms for snappy feel
3. **Touch Targets**: Ensure interactive elements are at least 44×44px
4. **Gesture Precedence**: Swipes take precedence over scrolling
5. **Fallback UI**: Provide non-gesture alternatives for accessibility

---

See `InteractionDemo.tsx` for a comprehensive showcase of all interactions.
