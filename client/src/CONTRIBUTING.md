# Design & Accessibility Contributing Guide

Guidelines for contributing design-consistent, accessible components and features to djdannyhecticb.

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Component Development](#component-development)
3. [Responsive Design](#responsive-design)
4. [Accessibility Requirements](#accessibility-requirements)
5. [Animation & Transitions](#animation--transitions)
6. [Documentation](#documentation)
7. [Testing](#testing)
8. [Code Review](#code-review)
9. [Checklist](#checklist)

## Design Tokens

### Use Only Design Tokens

Never hardcode colors, spacing, or font sizes. All visual properties must use design tokens defined in `tailwind.config.ts`.

**Reference:** `/client/src/styles/DESIGN_SYSTEM.md`

### Color Tokens

```tsx
// ✅ CORRECT - Use Tailwind color classes
<div className="bg-dark-bg text-text-primary border-dark-border">
  Content
</div>

// ✅ CORRECT - Tier colors
<span className="text-tier-gold font-bold">Premium</span>

// ✅ CORRECT - Accent colors
<button className="bg-accent-red hover:bg-accent-red-hover">
  Action
</button>

// ❌ WRONG - Hardcoded colors
<div style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}>
  Content
</div>

// ❌ WRONG - Non-design colors
<div className="bg-blue-500 text-yellow-200">
  Content
</div>
```

### Spacing Tokens

Use the spacing scale (xs, sm, md, lg, xl, 2xl, 3xl, 4xl):

```tsx
// ✅ CORRECT
<div className="p-md m-lg space-y-sm">
  <div className="px-md py-sm">Item 1</div>
  <div className="px-md py-sm">Item 2</div>
</div>

// ❌ WRONG - Hardcoded values
<div style={{ padding: '20px', marginBottom: '15px' }}>
  Item
</div>
```

### Typography Tokens

Use defined text sizes and weights:

```tsx
// ✅ CORRECT - Use semantic sizes
<h1 className="text-h1 font-bold">Page Title</h1>
<h2 className="text-h2 font-bold">Section Header</h2>
<h3 className="text-h3 font-semibold">Subsection</h3>
<p className="text-body">Body text</p>
<span className="text-caption text-text-secondary">Metadata</span>

// ❌ WRONG - Arbitrary font sizes
<h1 style={{ fontSize: '32px', fontWeight: '800' }}>
  Page Title
</h1>
```

### Border Radius Tokens

Use the radius scale (sm, md, lg, xl, full):

```tsx
// ✅ CORRECT
<div className="rounded-md">Card</div>
<input className="rounded-md border-2 border-dark-border" />
<button className="rounded-md">Button</button>

// ❌ WRONG
<div style={{ borderRadius: '10px' }}>Card</div>
```

### Shadow Tokens

Use the shadow scale (sm, md, lg, xl, 2xl, elevated):

```tsx
// ✅ CORRECT
<div className="shadow-md hover:shadow-lg">
  Card
</div>

// ❌ WRONG
<div style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
  Card
</div>
```

## Component Development

### Component Structure

Create components with proper structure and naming:

```tsx
// client/src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  /** Component description */
  variant?: 'primary' | 'secondary';
  /** Whether component is disabled */
  disabled?: boolean;
  /** Callback when clicked */
  onClick?: () => void;
  /** Component children */
  children: React.ReactNode;
}

/**
 * MyComponent - Brief description of what it does
 * 
 * @component
 * @example
 * <MyComponent variant="primary">Click me</MyComponent>
 */
export const MyComponent: React.FC<MyComponentProps> = ({
  variant = 'primary',
  disabled = false,
  onClick,
  children,
}) => {
  return (
    <button
      className={`
        px-md py-sm rounded-md font-medium
        transition-colors duration-base
        ${
          variant === 'primary'
            ? 'bg-accent-red hover:bg-accent-red-hover'
            : 'bg-dark-border hover:bg-dark-border'
        }
        ${disabled ? 'opacity-disabled cursor-not-allowed' : 'cursor-pointer'}
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-red
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

MyComponent.displayName = 'MyComponent';
```

### Component Best Practices

1. **Named Exports:** Use named exports, not default
2. **Props Interface:** Define clear prop types with JSDoc
3. **Display Name:** Add `displayName` for debugging
4. **Prop Defaults:** Use sensible defaults for optional props
5. **Composition:** Build components from smaller pieces
6. **Avoid Inline Styles:** Use Tailwind classes only
7. **Flexible Props:** Support common prop patterns (className, etc.)

## Responsive Design

### Mobile-First Approach

Always start with mobile styles, then add larger screens:

```tsx
// ✅ CORRECT - Mobile first
<div className="
  text-h3           /* Mobile: 16px */
  tablet:text-h2    /* Tablet: 20px */
  desktop:text-h1   /* Desktop: 28px */
">
  Responsive heading
</div>

// ❌ WRONG - Desktop first
<div className="
  text-h1
  tablet:text-h2
  mobile:text-h3
">
  Bad approach
</div>
```

### Breakpoint Usage

| Class | Width | Use Case |
|-------|-------|----------|
| (default) | 375px | Mobile |
| tablet: | 768px | Tablets, large phones |
| desktop: | 1024px | Desktops |
| wide: | 1440px | Large displays |

```tsx
// Complete responsive example
<div className="
  grid grid-cols-1
  tablet:grid-cols-2
  desktop:grid-cols-3
  gap-sm tablet:gap-md
  p-sm tablet:p-md desktop:p-lg
">
  {/* Items automatically stack on mobile, 2 cols on tablet, 3 on desktop */}
</div>
```

### Safe Areas (Mobile Notches)

Consider safe areas on mobile devices:

```tsx
// ✅ Account for notch on mobile
<header className="fixed top-0 left-0 right-0 z-sticky pt-safe-top px-safe-left px-safe-right">
  {/* Content won't be hidden under notch */}
</header>
```

### Touch Target Sizes

Ensure minimum tap target sizes:

```tsx
// ✅ CORRECT - 44x44px minimum
<button className="min-h-11 min-w-11 px-md py-sm">
  Touch-friendly button
</button>

// ❌ WRONG - Too small
<button className="px-xs py-xs">
  Tiny button
</button>
```

## Accessibility Requirements

### All Components Must Support

1. **Keyboard Navigation**
2. **Screen Reader Announcements**
3. **Focus Indicators**
4. **Color Contrast (4.5:1 minimum)**
5. **Semantic HTML**

### Checklist for Every Component

```
Keyboard
[ ] Tab navigates to element
[ ] All interactions work with keyboard
[ ] Focus is visible
[ ] Focus order is logical
[ ] No keyboard traps
[ ] Escape closes modals/menus

Screen Reader
[ ] Element has proper role/label
[ ] Inputs have associated labels
[ ] Buttons have text or aria-label
[ ] Status changes announced (aria-live)
[ ] Errors linked with aria-describedby
[ ] Images have alt text

Visual
[ ] 4.5:1 contrast ratio on all text
[ ] Focus ring clearly visible
[ ] No color-only indicators
[ ] Icons have labels
[ ] Touch targets 44x44px minimum

Code
[ ] Semantic HTML (<button>, <a>, <label>)
[ ] Proper ARIA roles and attributes
[ ] No tabindex="0" on non-interactive elements
[ ] No onclick on non-interactive elements
[ ] displayName set for debugging
```

### Common ARIA Patterns

```tsx
// Button with aria-label (icon only)
<button aria-label="Close menu">✕</button>

// Required form field
<input required aria-required="true" />

// Form field with error
<input
  id="email"
  aria-describedby="email-error"
/>
<span id="email-error" className="text-accent-danger">
  Error message
</span>

// Status message (announced to screen readers)
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Button toggle state
<button aria-pressed={isOpen} onClick={toggle}>
  Menu
</button>

// Modal dialog
<div role="dialog" aria-labelledby="modal-title">
  <h2 id="modal-title">Confirm</h2>
  {/* Content */}
</div>

// Skip link (first element on page)
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

## Animation & Transitions

### Use Defined Animation Durations

```tsx
// ✅ CORRECT - Use design tokens
<div className="
  transition-all
  duration-base      /* 200ms */
  ease-out
  hover:shadow-lg
">
  Animated content
</div>

// ✅ CORRECT - Standard animation
<div className="animate-fade-in">
  Content appears
</div>

// ❌ WRONG - Arbitrary durations
<div style={{ transition: 'all 250ms ease-in-out' }}>
  Content
</div>
```

### Durations

| Token | Value | Use |
|-------|-------|-----|
| fast | 150ms | Quick feedback |
| base | 200ms | Standard transitions |
| slow | 300ms | Emphasis animations |
| slower | 400ms | Complex animations |
| slowest | 500ms | Narrative animations |

### Respect Reduced Motion

All animations must respect user preference:

```tsx
// ✅ CORRECT - Respects reduced motion
<div className="motion-reduce:animate-none animate-fade-in">
  Content
</div>

// ✅ CORRECT - Manual implementation
<div className="
  animate-fade-in
  motion-safe:animate-fade-in
  motion-reduce:animate-none
">
  Content
</div>
```

## Documentation

### Component Documentation

Document every component with:

1. **JSDoc Comments**
2. **Props Interface with Types**
3. **Storybook Stories**
4. **Usage Examples**
5. **Accessibility Notes**

### JSDoc Template

```tsx
/**
 * MyComponent - Does something specific
 * 
 * A longer description of what this component does,
 * when to use it, and any important details.
 * 
 * @component
 * @example
 * <MyComponent variant="primary">Click me</MyComponent>
 * 
 * @param {MyComponentProps} props - Component props
 * @returns {React.ReactElement} Rendered component
 */
export const MyComponent: React.FC<MyComponentProps> = (props) => {
  // Implementation
};
```

### Storybook Stories

Create a story file for every component:

```tsx
// client/src/stories/components/MyComponent.stories.tsx
import { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from '@/components/MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const AllStates: Story = {
  render: () => (
    <div className="space-y-md">
      <MyComponent>Default</MyComponent>
      <MyComponent disabled>Disabled</MyComponent>
    </div>
  ),
};
```

## Testing

### Required Tests

Before submitting a component, test:

1. **Visual Tests**
   - Default state
   - All variants
   - All prop combinations
   - Dark mode appearance
   - On mobile, tablet, desktop

2. **Keyboard Tests**
   - Tab navigates to element
   - All interactions work with keyboard
   - Enter/Space triggers action
   - Escape closes modals
   - Focus is visible

3. **Accessibility Tests**
   - Use axe DevTools
   - Use Lighthouse
   - Test with NVDA (Windows)
   - Test with VoiceOver (Mac)
   - Verify 4.5:1 contrast

4. **Responsive Tests**
   - 375px (mobile)
   - 768px (tablet)
   - 1024px (desktop)
   - 1440px (wide)

### Testing Commands

```bash
# Run Storybook
npm run storybook

# Build and test Storybook
npm run build-storybook
npm run test:stories

# Run accessibility tests (if configured)
npm run test:a11y

# Visual regression (if Percy configured)
npm run test:visual
```

## Code Review

### Review Checklist

When reviewing a component PR, verify:

### Design System Compliance
- [ ] Uses only design tokens (no hardcoded values)
- [ ] Color choices have 4.5:1 contrast
- [ ] Spacing follows the scale
- [ ] Typography is semantic
- [ ] Border radius uses tokens
- [ ] Shadows use tokens

### Responsive Design
- [ ] Mobile-first approach
- [ ] Tested on all breakpoints
- [ ] Fluid typography where appropriate
- [ ] Touch targets 44x44px minimum

### Accessibility
- [ ] Keyboard navigable
- [ ] Focus indicator visible
- [ ] Proper semantic HTML
- [ ] ARIA labels where needed
- [ ] Form inputs labeled
- [ ] Images have alt text
- [ ] Respects reduced motion
- [ ] Passes axe checks

### Code Quality
- [ ] Named exports (not default)
- [ ] Props properly typed
- [ ] displayName set
- [ ] No inline styles
- [ ] No hardcoded colors/spacing
- [ ] JSDoc comments
- [ ] Storybook story included

### Documentation
- [ ] Story file created
- [ ] Props documented
- [ ] Usage examples provided
- [ ] Accessibility notes included
- [ ] README updated if needed

## Checklist

Use this checklist before submitting code:

```
Design Tokens
[ ] No hardcoded colors
[ ] No hardcoded spacing
[ ] No hardcoded font sizes
[ ] Uses Tailwind classes

Responsive
[ ] Mobile first approach
[ ] Tested on 375px, 768px, 1024px, 1440px
[ ] Touch targets 44x44px minimum
[ ] Fluid text sizing

Accessibility
[ ] Keyboard navigable (Tab, Enter, Escape)
[ ] Focus indicator visible
[ ] Semantic HTML tags
[ ] ARIA labels on icon buttons
[ ] Form inputs have labels
[ ] Images have alt text
[ ] 4.5:1 contrast ratio
[ ] Respects prefers-reduced-motion
[ ] Passes axe DevTools check

Animation
[ ] Uses design token durations
[ ] Uses design token easing
[ ] Respects prefers-reduced-motion
[ ] Smooth and professional

Code
[ ] Named export
[ ] Props interface with types
[ ] displayName set
[ ] JSDoc comment
[ ] No inline styles
[ ] No utility class typos

Documentation
[ ] Storybook story created
[ ] Multiple stories for states
[ ] Story in correct directory
[ ] Props documented in Storybook
[ ] Usage examples provided
[ ] Accessibility notes in story

Testing
[ ] Visual regression test run
[ ] Keyboard navigation tested
[ ] Screen reader tested
[ ] All breakpoints tested
[ ] All states tested

Ready for Review
[ ] All checkboxes marked
[ ] PR description is clear
[ ] No console errors/warnings
[ ] No TypeScript errors
```

## Common Mistakes to Avoid

### 1. Hardcoding Colors

```tsx
// ❌ WRONG
<div style={{ color: '#FF4444' }}>Text</div>

// ✅ CORRECT
<div className="text-accent-red">Text</div>
```

### 2. Arbitrary Spacing

```tsx
// ❌ WRONG
<div style={{ padding: '20px', margin: '10px' }}>Content</div>

// ✅ CORRECT
<div className="p-md m-sm">Content</div>
```

### 3. No Focus Ring

```tsx
// ❌ WRONG
<button className="bg-accent-red">Button</button>

// ✅ CORRECT
<button className="bg-accent-red focus-visible:outline-2 focus-visible:outline-accent-red">
  Button
</button>
```

### 4. Form Input Without Label

```tsx
// ❌ WRONG
<input type="email" placeholder="Email" />

// ✅ CORRECT
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### 5. Icon Button Without Label

```tsx
// ❌ WRONG
<button>✕</button>

// ✅ CORRECT
<button aria-label="Close">✕</button>
```

### 6. Desktop-First Responsive

```tsx
// ❌ WRONG
<div className="grid grid-cols-3 mobile:grid-cols-1">
  {/* Layout */}
</div>

// ✅ CORRECT
<div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
  {/* Layout */}
</div>
```

### 7. Animation Ignores Reduced Motion

```tsx
// ❌ WRONG
<div className="animate-fade-in">Content</div>

// ✅ CORRECT
<div className="motion-reduce:animate-none animate-fade-in">
  Content
</div>
```

## Getting Help

- **Design System:** `/client/src/styles/DESIGN_SYSTEM.md`
- **Accessibility Guide:** `/client/src/ACCESSIBILITY.md`
- **Component Stories:** `/client/src/stories/README.md`
- **Tailwind Docs:** https://tailwindcss.com/docs
- **ARIA Practices:** https://www.w3.org/WAI/ARIA/apg/
- **Accessibility Audit:** Use axe DevTools in Chrome

## Questions?

If you have questions about the design system or accessibility requirements:

1. Check the documentation first
2. Look at existing component examples
3. Test with axe DevTools
4. Ask in PR review
5. Reach out to design team

Thank you for contributing to an accessible, beautiful, professional streaming platform!
