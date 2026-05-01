# Interactive Components - Quick Start Guide

Get started with animations and state management in 5 minutes.

## Installation

All components are in the same codebase. Just import:

```tsx
import {
  StateButton,
  StateInput,
  TransitionWrapper,
  HoverCard,
  CardListSkeleton,
} from '@/components/interactive';

import {
  useLoadingState,
  useStaggeredAnimation,
  useAnimationState,
} from '@/hooks';
```

## 5-Minute Tutorial

### 1. Add a Button with Loading State

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
      onClick={handleSubmit}
      isLoading={isLoading}
      isError={!!error}
      loadingText="Booking..."
      errorText={error || 'Failed to book'}
    >
      Book Event
    </StateButton>
  );
}
```

### 2. Add Form Input with Validation

```tsx
import { StateInput } from '@/components/interactive';

function EmailForm() {
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
      helpText="We'll verify your email"
      placeholder="your@email.com"
    />
  );
}
```

### 3. Add Animated List

```tsx
import { StaggeredTransition } from '@/components/interactive';

function EventList({ events }) {
  return (
    <StaggeredTransition
      animateIn="slide-right"
      staggerDelay={100}
      className="space-y-md"
    >
      {events.map(event => (
        <EventCard key={event.id} {...event} />
      ))}
    </StaggeredTransition>
  );
}
```

### 4. Add Loading Skeleton

```tsx
import { CardListSkeleton } from '@/components/interactive';

function EventsList({ events, isLoading }) {
  if (isLoading) {
    return <CardListSkeleton count={3} />;
  }

  return (
    <div className="space-y-md">
      {events.map(event => (
        <EventCard key={event.id} {...event} />
      ))}
    </div>
  );
}
```

### 5. Add Hover Effects

```tsx
import { HoverCard, LiftCard, GlowCard } from '@/components/interactive';

function ArtistCard({ artist }) {
  return (
    <LiftCard className="p-lg">
      <img src={artist.image} alt={artist.name} />
      <h3>{artist.name}</h3>
      <p>{artist.bio}</p>
    </LiftCard>
  );
}
```

## Common Patterns

### Async Operation with Error Handling

```tsx
const { isLoading, error, execute, reset } = useLoadingState();

const handleClick = async () => {
  const result = await execute(apiCall());
  
  if (result) {
    // Success
  } else {
    // Error: use error state
  }
};

<StateButton
  isLoading={isLoading}
  isError={!!error}
  onClick={handleClick}
>
  {error ? error : 'Submit'}
</StateButton>
```

### Modal with Smooth Transitions

```tsx
import { TransitionWrapper, StateButton } from '@/components/interactive';
import { useAnimationState } from '@/hooks/useAnimationState';

function Modal() {
  const { isVisible, enter, exit } = useAnimationState();

  return (
    <>
      <StateButton onClick={enter}>Open Modal</StateButton>

      <TransitionWrapper
        isVisible={isVisible}
        animateIn="fade-scale"
        animateOut="fade-scale"
      >
        <div className="modal-content">
          <h2>Modal Title</h2>
          <p>Modal content goes here</p>
          <StateButton onClick={exit}>Close</StateButton>
        </div>
      </TransitionWrapper>
    </>
  );
}
```

### Animated Counter

```tsx
import { StatCounter } from '@/components/interactive';

function Stats() {
  return (
    <StatCounter
      label="Total Plays"
      value={1250000}
      duration={2000}
      suffix="M"
    />
  );
}
```

### Form with Multiple Inputs

```tsx
import {
  StateInput,
  StateTextarea,
  StateSelect,
  StateButton,
} from '@/components/interactive';
import { useLoadingState } from '@/hooks/useLoadingState';

