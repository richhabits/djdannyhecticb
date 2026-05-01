# Component Stories

Interactive component documentation for djdannyhecticb streaming platform using Storybook.

## Quick Start

### Installation

```bash
# Install Storybook and dependencies
npm install --save-dev @storybook/react @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-a11y @storybook/addon-viewport

# Initialize Storybook (if not already done)
npx storybook@latest init
```

### Running Stories

```bash
# Start Storybook development server
npm run storybook

# Build static Storybook for deployment
npm run build-storybook

# Run visual tests
npm run test:stories

# Run accessibility tests
npm run test:a11y
```

## Directory Structure

```
client/src/stories/
├── README.md                          # This file
├── components/
│   ├── Buttons.stories.tsx            # Button variants and states
│   ├── Alerts.stories.tsx             # Alert components
│   ├── Cards.stories.tsx              # Card components
│   ├── Forms.stories.tsx              # Form inputs and controls
│   ├── Modals.stories.tsx             # Modal dialogs
│   ├── Navigation.stories.tsx         # Navigation components
│   ├── StatusIndicators.stories.tsx   # Status, badges, tags
│   └── ...                            # Additional component stories
├── foundations/
│   ├── Colors.stories.mdx             # Color palette documentation
│   ├── Typography.stories.mdx         # Typography scale
│   ├── Spacing.stories.mdx            # Spacing system
│   └── Animations.stories.mdx         # Animation library
└── patterns/
    ├── Forms.stories.tsx              # Form patterns and best practices
    ├── Notifications.stories.tsx      # Notification patterns
    └── Layouts.stories.tsx            # Layout patterns
```

## Story Structure

### Basic Story Template

```typescript
import { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  // Tags for organization
  tags: ['autodocs'],
  // Default args for all stories
  args: {
    children: 'Click me',
    variant: 'primary',
  },
  // Argument controls in the UI
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
      description: 'Button style variant',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable the button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {};

// Variant stories
export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

// State stories
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

// Interactive story
export const Interactive: Story = {
  render: (args) => (
    <div className="space-y-md">
      <Button {...args}>Default State</Button>
      <Button {...args} disabled>Disabled State</Button>
      <Button {...args} isLoading>Loading State</Button>
    </div>
  ),
};
```

## Component Stories by Category

### Buttons

**File:** `components/Buttons.stories.tsx`

Stories for all button variants:
- Primary button (call-to-action)
- Secondary button (alternative action)
- Tertiary/text button (minimal action)
- Danger button (destructive action)
- Icon button (button with icon)
- Loading state (with spinner)
- Disabled state
- Different sizes (small, medium, large)

### Alerts & Notifications

**File:** `components/Alerts.stories.tsx`

Stories for alert components:
- Success alert (positive feedback)
- Error alert (error state)
- Warning alert (caution)
- Info alert (information)
- Raid alert (stream event)
- Subscriber alert (stream event)
- Auto-dismiss behavior
- With actions (dismiss, confirm)

### Cards

**File:** `components/Cards.stories.tsx`

Stories for card components:
- Basic card (content container)
- Card with image
- Card with header/footer
- Interactive card (hover state)
- Nested cards
- Loading skeleton
- Empty state

### Forms

**File:** `components/Forms.stories.tsx`

Stories for form elements:
- Text input (default, focused, error, success)
- Text area (default, with placeholder)
- Select dropdown
- Checkbox (default, checked, indeterminate)
- Radio button group
- Form validation (showing errors)
- Form sections (grouping related fields)
- Complete form example

### Modals

**File:** `components/Modals.stories.tsx`

Stories for modal dialogs:
- Alert modal (confirmation dialog)
- Confirmation modal (with actions)
- Form modal (input collection)
- Nested modals (modal in modal)
- Focus trap demo
- Keyboard navigation (Escape to close)
- Full-screen modal (mobile)

### Navigation

