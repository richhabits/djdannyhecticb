# Design Tokens System

## Overview

This directory contains the centralized design tokens and styling system for the djdannyhecticb streaming platform. The token system ensures consistency across the entire application and makes maintenance and updates significantly easier.

## Files

### `tokens.css`
Defines all CSS custom properties (variables) used throughout the application.

**Categories:**
- **Colors**: Primary palette, accents, status colors, tier colors
- **Spacing**: Unified 4px-based scale (xs, sm, md, lg, xl, 2xl, 3xl, 4xl)
- **Typography**: Font sizes, weights, line heights
- **Borders**: Border radius values
- **Shadows**: Elevation system
- **Transitions**: Durations and easing functions
- **Z-index**: Layering system
- **Layout**: Breakpoints, max widths, sidebar dimensions

### `globals.css`
Base styles applied globally using token variables. Includes:
- HTML/body defaults
- Heading styles
- Form element styles
- Link styles
- Scrollbar customization
- Selection colors
- Focus states for accessibility

### `animations.css`
Reusable animation keyframes and utility classes:
- Slide animations (in/out from all directions)
- Fade animations
- Scale animations
- Pulse, bounce, shimmer, spin effects
- Glitch, marquee, heartbeat, wiggle effects
- Animation utility classes with delay and duration modifiers

## Usage Guide

### Using CSS Variables

Reference tokens directly in your CSS:

```css
.my-component {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  transition: var(--transition-all);
}
```

### Using Tailwind Classes

The `tailwind.config.ts` extends Tailwind with all token values, so you can use Tailwind classes directly:

```tsx
export function MyComponent() {
  return (
    <div className="bg-dark-bg text-text-primary p-md rounded-md shadow-lg hover:shadow-xl transition-all">
      <h2 className="text-h2 text-accent-red hover:text-accent-red-hover">
        Heading
      </h2>
      <p className="text-body text-text-secondary">
        Body text with secondary color
      </p>
    </div>
  );
}
```

### Using Animations

Apply animation utility classes:

```tsx
<div className="animate-fade-in">Fade in on mount</div>
<div className="animate-slide-in-right">Slide in from right</div>
<div className="animate-pulse-soft">Pulsing effect</div>
<div className="animate-shimmer">Loading skeleton</div>
```

With delays for staggered effects:

```tsx
<div className="animate-fade-in animate-delay-100">Item 1</div>
<div className="animate-fade-in animate-delay-200">Item 2</div>
<div className="animate-fade-in animate-delay-300">Item 3</div>
```

## Color System

### Primary Palette
- `--color-bg-primary: #0A0A0A` - Main background
- `--color-bg-secondary: #1F1F1F` - Secondary background (surfaces)
- `--color-bg-tertiary: #2A2A2A` - Tertiary background (elevated surfaces)

### Text Colors
- `--color-text-primary: #FFFFFF` - Primary text
- `--color-text-secondary: #999999` - Secondary text
- `--color-text-tertiary: #666666` - Tertiary/muted text

### Accent Colors
- `--color-accent-primary: #FF4444` - Red (primary action)
- `--color-accent-success: #22C55E` - Green (success)
- `--color-accent-warning: #EAB308` - Yellow (warnings)
- `--color-accent-danger: #EF4444` - Red (destructive)
- `--color-accent-orange: #F97316` - Orange (legacy)

### Tier Colors
For membership/subscription tiers:
- Gold: `#D4AF37`
- Silver: `#C0C0C0`
- Bronze: `#CD7F32`
- Platinum: `#9D4EDD`

## Spacing Scale

All spacing uses a 4px base unit:

| Token | Value | Use Case |
|-------|-------|----------|
| `--space-xs` | 4px | Minimal spacing, inline elements |
| `--space-sm` | 8px | Small gaps, padding |
| `--space-md` | 16px | Default padding, margins |
| `--space-lg` | 24px | Section spacing |
| `--space-xl` | 32px | Large gaps, sections |
| `--space-2xl` | 48px | Major sections |
| `--space-3xl` | 64px | Full-screen spacing |
| `--space-4xl` | 80px | Full-screen major spacing |

## Typography Scale

| Token | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| `--font-size-micro` | 10px | 1.4 | Labels, badges |
| `--font-size-caption` | 12px | 1.5 | Captions, help text |
| `--font-size-body` | 14px | 1.5 | Body text, default |
| `--font-size-h3` | 16px | 1.4 | Subheadings |
| `--font-size-h2` | 20px | 1.3 | Headings |
| `--font-size-h1` | 28px | 1.2 | Page titles |
| `--font-size-display` | 36px | 1.1 | Hero sections |

### Font Families
- `--font-family-inter` - Body text, UI elements
- `--font-family-outfit` - Headings (uppercase, high impact)
- `--font-family-system` - System fallback

### Font Weights
- `400` - Normal
- `500` - Medium
- `600` - Semibold
- `700` - Bold
- `800` - Extrabold
- `900` - Black

## Border Radius

| Token | Value | Use Case |
|-------|-------|----------|
| `--radius-none` | 0px | Brutal, sharp edges |
| `--radius-sm` | 4px | Small buttons, inputs |
| `--radius-md` | 8px | Cards, modals |
| `--radius-lg` | 12px | Large elements |
| `--radius-xl` | 16px | Extra large elements |
| `--radius-full` | 9999px | Pills, badges |

## Shadow System

Elevation-based shadows for depth:

| Token | Use Case |
|-------|----------|
| `--shadow-sm` | Subtle elevation |
| `--shadow-md` | Standard elevation |
| `--shadow-lg` | Higher elevation |
| `--shadow-xl` | High elevation |
| `--shadow-2xl` | Very high elevation |
| `--shadow-elevated` | Maximum elevation (floating elements) |

## Transitions

Pre-configured transitions with duration and easing:

```css
/* Available easing functions */
--easing-ease-out
--easing-ease-in
--easing-ease-in-out
--easing-linear

/* Duration options */
--duration-fast: 150ms
--duration-base: 200ms (default)
--duration-slow: 300ms
--duration-slower: 400ms
--duration-slowest: 500ms

/* Pre-composed transitions */
--transition-color
--transition-bg
--transition-border
--transition-shadow
--transition-transform
--transition-all
```

Usage:
```css
.button {
  transition: var(--transition-all);
}

.button:hover {
  background-color: var(--color-accent-primary-hover);
  box-shadow: var(--shadow-lg);
}
```

## Z-Index Scale

Semantic layering system:

| Token | Value | Use Case |
|-------|-------|----------|
| `--z-base` | 0 | Default layer |
| `--z-dropdown` | 100 | Dropdown menus |
| `--z-sticky` | 200 | Sticky elements |
| `--z-fixed` | 250 | Fixed positioning |
| `--z-modal-overlay` | 290 | Modal backdrop |
| `--z-modal` | 300 | Modal content |
| `--z-tooltip` | 400 | Tooltips |
| `--z-alert` | 500 | Alerts, notifications |
| `--z-max` | 9999 | Emergency override |

## Responsive Breakpoints

Tailwind breakpoints (mobile-first):

```css
--breakpoint-mobile: 375px     /* sm: */
--breakpoint-tablet: 768px     /* md: */
--breakpoint-desktop: 1024px   /* lg: */
--breakpoint-wide: 1440px      /* xl: */
--breakpoint-ultrawide: 1920px /* 2xl: */
```

Usage in Tailwind:
```tsx
<div className="text-body mobile:text-caption tablet:text-h3">
  Responsive text
</div>
```

## Best Practices

### 1. Always Use Tokens
Never hardcode colors or spacing. Always reference tokens.

```tsx
/* ✅ Good */
<div className="bg-dark-bg text-text-primary p-md">Content</div>

/* ❌ Avoid */
<div style={{backgroundColor: '#0A0A0A', color: '#FFFFFF', padding: '16px'}}>
  Content
</div>
```

### 2. Use Tailwind for Styling
Prefer Tailwind classes over inline CSS when possible.

```tsx
/* ✅ Good */
<button className="bg-accent-red hover:bg-accent-red-hover px-lg py-md rounded-md">
  Action
</button>

/* ❌ Avoid */
<button style={{background: 'var(--color-accent-primary)'}}>Action</button>
```

### 3. Consistent Spacing
Use the spacing scale for all margins and padding.

```tsx
/* ✅ Good */
<div className="p-md mb-lg">Content</div>

/* ❌ Avoid */
<div className="p-4 mb-32">Content</div>
```

### 4. Semantic Color Usage
Use colors semantically for their intended purpose.

```tsx
/* ✅ Good */
<button className="bg-accent-danger">Delete</button>
<div className="text-accent-success">Success message</div>

/* ❌ Avoid */
<button className="bg-accent-success">Delete</button>
<div className="text-accent-danger">Success message</div>
```

### 5. Animation Performance
Use GPU-accelerated properties (transform, opacity) for better performance.

```tsx
/* ✅ Good */
<div className="animate-fade-in">Content</div>

/* ❌ Avoid */
<div style={{animation: 'changeWidth 200ms'}}>Content</div>
```

## Migration Guide

To migrate existing components:

1. Replace hardcoded colors with Tailwind color classes:
   ```tsx
   // Before
   style={{ backgroundColor: '#0A0A0A' }}
   // After
   className="bg-dark-bg"
   ```

2. Replace hardcoded spacing with Tailwind spacing:
   ```tsx
   // Before
   style={{ padding: '16px', margin: '24px' }}
   // After
   className="p-md m-lg"
   ```

3. Replace inline styles with token-based classes:
   ```tsx
   // Before
   style={{ fontSize: '14px', fontWeight: 700 }}
   // After
   className="text-body font-bold"
   ```

4. Update animations to use utility classes:
   ```tsx
   // Before
   style={{ animation: 'fadeIn 200ms' }}
   // After
   className="animate-fade-in"
   ```

## Adding New Tokens

When adding new tokens:

1. Add to `tokens.css` in the appropriate category
2. Update `tailwind.config.ts` to extend Tailwind with the new token
3. Update this README with documentation
4. Use the new token consistently across the codebase

Example:

```css
/* tokens.css */
:root {
  --new-token: 'value';
}
```

```ts
// tailwind.config.ts
extend: {
  newCategory: {
    newToken: 'var(--new-token)',
  }
}
```

## Testing

To verify tokens are working:

```bash
npm run build
```

Check that:
- No build errors occur
- CSS variables are properly resolved
- Tailwind classes are properly compiled
- Browser DevTools show correct computed styles

## Support

For questions or to propose new tokens:
1. Check existing tokens first
2. Document the use case
3. Update tokens.css, tailwind.config.ts, and this README
4. Test in multiple components
