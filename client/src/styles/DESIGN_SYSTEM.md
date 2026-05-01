# djdannyhecticb Design System

## Overview

Professional streaming platform design system built on dark mode, modern animations, and accessibility-first principles. This document defines all design tokens, component patterns, and usage guidelines for consistent UI development.

## Color Tokens

### Primary Colors
- **Background:** #0A0A0A (near-black, main app background)
- **Surface:** #1F1F1F (cards, panels, secondary surfaces)
- **Border:** #333333 (subtle dividers, component edges)

### Text Colors
- **Primary:** #FFFFFF (main content, maximum contrast)
- **Secondary:** #999999 (labels, metadata, helper text)
- **Tertiary:** #666666 (disabled states, faint text)

### Accent Colors
- **Primary:** #FF4444 (call-to-action, active states, primary buttons)
- **Primary Hover:** #FF5555 (button hover state)
- **Primary Dark:** #CC3333 (pressed/active state)
- **Success:** #22C55E (positive feedback, confirmations)
- **Success Hover:** #34D399 (success state hover)
- **Warning:** #EAB308 (caution, alerts, important notices)
- **Warning Hover:** #FACC15 (warning hover state)
- **Danger:** #EF4444 (errors, critical actions)
- **Danger Hover:** #F87171 (danger hover state)
- **Orange:** #F97316 (notifications, secondary accent)
- **Orange Hover:** #FB923C (orange hover state)

### Tier Colors
- **Gold:** #D4AF37 (premium tier, premium badges)
- **Gold Dark:** #AA8C2C (gold pressed state)
- **Silver:** #C0C0C0 (mid tier)
- **Silver Dark:** #999999 (silver pressed state)
- **Bronze:** #CD7F32 (basic tier)
- **Bronze Dark:** #A85F28 (bronze pressed state)
- **Platinum:** #9D4EDD (VIP tier, exclusive features)
- **Platinum Dark:** #7D3FCC (platinum pressed state)

## Typography Scale

| Level | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| Display | 36px | 700 | 1.1 | Hero titles, landing page |
| H1 | 28px | 700 | 1.2 | Page titles, main headings |
| H2 | 20px | 700 | 1.3 | Section headers |
| H3 | 16px | 600 | 1.4 | Component titles, subsections |
| Body | 14px | 400 | 1.5 | Main content, paragraphs |
| Caption | 12px | 400 | 1.5 | Labels, timestamps, metadata |
| Micro | 10px | 400 | 1.4 | Badges, small labels, tags |

**Font Families:**
- **Default:** System stack (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif)
- **Inter:** For specific feature implementations ("Inter", sans-serif)
- **Outfit:** For special typography treatments ("Outfit", sans-serif)

## Spacing Scale

| Token | Value | Use Case |
|-------|-------|----------|
| xs | 4px | Icon spacing, tight gaps |
| sm | 8px | Component internal spacing, small gaps |
| md | 16px | Standard padding, margins |
| lg | 24px | Section spacing, large padding |
| xl | 32px | Large gaps, major sections |
| 2xl | 48px | Page sections, major spacing |
| 3xl | 64px | Large container gaps |
| 4xl | 80px | Maximum spacing |

## Border Radius

| Token | Value | Use Case |
|-------|-------|----------|
| none | 0px | Sharp edges |
| sm | 4px | Small elements, subtle rounding |
| md | 8px | Cards, buttons, inputs (default) |
| lg | 12px | Large containers, elevated elements |
| xl | 16px | Larger containers, modals |
| full | 9999px | Pills, circles, completely rounded |

## Shadows

| Level | Value | Use Case |
|-------|-------|----------|
| sm | 0 1px 2px rgba(0,0,0,0.3) | Subtle depth, small elements |
| md | 0 4px 12px rgba(0,0,0,0.4) | Cards, standard elevation |
| lg | 0 8px 24px rgba(0,0,0,0.5) | Elevated elements, dropdowns |
| xl | 0 12px 32px rgba(0,0,0,0.6) | Modals, important overlays |
| 2xl | 0 16px 40px rgba(0,0,0,0.7) | Maximum elevation |
| elevated | 0 20px 48px rgba(0,0,0,0.8) | Critical modals, overlays |

## Animation Durations

