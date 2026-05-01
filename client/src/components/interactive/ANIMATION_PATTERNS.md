# Animation & Interactive State System

Comprehensive animation and micro-interaction system for smooth, responsive UI with visual state feedback.

## Core Files

- `/styles/animations.css` - Complete animation system with 25+ animations
- `/components/interactive/` - 8+ reusable interactive components
- `/hooks/` - State management hooks for animations and loading

## Animation Classes

### Entrance Animations (200ms, ease-out)

```tsx
.animate-slide-in-top      // Slide down from top
.animate-slide-in-bottom   // Slide up from bottom
.animate-slide-in-left     // Slide from left
.animate-slide-in-right    // Slide from right
.animate-fade-in           // Simple fade
.animate-fade-in-scale     // Fade + scale from 0.95
```

### Exit Animations (150ms, ease-in)

```tsx
.animate-slide-out-top     // Slide up and fade
.animate-slide-out-bottom  // Slide down and fade
.animate-slide-out-left    // Slide left and fade
.animate-slide-out-right   // Slide right and fade
.animate-fade-out          // Simple fade
.animate-fade-out-scale    // Fade + scale to 0.95
```

### Feedback Animations (300ms, infinite)

```tsx
.animate-pulse-soft        // Gentle opacity pulse
.animate-pulse             // Standard pulse
.animate-shimmer           // Loading shimmer effect
.animate-bounce-soft       // Subtle upward bounce
.animate-bounce            // More pronounced bounce
.animate-glow              // Pulsing glow effect
.animate-spin              // Full 360° rotation
.animate-float             // Floating motion
.animate-shake             // Error shake
.animate-heartbeat         // Scale pulse
.animate-wiggle            // Rotation wiggle
.animate-confetti          // Celebratory confetti
```

### Transition Utilities

```tsx
.transition-fast           // 150ms all properties
.transition-base           // 200ms all properties
.transition-slow           // 300ms all properties
.transition-colors-fast    // Color transitions only
.transition-transform-base // Transform transitions
.transition-shadow-base    // Shadow transitions
```

### Hover Effects

```tsx
.hover-lift       // -4px translateY + shadow
.hover-glow       // 24px red glow
.hover-scale      // 1.05x scale
.hover-scale-sm   // 1.02x scale
```

### Loading States

```tsx
.skeleton              // Shimmer background
.skeleton-text         // Text placeholder
.skeleton-image        // 16:9 image placeholder
.skeleton-card         // Card placeholder
```

## Component Usage Examples

### Loading Skeleton

```tsx
import { EventCardSkeleton, CardListSkeleton } from '@/components/interactive';

function EventsList() {
  const [events, setEvents] = useState(null);

  return (
    <div>
      {events ? (
        events.map(event => <EventCard key={event.id} {...event} />)
      ) : (
        <CardListSkeleton count={3} />
      )}
    </div>
  );
}
```

### Transition Wrapper

```tsx
import { TransitionWrapper, StaggeredTransition } from '@/components/interactive';

function Modal({ isOpen, children }) {
  return (
    <TransitionWrapper
      isVisible={isOpen}
      animateIn="fade-scale"
      animateOut="fade-scale"
      duration="base"
    >
      {children}
    </TransitionWrapper>
  );
}

function List({ items }) {
  return (
    <StaggeredTransition
      animateIn="slide-right"
      staggerDelay={100}
      className="space-y-md"
    >
      {items.map(item => <ListItem key={item.id} {...item} />)}
    </StaggeredTransition>
  );
}
```

### State Button

```tsx
import { StateButton } from '@/components/interactive';
import { useLoadingState } from '@/hooks/useLoadingState';

function BookingForm() {
  const { isLoading, error, execute } = useLoadingState();

  const handleSubmit = async () => {
    await execute(submitBooking());
  };

  return (
    <StateButton
      isLoading={isLoading}
      isError={!!error}
      onClick={handleSubmit}
      loadingText="Booking..."
      errorText={error || 'Booking Failed'}
    >
      Book Now
    </StateButton>
  );
}
```

### State Input with Validation

```tsx
import { StateInput } from '@/components/interactive';

function EmailInput() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError(value.includes('@') ? '' : 'Invalid email');
  };

  return (
    <StateInput
      type="email"
      label="Email Address"
      value={email}
      onChange={handleChange}
      error={error}
      helpText="We'll never share your email"
      placeholder="you@example.com"
    />
  );
}
```

### Hover Card