**File:** `components/Navigation.stories.tsx`

Stories for navigation components:
- Header/top navigation
- Tab navigation
- Menu (dropdown, mobile)
- Breadcrumbs
- Footer navigation
- Skip link (accessibility)

### Status Indicators

**File:** `components/StatusIndicators.stories.tsx`

Stories for status components:
- Badge (label, tier, status)
- Tag (removable, colored)
- Spinner (loading indicator)
- Progress bar
- Avatar (user image)
- Status dot (online/offline/busy)

### Streaming-Specific Components

**File:** `components/StreamingComponents.stories.tsx`

Stories for platform-specific components:
- Raid alert (incoming raid notification)
- Subscriber alert (new subscriber)
- Chat box (message display)
- Audio player (stream player)
- Quality selector (video quality)
- Interaction panel (donations, shoutouts)
- Product panel (merchandise display)
- Schedule display (upcoming events)

## Foundation Stories

### Colors

**File:** `foundations/Colors.stories.mdx`

Interactive color palette showcasing:
- Primary colors (background, surface, border)
- Text colors (primary, secondary, tertiary)
- Accent colors (red, green, yellow, orange)
- Tier colors (gold, silver, bronze, platinum)
- Contrast checker
- Accessibility notes

### Typography

**File:** `foundations/Typography.stories.mdx`

Typography system documentation:
- Heading hierarchy (H1-H3)
- Body text sizes
- Caption and micro text
- Font weights
- Line heights
- Font families
- Text variations (bold, italic, monospace)

### Spacing

**File:** `foundations/Spacing.stories.mdx`

Spacing system demonstration:
- Spacing scale (xs to 4xl)
- Padding examples
- Margin examples
- Gap in flexbox/grid
- Safe area spacing (mobile)

### Animations

**File:** `foundations/Animations.stories.mdx`

Animation library showcase:
- Entrance animations (fade-in, slide-in)
- Exit animations (fade-out, slide-out)
- Continuous animations (spin, pulse, bounce)
- Easing functions
- Duration demos
- Reduced motion support

## Pattern Stories

### Form Patterns

**File:** `patterns/Forms.stories.tsx`

Complete form patterns:
- Contact form (email, message)
- Login form (email, password)
- Booking form (date, time, details)
- Donation form (amount, message)
- Form validation patterns
- Error handling and display
- Success feedback
- Accessibility in forms

### Notification Patterns

**File:** `patterns/Notifications.stories.tsx`

Notification implementation patterns:
- Toast notifications (temporary alerts)
- Inline alerts (form validation)
- Live region updates (screen reader)
- Stacked notifications
- Notification queuing
- Auto-dismiss with manual control
- Undo actions

### Layout Patterns

**File:** `patterns/Layouts.stories.tsx`

Layout composition patterns:
- Two-column layout (sidebar + content)
- Three-column layout
- Header + content + footer
- Mobile responsive layout
- Grid-based layouts
- Centered container
- Safe areas (notch/status bar)

## Writing Stories

### Basic Guidelines

1. **One component, multiple stories:**
   ```typescript
   // Each story shows a different state or variant
   export const Default: Story = {};
   export const Disabled: Story = { args: { disabled: true } };
   export const Loading: Story = { args: { isLoading: true } };
   ```

2. **Use descriptive names:**
   ```typescript
   export const PrimaryButtonDefault: Story = {};
   export const PrimaryButtonHover: Story = {};
   export const DangerButtonPressed: Story = {};
   ```

3. **Document with descriptions:**
   ```typescript
   const meta: Meta<typeof Button> = {
     title: 'Components/Button',
     component: Button,
     parameters: {
       docs: {
         description: {
           component: 'Primary call-to-action button. Use for main user actions.',
         },
       },
     },
   };
   ```

4. **Use args for interactivity:**
   ```typescript
   argTypes: {
     variant: {
       control: 'select',
       options: ['primary', 'secondary'],
       description: 'Button appearance variant',
     },
   };
   ```