| Duration | Value | Use Case |
|----------|-------|----------|
| Fast | 150ms | Quick feedback, micro-interactions |
| Base | 200ms | Standard transitions, slide animations |
| Slow | 300ms | Emphasis animations, important transitions |
| Slower | 400ms | Complex animations, multiple steps |
| Slowest | 500ms | Narrative animations, storytelling |

## Easing Functions

| Function | Curve | Use Case |
|----------|-------|----------|
| ease-out | cubic-bezier(0.25, 0.46, 0.45, 0.94) | Enter animations, appearing elements |
| ease-in | cubic-bezier(0.55, 0.055, 0.675, 0.19) | Exit animations, disappearing elements |
| ease-in-out | cubic-bezier(0.645, 0.045, 0.355, 1) | Continuous transitions, size changes |
| linear | linear | Spinning, rotating, constant-speed animation |

## Responsive Breakpoints

| Device | Width | Use Case |
|--------|-------|----------|
| Mobile | 375px | Phones (iPhone SE minimum) |
| Tablet | 768px | Tablets, large phones |
| Desktop | 1024px | Desktops, laptops |
| Wide | 1440px | Large displays |
| Ultrawide | 1920px | 4K displays, cinema mode |

**Mobile-First Approach:** Style for mobile first, then add `@media (min-width: ...)` for larger screens.

## Component Guidelines

### Buttons

**Dimensions:**
- Height: 44px (mobile), 40px (desktop minimum)
- Padding: px-md py-sm (16px horizontal, 8px vertical)
- Border Radius: md (8px)

**States:**
- **Default:** bg-accent-red, text-text-primary
- **Hover:** bg-accent-red-hover, shadow-md
- **Active:** bg-accent-red-dark (pressed state)
- **Disabled:** opacity-disabled, cursor-not-allowed
- **Loading:** spinner animation, disabled interaction

**Variants:**
- Primary (filled, red background)
- Secondary (outline, gray border)
- Tertiary (text-only)
- Danger (red background, destructive action)

### Cards

**Properties:**
- **Padding:** p-md (16px)
- **Border:** 1px solid dark-border
- **Border Radius:** md (8px)
- **Shadow:** md (normal), lg (on hover)
- **Background:** dark-surface

**States:**
- **Default:** dark-surface, dark-border
- **Hover:** shadow-lg, slight scale-105
- **Focus:** 2px outline accent-red

### Inputs

**Dimensions:**
- **Height:** 44px
- **Padding:** px-md py-sm (16px horizontal, 8px vertical)
- **Border:** 2px solid dark-border
- **Border Radius:** md (8px)
- **Background:** dark-bg

**States:**
- **Default:** dark-border, text-text-primary
- **Hover:** dark-border, slightly elevated
- **Focus:** 2px solid accent-red, outline-none
- **Disabled:** bg-dark-bg, opacity-disabled
- **Error:** 2px solid accent-danger, error-message below
- **Success:** 2px solid accent-success

**Placeholder:**
- Color: text-text-tertiary
- Font Style: normal (not italicized)

### Alerts & Notifications

**Dimensions:**
- **Width:** 320px (desktop), 90vw (mobile)
- **Padding:** p-lg (24px)
- **Border Radius:** lg (12px)
- **Shadow:** lg
- **Max Width:** 320px

**Position:**
- **Desktop:** top-right corner with 24px offset
- **Mobile:** top-center with safe area spacing

**States:**
- **Info:** bg-dark-surface, border-accent-blue
- **Success:** bg-dark-surface, border-accent-success
- **Warning:** bg-dark-surface, border-accent-warning
- **Error:** bg-dark-surface, border-accent-danger

**Duration:** Auto-dismiss after 4 seconds (can be extended for critical alerts)

### Modals & Overlays

**Overlay:**
- **Background:** rgba(0, 0, 0, 0.7) (semi-transparent)
- **Z-Index:** modal-overlay (290)
- **Animation:** fade-in 200ms

**Modal:**
- **Background:** dark-surface
- **Padding:** p-lg (24px)
- **Border Radius:** lg (12px)
- **Shadow:** elevated
- **Z-Index:** modal (300)
- **Animation:** scale-in 200ms

**Behavior:**
- Trap focus inside modal
- Close on Escape key
- Close on overlay click (optional)
- Prevent background scroll