```tsx
import { HoverCard, LiftCard, GlowCard } from '@/components/interactive';

function EventCard({ event }) {
  return (
    <LiftCard>
      <img src={event.image} alt={event.name} />
      <h3>{event.name}</h3>
      <p>{event.description}</p>
    </LiftCard>
  );
}

function ArtistCard({ artist }) {
  return (
    <GlowCard className="p-lg">
      <h3>{artist.name}</h3>
      <p className="text-text-secondary">{artist.bio}</p>
    </GlowCard>
  );
}
```

### Typing Animation

```tsx
import { TypingAnimation, MultiLineTyping } from '@/components/interactive';

function Intro() {
  return (
    <div>
      <TypingAnimation
        text="Welcome to Ghost Detail"
        speed={50}
        onComplete={() => console.log('Done')}
      />
    </div>
  );
}
```

### Counter Animation

```tsx
import { CounterAnimation, StatCounter, PercentageCounter } from '@/components/interactive';

function Stats() {
  return (
    <div className="grid grid-cols-3 gap-lg">
      <StatCounter
        label="Total Streams"
        value={1250000}
        suffix="M"
        duration={2000}
      />
      <StatCounter
        label="Active Listeners"
        value={45}
        prefix="+"
        duration={1500}
      />
      <PercentageCounter
        percentage={85}
        duration={1000}
        showLabel
      />
    </div>
  );
}
```

## Hooks Usage

### useLoadingState

```tsx
const { isLoading, error, execute, reset } = useLoadingState();

await execute(fetchData());
```

### useStaggeredAnimation

```tsx
const containerRef = useStaggeredAnimation('.list-container', 100);

// In JSX:
<div className="list-container">
  {items.map(item => (
    <div key={item.id} data-stagger>
      {item.name}
    </div>
  ))}
</div>
```

### useAnimationState

```tsx
const {
  isVisible,
  isEntering,
  isExiting,
  enter,
  exit,
  onAnimationComplete,
} = useAnimationState();

// Control visibility
<button onClick={enter}>Show</button>
<button onClick={exit}>Hide</button>
```

### useHoverState

```tsx
const { isHovered, handlers } = useHoverState();

<div {...handlers} className={isHovered ? 'opacity-100' : 'opacity-70'}>
  Hover me
</div>
```

## State Patterns

### Button States

```tsx
<button
  disabled={isLoading}
  className="
    px-md py-sm rounded-md font-semibold
    bg-accent-red text-white
    transition-all duration-base
    hover:bg-accent-red-hover hover:shadow-lg
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:outline-2 focus-visible:outline-offset-2
  "
>
  {isLoading ? <>⏳ Loading...</> : 'Click me'}
</button>
```

### Input States

```tsx
<input
  className="
    px-md py-sm rounded-md
    bg-dark-surface border-2 border-border-primary
    text-text-primary placeholder-text-tertiary
    transition-colors duration-base
    focus-visible:outline-none focus-visible:border-accent-red
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-accent-danger' : ''}
  "
/>
```

### Loading State Pattern

```tsx
{isLoading ? (
  <CardListSkeleton count={3} />
) : (
  <div className="animate-fade-in-scale">
    {/* Content */}
  </div>
)}
```

## Design Specifications

- **Entrance Duration**: 200ms (ease-out)
- **Exit Duration**: 150ms (ease-in)
- **Feedback Duration**: 300ms (infinite)
- **Disabled Opacity**: 50%
- **Focus Ring**: 2px with 2px offset
- **Hover Effects**: Scale (1.02-1.05), Y offset (-4px), glow
- **Active Effects**: Scale to 0.95
- **Hardware Acceleration**: All animations use transform/opacity
- **Touch Friendly**: 44px minimum tap targets
- **Reduced Motion**: Supported via @media prefers-reduced-motion

## Accessibility

All animations include:
- Proper ARIA attributes for state
- Focus rings on interactive elements (2px, 2px offset)
- Color contrast for visual states
- Reduced motion support for users who prefer it
- Meaningful loading states with spinner + text
- Error states with icons + descriptive text
- Success feedback for confirmations

## Performance Tips

1. Use `transform` and `opacity` for smooth 60fps animations
2. Avoid animating `width`, `height`, or `position`
3. Use `will-change: transform` for frequently animated elements
4. Batch animations with stagger delays (100-200ms)
5. Debounce rapid state changes
6. Clean up animations on component unmount

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- CSS animations hardware accelerated
- requestAnimationFrame for smooth counter animations
- Fallback to instant states if animations disabled