5. **Test all states:**
   ```typescript
   export const AllStates: Story = {
     render: () => (
       <div className="space-y-md">
         <Button>Default</Button>
         <Button disabled>Disabled</Button>
         <Button isLoading>Loading</Button>
       </div>
     ),
   };
   ```

### Accessibility in Stories

- Include `@storybook/addon-a11y` for automatic checks
- Test with keyboard navigation
- Verify ARIA labels
- Check color contrast
- Test with reduced motion

Example:
```typescript
export const Accessible: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};
```

## Testing Stories

### Visual Regression Testing

```bash
# Run visual tests (requires Percy or similar)
npm run test:stories:visual
```

### Accessibility Testing

```bash
# Run axe accessibility checks
npm run test:a11y
```

### Interaction Testing

```typescript
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

export const Clickable: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /click me/i });
    
    await userEvent.click(button);
    
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  },
};
```

## Configuration

### .storybook/main.ts

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.ts?(x)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    '@storybook/addon-viewport',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: true,
  },
};

export default config;
```

### .storybook/preview.ts

```typescript
import type { Preview } from '@storybook/react';
import '../src/index.css'; // Global styles

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '812px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
      },
    },
  },
};

export default preview;
```

## Package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test:stories": "npm run build-storybook",
    "test:a11y": "test-storybook",
    "test:stories:visual": "percy storybook"
  }
}
```

## Resources

- **Storybook Docs:** https://storybook.js.org/docs/react/get-started
- **MDX Format:** https://storybook.js.org/docs/react/api/mdx
- **Addon Essentials:** https://storybook.js.org/docs/react/essentials/introduction
- **Accessibility Addon:** https://storybook.js.org/docs/react/writing-tests/accessibility-testing
- **Interaction Testing:** https://storybook.js.org/docs/react/writing-tests/interaction-testing
- **Design System:** See `/client/src/styles/DESIGN_SYSTEM.md`

## Best Practices

1. **Keep stories simple** - Each story shows one thing
2. **Use real data** - Don't use placeholder names or text
3. **Document variations** - Show all important states
4. **Test accessibility** - Use a11y addon, verify keyboard nav
5. **Organize logically** - Group related stories
6. **Update stories** - When component changes, update stories
7. **Cross-browser test** - Test in Chrome, Firefox, Safari
8. **Mobile preview** - Always test mobile viewport
9. **Performance** - Keep stories lightweight
10. **Version components** - Document breaking changes

## Contributing Stories

When adding a new component:

1. Create a new story file in `client/src/stories/components/`
2. Follow the story template structure
3. Include all variants and states
4. Add accessibility annotations
5. Document in this README
6. Run `npm run storybook` to verify
7. Commit the story file

Example:
```bash
# Create new component story
touch client/src/stories/components/MyComponent.stories.tsx

# Add story code following the template
# Run Storybook to preview
npm run storybook

# Visit http://localhost:6006 to view your story
```

## Troubleshooting

### Stories not appearing

```bash
# Clear cache and rebuild
rm -rf node_modules/.cache
npm run storybook
```

### Styles not loading

Ensure `index.css` is imported in `.storybook/preview.ts` and Tailwind is configured correctly.

### Add-on not working

```bash
# Reinstall Storybook
npm install --save-dev @storybook/react @storybook/addon-essentials
npx storybook@latest repro
```

## Success Metrics

A well-documented component library should:
- [ ] Have stories for 90%+ of components
- [ ] Show all component states (default, hover, active, disabled, loading, error)
- [ ] Include accessibility annotations
- [ ] Pass a11y checks
- [ ] Be keyboard navigable
- [ ] Work on mobile viewports
- [ ] Have clear documentation
- [ ] Show real-world usage examples
- [ ] Be easy to contribute to
- [ ] Support visual regression testing