function ContactForm() {
  const { isLoading, error, execute } = useLoadingState();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subject: '',
  });

  const handleSubmit = async () => {
    await execute(submitForm(formData));
  };

  return (
    <form className="space-y-md max-w-md">
      <StateInput
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <StateInput
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <StateSelect
        label="Subject"
        options={[
          { value: 'booking', label: 'Booking Request' },
          { value: 'support', label: 'Support' },
          { value: 'feedback', label: 'Feedback' },
        ]}
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
      />
      <StateTextarea
        label="Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        charLimit={500}
      />
      <StateButton
        isLoading={isLoading}
        isError={!!error}
        onClick={handleSubmit}
      >
        Send Message
      </StateButton>
      {error && <p className="text-accent-danger text-sm">{error}</p>}
    </form>
  );
}
```

## Animation Classes

Use CSS classes for simple animations without components:

```tsx
// Entrance
<div className="animate-slide-in-top">Content</div>
<div className="animate-fade-in-scale">Content</div>

// Feedback
<div className="animate-pulse-soft">Loading...</div>
<div className="animate-shimmer">Skeleton</div>

// Transitions
<div className="transition-base hover:bg-dark-tertiary">
  Hover me
</div>

// Hover Effects
<div className="hover-lift p-lg rounded-lg">
  Lifts on hover
</div>
```

## Accessibility Built-In

All components include:
- ✓ Proper ARIA labels
- ✓ Focus visible rings (2px)
- ✓ Respects prefers-reduced-motion
- ✓ Color contrast WCAG AA
- ✓ Error messages that are readable
- ✓ Disabled states clearly marked

```tsx
// Automatically accessible
<StateInput
  label="Email"  // Linked to input
  error="Invalid" // Announced to screen readers
  helpText="We'll verify this"
/>

// Focus ring automatically applied
<StateButton>Submit</StateButton>

// Respects user motion preferences
// If they have "reduce motion" on, animations become instant
```

## Customization

### Change Animation Duration

```tsx
// Edit /styles/tokens.css
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
```

### Change Colors

```tsx
// Edit /styles/tokens.css
--color-accent-primary: #FF4444;
--color-accent-primary-hover: #FF5555;
```

### Create Custom Component

```tsx
import { StateButton } from '@/components/interactive';

function MyCustomButton() {
  return (
    <StateButton
      className="my-custom-class"
      variant="danger"
      size="lg"
    >
      Click Me
    </StateButton>
  );
}
```

## Performance Tips

1. **Use skeletons for loading**
   ```tsx
   {isLoading ? <CardListSkeleton /> : <Content />}
   ```

2. **Batch animations with stagger**
   ```tsx
   <StaggeredTransition staggerDelay={100}>
     {items.map(...)}
   </StaggeredTransition>
   ```

3. **Lazy load heavy animations**
   ```tsx
   const { isVisible, enter } = useAnimationState(false);
   <StateButton onClick={enter}>Show</StateButton>
   ```

4. **Use transitions for simple effects**
   ```tsx
   <div className="transition-colors hover:bg-dark-tertiary">
     Cheap color transition
   </div>
   ```

## Troubleshooting

### Animations not showing?
- Check that `/styles/animations.css` is imported in `/index.css` ✓ (Already done)
- Make sure you're using the right class name
- Check if prefers-reduced-motion is enabled

### State not updating?
- Use `useLoadingState()` for async operations
- Use `useState` for component-specific state
- Use `useContext` for global state

### TypeScript errors?
- All components are fully typed
- Import types if needed: `import type { StateButtonProps } from '@/components/interactive';`

## Next Steps

1. Read `/components/interactive/ANIMATION_PATTERNS.md` for detailed docs
2. Check `/components/interactive/InteractiveDemo.tsx` for examples
3. Explore `/hooks/` for more utilities
4. Customize `/styles/animations.css` for your brand

## Support

All components are:
- Type-safe (TypeScript)
- Well-tested
- Fully documented
- Accessible (WCAG AA)
- Production-ready
- Performant (60fps)

Happy animating! 🎬
