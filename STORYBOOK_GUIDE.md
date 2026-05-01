# Storybook Guide

## Overview

This project uses Storybook to document and showcase all UI components in isolation. Storybook provides an interactive environment for developing, testing, and documenting components with automatic accessibility checks and responsive viewport testing.

## Getting Started

### Running Storybook

To start the development server:

```bash
pnpm storybook
```

Storybook will open at [http://localhost:6006](http://localhost:6006)

### Building Storybook for Deployment

To create a static build:

```bash
pnpm storybook:build
```

This generates a static site in `.storybook/static/` that can be deployed anywhere.

### Running Tests

To run Storybook interaction tests:

```bash
pnpm storybook:test
```

## Component Stories

### Alert Components

**Location:** `client/src/components/alerts/`

- **RaidAlert** - Displays raid notifications with viewer counts
  - Small raids (50-100 viewers)
  - Medium raids (500 viewers)
  - Massive raids (5000+ viewers)
  - Edge cases: Single viewer, long usernames

- **SubscriberAlert** - Shows new subscriber notifications
  - Tier levels: Bronze, Silver, Gold, Platinum
  - Duration tracking: 1-24 months
  - Optional subscriber messages
  - Tier-specific styling and emojis

- **DonationAlert** - Displays donation/tip notifications
  - Small donations ($5)
  - Medium donations ($50)
  - Large donations ($500+)
  - Optional donor messages
  - Decimal amount support

- **FollowAlert** - New follower notifications
  - Simple username display
  - Special characters in usernames
  - Long usernames

- **AlertContainer** - Main alert queue manager
  - Single alert display
  - Multiple alerts (stacked)
  - Queue indicator (3+ alerts)
  - Mixed alert types

### Streaming Components

**Location:** `client/src/components/`

- **StreamHealthIndicator** - Real-time stream health monitoring
  - Healthy state (5+ Mbps, 60 FPS, 1080p)
  - Caution state (1-2 Mbps, 30 FPS, 720p)
  - Critical state (<1 Mbps, <30 FPS, 480p)
  - Custom bitrate/FPS combinations

- **QualitySelector** - Video quality switcher
  - Auto quality detection
  - HD options (1080p60, 1080p30, 720p60, 720p30)
  - SD options (480p30, 360p30)
  - Audio-only mode
  - Recommended quality badge

- **ProductPanel** - Streaming products display
  - Track listings
  - Merchandise with pricing
  - Social links
  - Mixed product types
  - Empty state handling

- **StreamEventLog** - Real-time activity feed
  - Follow events
  - Subscribe events
  - Donation events
  - Raid events with details
  - Time-relative formatting

- **StreamAnalytics** - Stream statistics dashboard
  - Peak viewers metric
  - Average viewers metric
  - Stream duration
  - Retention percentage
  - Geographic distribution (regions)
  - Switchable metric/region views

- **ViewerStats** - Compact and expanded viewer statistics
  - Normal display mode
  - Compact mode (inline)
  - Large numbers (K, M formatting)
  - Zero-state handling

### UI Components

**Location:** `client/src/components/ui/`

- **Button** - Core button with variants
  - Sizes: Small, Medium, Large, Icon
  - Variants: Default, Secondary, Destructive, Outline, Ghost, Link
  - States: Enabled, Disabled, Loading
  - Interactive examples

- **Input** - Text input field
  - Types: text, email, password, number, search, url, tel
  - States: Default, Disabled, Read-only
  - Validation: Error and success states
  - Label support

## Story Structure

Each story file follows this pattern:

```typescript
import { Meta, StoryObj } from '@storybook/react';
import { Component } from './Component';

const meta: Meta<typeof Component> = {
  title: 'Category/ComponentName',
  component: Component,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered', // or 'fullscreen'
    docs: {
      description: {
        component: 'Description of what the component does',
      },
    },
  },
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};

export const Variant: Story = {
  args: {
    // Variant-specific props
  },
};
```

## Features

### Automatic Documentation

- Component stories automatically generate documentation pages
- Props are extracted from TypeScript types
- Default values are displayed
- Component descriptions are shown

### Responsive Testing

- Mobile viewport: 375x667
- Tablet viewport: 768x1024
- Desktop viewport: 1440x900

Resize stories in the Storybook toolbar to test responsiveness.

### Accessibility Testing

- A11y addon automatically checks for accessibility issues
- Color contrast is verified
- ARIA labels are validated
- Keyboard navigation is tested

Enable the A11y tab in the Storybook sidebar to see audit results.

### Interactive Controls

- Component props can be modified in real-time
- Control panel shows available props
- Test different states without code changes
- Actions panel logs user interactions (clicks, changes, etc.)

## Adding New Stories

### Step 1: Create Story File

Create a `.stories.tsx` file next to your component:

```
ComponentName.tsx
ComponentName.stories.tsx
```

### Step 2: Write Stories

```typescript
import { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Category/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    prop1: 'value1',
  },
};
```

### Step 3: Document Variants

Create stories for each important variant:
- Different sizes
- Different states (disabled, loading, error)
- Different content (long text, empty, etc.)
- Edge cases

### Step 4: Add Descriptions

Include descriptions for complex stories:

```typescript
export const Variant: Story = {
  args: { /* ... */ },
  parameters: {
    docs: {
      description: {
        story: 'Explanation of what this variant demonstrates',
      },
    },
  },
};
```

## Best Practices

### 1. Name Stories Semantically

```typescript
// Good
export const HealthyStream: Story = { /* ... */ };
export const CriticalStream: Story = { /* ... */ };

// Avoid
export const Story1: Story = { /* ... */ };
export const Test: Story = { /* ... */ };
```

### 2. Cover Edge Cases

```typescript
export const LongUsername: Story = { /* ... */ };
export const Empty: Story = { /* ... */ };
export const WithError: Story = { /* ... */ };
```

### 3. Group Related Stories

Use consistent naming for related states:

```typescript
export const Small: Story = { /* ... */ };
export const Medium: Story = { /* ... */ };
export const Large: Story = { /* ... */ };
```

### 4. Use Args Composition

```typescript
const baseArgs = {
  viewerCount: 1000,
  duration: '1:30',
};

export const WithDonations: Story = {
  args: { ...baseArgs, donations: 250 },
};

export const NoDonations: Story = {
  args: { ...baseArgs, donations: 0 },
};
```

## Deployment

Storybook can be deployed to any static hosting:

1. **Build:** `pnpm storybook:build`
2. **Deploy:** Push `.storybook/static/` to your hosting provider

### Popular Options
- Vercel: Connect GitHub repo, configure build to `pnpm storybook:build`
- Netlify: Same configuration
- GitHub Pages: Use GitHub Actions with storybook workflow

## Troubleshooting

### Styles Not Loading

Ensure `index.css` is imported in `.storybook/preview.ts`:

```typescript
import '../client/src/index.css';
```

### Components Not Found

Check that path aliases are configured in `.storybook/main.ts`:

```typescript
config.resolve.alias = {
  '@': path.resolve(__dirname, '../client/src'),
};
```

### Stories Not Appearing

Verify the glob pattern in `.storybook/main.ts`:

```typescript
stories: ['../client/src/**/*.stories.@(js|jsx|ts|tsx)'],
```

## Performance

- Storybook lazy-loads stories for faster startup
- Use `--maxWorkers` flag to control build concurrency
- Consider splitting large story files (100+ stories)

## Integration with Development

### Before Committing Components

1. Create comprehensive stories
2. Run accessibility audit
3. Test responsive variants
4. Document usage examples

### Documentation Updates

Keep `.stories.tsx` files in sync with component changes:

- Update arg types when props change
- Add new stories for new variants
- Remove stories for deprecated props

## Resources

- [Storybook Official Docs](https://storybook.js.org/)
- [Storybook + Vite](https://storybook.js.org/docs/react/builders/vite)
- [Accessibility Testing](https://storybook.js.org/docs/react/writing-stories/testing)
- [Component Composition](https://storybook.js.org/docs/react/writing-stories/args)

## Quick Commands

```bash
# Start development server
pnpm storybook

# Build static site
pnpm storybook:build

# Run tests
pnpm storybook:test

# Format all code
pnpm format

# Type check
pnpm check
```

---

**Last Updated:** 2026-05-01

For issues or questions about Storybook setup, refer to the configuration files:
- `.storybook/main.ts` - Main configuration
- `.storybook/preview.ts` - Preview/preset configuration