## Z-Index Scale

| Level | Value | Use Case |
|-------|-------|----------|
| base | 0 | Normal content |
| dropdown | 100 | Dropdowns, floating menus |
| sticky | 200 | Sticky headers, fixed elements |
| fixed | 250 | Fixed positioned elements |
| modal-overlay | 290 | Modal background overlay |
| modal | 300 | Modal dialogs, overlays |
| tooltip | 400 | Tooltips, help text |
| alert | 500 | Alerts, notifications |
| max | 9999 | Emergency overflow |

## Accessibility Standards

### Contrast Requirements
- **Minimum Ratio:** 4.5:1 (WCAG AA)
- **Enhanced Ratio:** 7:1 (WCAG AAA)
- **Examples:**
  - White (#FFFFFF) on #0A0A0A: 21:1 ✅ Excellent
  - Gray (#999999) on #0A0A0A: 7:1 ✅ AAA
  - Gray (#666666) on #0A0A0A: 4.48:1 ✅ AA

### Focus Management
- **Visible Focus Ring:** 2px outline with 2px offset
- **Color:** accent-red (#FF4444)
- **All Interactive Elements:** Must have focus indicator
- **Order:** Must follow logical tab order

### Touch Targets
- **Minimum Size:** 44x44px (mobile)
- **Minimum Size:** 40x40px (desktop)
- **Spacing:** 8px minimum between targets

### Motion
- **Default:** All animations enabled
- **Prefers Reduced Motion:** 
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

### Labels & ARIA
- **All Inputs:** Associated with `<label htmlFor="id">`
- **All Buttons:** Has meaningful text or aria-label
- **Icon Buttons:** `aria-label` describing action
- **Live Regions:** `aria-live="polite"` for dynamic updates
- **Status Messages:** `role="status"` for non-intrusive updates
- **Alerts:** `role="alert"` for important announcements

### Keyboard Navigation
- **Tab:** Move to next interactive element
- **Shift+Tab:** Move to previous interactive element
- **Enter:** Activate button/link
- **Space:** Toggle checkbox/button
- **Escape:** Close modal/menu
- **Arrow Keys:** Navigate lists/menus/tabs

## Animation Library

### Entrance Animations
- **fade-in:** Opacity 0 to 1 (200ms ease-out)
- **slide-in-top:** Translate Y -20px to 0 (200ms ease-out)
- **slide-in-bottom:** Translate Y 20px to 0 (200ms ease-out)
- **slide-in-left:** Translate X -20px to 0 (200ms ease-out)
- **slide-in-right:** Translate X 20px to 0 (200ms ease-out)
- **scale-in:** Scale 0.95 to 1 (200ms ease-out)

### Exit Animations
- **fade-out:** Opacity 1 to 0 (200ms ease-in)
- **slide-out-left:** Translate X 0 to -20px (200ms ease-in)
- **slide-out-right:** Translate X 0 to 20px (200ms ease-in)
- **scale-out:** Scale 1 to 0.95 (200ms ease-in)

### Continuous Animations
- **pulse-soft:** Opacity pulse (300ms infinite)
- **bounce-soft:** Y translate bounce (200ms infinite)
- **spin:** 360° rotation (500ms linear infinite)
- **spin-fast:** 360° rotation (300ms linear infinite)
- **shimmer:** Loading effect (2s infinite)
- **heartbeat:** Scale pulse (300ms infinite)
- **wiggle:** Subtle rotation (300ms infinite)
- **marquee:** Horizontal scroll (20s linear infinite)
- **glitch:** Pixel shift effect (200ms infinite)

## Component Library

See `COMPONENT_STORIES.md` for detailed interactive component documentation and Storybook setup.

## Usage Examples

### Color Usage

```tsx
// Use Tailwind color classes
<div className="bg-dark-bg text-text-primary">
  <button className="bg-accent-red hover:bg-accent-red-hover transition-colors duration-base">
    Click me
  </button>
</div>

// Using tier colors
<span className="text-tier-gold font-bold">Premium Member</span>

// Using state colors
<div className="bg-dark-surface border-2 border-accent-success">
  Success state
</div>
```

### Typography

```tsx
// Semantic heading hierarchy
<h1 className="text-display font-bold">Page Title</h1>
<h2 className="text-h2 font-bold">Section Title</h2>
<h3 className="text-h3 font-semibold">Subsection</h3>

// Body text with secondary
<p className="text-body">Main content goes here.</p>
<span className="text-caption text-text-secondary">Metadata or helper text</span>

// Micro text (badges, tags)
<span className="text-micro text-text-tertiary">BADGE</span>
```

### Spacing & Layout

```tsx
// Consistent padding
<div className="p-md">Padded content (16px)</div>
<div className="px-md py-lg">Horizontal 16px, vertical 24px</div>

// Gap between items
<div className="space-y-md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// Flexbox gaps
<div className="flex gap-sm">
  <button>Button 1</button>
  <button>Button 2</button>
</div>
```

### Animations

```tsx
// Entrance animation
<div className="animate-fade-in">Content appears smoothly</div>
<div className="animate-slide-in-top">Slides in from top</div>

// Transition on hover
<button className="transition-colors duration-base hover:bg-accent-red-hover">
  Hover me
</button>

// Loading state
<div className="animate-spin">Loading...</div>

// Continuous pulse
<div className="animate-pulse-soft">Pulsing content</div>
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="text-h3 tablet:text-h2 desktop:text-h1">
  Responsive heading
</div>

<div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-md">
  {/* Items stack on mobile, 2 cols on tablet, 3 on desktop */}
</div>

<button className="h-auto py-sm px-md mobile:h-11 desktop:h-10">
  Adaptive height button
</button>
```

### Focus & Accessibility

```tsx
// Proper button with focus state
<button className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-red">
  Accessible button
</button>

// Form input with label
<label htmlFor="email-input" className="block text-body font-medium">
  Email Address
</label>
<input
  id="email-input"
  type="email"
  className="w-full px-md py-sm border-2 border-dark-border rounded-md focus-visible:border-accent-red focus-visible:outline-none"
  placeholder="your@email.com"
/>

// Error state
<input className="border-2 border-accent-danger" aria-describedby="error-msg" />
<span id="error-msg" className="text-caption text-accent-danger mt-xs">
  This field is required
</span>
```

## Component States Reference

All interactive components should support these states:

| State | Visual | Interaction | Cursor |
|-------|--------|-------------|--------|
| **Default** | Normal appearance | N/A | auto |
| **Hover** | Shadow/color change | Mouse over | pointer |
| **Active** | Darker/pressed appearance | Mouse down or selected | pointer |
| **Focus** | 2px outline | Tab/keyboard | auto |
| **Disabled** | Grayed out, opacity-50 | No interaction | not-allowed |
| **Loading** | Spinner/skeleton | No interaction | wait |
| **Error** | Red border, error message | N/A | auto |
| **Success** | Green indicator | N/A | auto |

## Design Tokens in Code

All design tokens are defined in `tailwind.config.ts` and can be used directly in Tailwind classes:

```tsx
// Colors
className="bg-dark-bg text-text-primary border-dark-border"
className="bg-accent-red hover:bg-accent-red-hover"
className="text-tier-gold"

// Spacing
className="p-md m-lg gap-sm"

// Typography
className="text-h1 font-bold"
className="text-body"
className="text-caption text-text-secondary"

// Border radius
className="rounded-md rounded-lg rounded-full"

// Shadows
className="shadow-md hover:shadow-lg"

// Animations
className="animate-fade-in animate-spin"

// Transitions
className="transition-colors duration-base"
className="transition-all duration-slow ease-out"

// Z-index
className="z-modal z-alert"

// Breakpoints
className="mobile:text-body tablet:text-h3 desktop:text-h2"
```

## Best Practices

1. **Always use design tokens** - Never hardcode colors, spacing, or font sizes
2. **Mobile-first approach** - Style mobile, then add tablet/desktop rules
3. **Accessibility first** - Test keyboard navigation, screen reader, contrast
4. **Consistent animations** - Use defined durations and easing
5. **Document custom styles** - If you can't use tokens, document why
6. **Test all states** - Default, hover, active, disabled, focus, loading
7. **Responsive typography** - Use breakpoints for readable font sizes
8. **Focus management** - Ensure visible focus rings on all interactive elements
9. **Touch targets** - Minimum 44x44px on mobile
10. **Performance** - Use hardware-accelerated properties (transform, opacity)
