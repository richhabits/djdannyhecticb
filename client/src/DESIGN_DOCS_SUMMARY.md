# Design System Documentation Summary

Complete design system documentation for djdannyhecticb streaming platform.

## Quick Links

### Core Documentation

1. **Design System** (`/client/src/styles/DESIGN_SYSTEM.md`)
   - Color tokens (primary, text, accent, tier)
   - Typography scale (H1-H3, body, caption, micro)
   - Spacing system (xs to 4xl)
   - Border radius, shadows, animations
   - Component guidelines
   - Responsive breakpoints
   - Z-index scale
   - Usage examples

2. **Accessibility Guide** (`/client/src/ACCESSIBILITY.md`)
   - WCAG 2.1 Level AA compliance
   - Contrast requirements
   - Keyboard navigation
   - Focus management
   - ARIA labels and roles
   - Screen reader testing
   - Color usage guidelines
   - Motion & animations
   - Component-specific guidelines
   - Accessibility checklist

3. **Component Stories** (`/client/src/stories/README.md`)
   - Storybook setup and installation
   - Story structure and templates
   - Component categories
   - Foundation stories
   - Pattern documentation
   - Testing with stories
   - Configuration files

4. **Contributing Guide** (`/client/src/CONTRIBUTING.md`)
   - Design token usage
   - Component development
   - Responsive design patterns
   - Accessibility requirements
   - Animation guidelines
   - Documentation standards
   - Testing checklist
   - Code review guidelines

## Documentation Files

```
/client/src/
├── styles/
│   └── DESIGN_SYSTEM.md          # Complete design system reference
├── ACCESSIBILITY.md               # Accessibility compliance guide
├── CONTRIBUTING.md                # Contribution standards
├── DESIGN_DOCS_SUMMARY.md         # This file
└── stories/
    ├── README.md                  # Storybook setup & structure
    ├── Buttons.stories.tsx        # Button component examples
    └── Foundations.stories.tsx    # Design token showcase
```

## Design Tokens Summary

### Colors

**Primary Colors:**
- `dark-bg` (#0A0A0A) - Main background
- `dark-surface` (#1F1F1F) - Card/panel background
- `dark-border` (#333333) - Dividers and borders

**Text Colors:**
- `text-primary` (#FFFFFF) - Main content
- `text-secondary` (#999999) - Labels, metadata
- `text-tertiary` (#666666) - Disabled, faint

**Accent Colors:**
- `accent-red` (#FF4444) - Primary action
- `accent-success` (#22C55E) - Positive feedback
- `accent-warning` (#EAB308) - Caution
- `accent-danger` (#EF4444) - Errors
- `accent-orange` (#F97316) - Notifications

**Tier Colors:**
- `tier-gold` (#D4AF37) - Premium
- `tier-silver` (#C0C0C0) - Mid tier
- `tier-bronze` (#CD7F32) - Basic
- `tier-platinum` (#9D4EDD) - VIP

### Typography

| Level | Size | Weight | Use |
|-------|------|--------|-----|
| Display | 36px | 700 | Hero titles |
| H1 | 28px | 700 | Page titles |
| H2 | 20px | 700 | Section headers |
| H3 | 16px | 600 | Component titles |
| Body | 14px | 400 | Main content |
| Caption | 12px | 400 | Labels |
| Micro | 10px | 400 | Badges |

### Spacing

`xs` (4px) → `sm` (8px) → `md` (16px) → `lg` (24px) → `xl` (32px) → `2xl` (48px) → `3xl` (64px) → `4xl` (80px)

### Animations

- **Durations:** fast (150ms), base (200ms), slow (300ms)
- **Easing:** ease-out (enter), ease-in (exit), ease-in-out (continuous)
- **Types:** fade-in, slide-in, scale-in, spin, pulse, bounce

### Breakpoints

| Device | Width | Class |
|--------|-------|-------|
| Mobile | 375px | (default) |
| Tablet | 768px | `tablet:` |
| Desktop | 1024px | `desktop:` |
| Wide | 1440px | `wide:` |
| Ultrawide | 1920px | `ultrawide:` |

## Accessibility Compliance

### WCAG 2.1 Level AA

- ✅ 4.5:1 minimum contrast ratio
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Visible focus indicators
- ✅ ARIA labels and roles
- ✅ Screen reader support
- ✅ Respects prefers-reduced-motion
- ✅ Touch targets 44x44px minimum

### Key Features

1. **Dark Mode Accessibility**
   - High contrast colors
   - White text on near-black background (21:1)
   - All text meets WCAG AA standards

2. **Keyboard Navigation**
   - All interactive elements keyboard accessible
   - Logical tab order
   - Visible focus ring (red outline)
   - No keyboard traps

3. **Screen Reader Support**
   - Semantic HTML
   - ARIA labels on icon buttons
   - Form inputs properly labeled
   - Status messages announced

4. **Motor & Cognitive**
   - Touch targets 44x44px minimum
   - Clear, predictable interactions
   - Error messages explain what went wrong
   - Consistent terminology

## Component Stories

### Buttons
- Primary, secondary, danger, tertiary variants
- Sizes: small, medium, large
- States: default, hover, active, disabled, loading
- Icon buttons with accessibility

### Foundations
- **Colors:** Full palette with contrast info
- **Typography:** All sizes and families
- **Spacing:** Scale visualization
- **Border Radius:** All radius values
- **Shadows:** Elevation system
- **Animations:** Entrance, exit, continuous
- **Breakpoints:** Responsive design
- **Z-Index:** Layering system

## Best Practices

### Use Design Tokens
```tsx
// ✅ CORRECT
<div className="bg-dark-bg text-text-primary p-md">Content</div>

// ❌ WRONG
<div style={{ backgroundColor: '#0A0A0A', color: '#FFF' }}>Content</div>
```

### Mobile-First Responsive
```tsx
// ✅ CORRECT
<div className="text-h3 tablet:text-h2 desktop:text-h1">Heading</div>

// ❌ WRONG
<div className="text-h1 tablet:text-h2 mobile:text-h3">Heading</div>
```

### Accessibility Always
```tsx
// ✅ CORRECT
<label htmlFor="email">Email</label>
<input id="email" type="email" />

<button aria-label="Close">✕</button>

// ❌ WRONG
<input placeholder="Email" />
<button>✕</button>
```

### Design Token Naming in Code
```tsx
// Color classes use Tailwind format
className="bg-dark-bg text-text-primary border-dark-border"
className="hover:bg-accent-red-hover"
className="text-tier-gold"

// Spacing classes
className="p-md m-lg space-y-sm"
className="px-md py-lg"

// Typography classes
className="text-h1 font-bold"
className="text-body"
className="text-caption text-text-secondary"

// Border and shadows
className="rounded-md shadow-lg"

// Responsive
className="mobile:p-sm tablet:p-md desktop:p-lg"
```

## Common Patterns

### Button
```tsx
<button className="
  px-md py-sm rounded-md font-medium
  bg-accent-red hover:bg-accent-red-hover
  focus-visible:outline-2 focus-visible:outline-accent-red
  disabled:opacity-disabled disabled:cursor-not-allowed
  transition-colors duration-base
">
  Click me
</button>
```

### Card
```tsx
<div className="
  bg-dark-surface border border-dark-border rounded-md
  p-md shadow-md hover:shadow-lg
  transition-shadow duration-base
">
  Card content
</div>
```

### Form Input
```tsx
<div className="space-y-sm">
  <label htmlFor="field" className="text-body font-medium">
    Field Label
  </label>
  <input
    id="field"
    type="text"
    className="
      w-full px-md py-sm
      border-2 border-dark-border rounded-md
      bg-dark-bg text-text-primary
      focus-visible:border-accent-red focus-visible:outline-none
      disabled:opacity-disabled
    "
  />
</div>
```

### Responsive Layout
```tsx
<div className="
  grid grid-cols-1
  tablet:grid-cols-2
  desktop:grid-cols-3
  gap-sm tablet:gap-md desktop:gap-lg
  p-sm tablet:p-md desktop:p-lg
">
  {items.map((item) => (
    <div key={item.id} className="bg-dark-surface rounded-md p-md">
      {item.name}
    </div>
  ))}
</div>
```

## Getting Started

### For Designers

1. Read `/client/src/styles/DESIGN_SYSTEM.md` for complete token reference
2. Use colors, spacing, and typography from defined scales
3. Check accessibility requirements in `/client/src/ACCESSIBILITY.md`
4. Review component patterns in stories

### For Developers

1. Install Storybook: `npm install --save-dev @storybook/react`
2. Run stories: `npm run storybook`
3. Reference `/client/src/styles/DESIGN_SYSTEM.md` for token names
4. Use `/client/src/CONTRIBUTING.md` for contribution checklist
5. Test accessibility with axe DevTools

### For Contributors

1. Read `/client/src/CONTRIBUTING.md` before making changes
2. Use only design tokens from `tailwind.config.ts`
3. Create Storybook story for new components
4. Test keyboard navigation and screen readers
5. Verify 4.5:1 contrast ratio
6. Run accessibility checks

## Storybook Setup

### Installation

```bash
npm install --save-dev @storybook/react @storybook/addon-essentials @storybook/addon-a11y

npx storybook@latest init
```

### Running Stories

```bash
npm run storybook        # Start dev server on port 6006
npm run build-storybook  # Build static site
npm run test:a11y        # Run accessibility tests
```

### Adding Stories

Create files in `/client/src/stories/`:

```tsx
import { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary' },
};
```

## Key Files Reference

| File | Purpose | Content |
|------|---------|---------|
| `tailwind.config.ts` | Tailwind configuration | All design tokens |
| `styles/DESIGN_SYSTEM.md` | Design reference | Complete token docs |
| `ACCESSIBILITY.md` | Compliance guide | WCAG 2.1 AA standards |
| `CONTRIBUTING.md` | Dev guidelines | How to build components |
| `stories/README.md` | Storybook guide | Setup and examples |
| `stories/Buttons.stories.tsx` | Component example | Button component story |
| `stories/Foundations.stories.tsx` | Foundations showcase | Design tokens showcase |

## Tools & Resources

### Testing

- **Accessibility:** axe DevTools (Chrome extension)
- **Contrast:** WebAIM Contrast Checker
- **Screen Reader:** NVDA (Windows), VoiceOver (Mac)
- **Lighthouse:** Chrome DevTools

### Documentation

- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Practices: https://www.w3.org/WAI/ARIA/apg/
- WebAIM: https://webaim.org/
- Tailwind: https://tailwindcss.com/docs

## Maintenance

### When Adding New Components

1. ✅ Use design tokens only
2. ✅ Create Storybook story
3. ✅ Test keyboard navigation
4. ✅ Test with screen reader
5. ✅ Verify 4.5:1 contrast
6. ✅ Document in stories
7. ✅ Add to CONTRIBUTING checklist

### When Updating Design Tokens

1. ✅ Update `tailwind.config.ts`
2. ✅ Update `DESIGN_SYSTEM.md`
3. ✅ Update all affected stories
4. ✅ Check contrast ratios
5. ✅ Test affected components
6. ✅ Update this summary

### Regular Audits

- Monthly: Accessibility audit with axe
- Quarterly: Manual keyboard/screen reader test
- Annually: Complete WCAG audit
- Continuous: New components checked before merge

## Support

### Questions?

1. Check relevant documentation file
2. Review existing component stories
3. Test with axe DevTools
4. Search WCAG 2.1 guidelines
5. Consult team on design decisions

### Reporting Issues

- Design system inconsistencies → Update relevant doc
- Accessibility violations → Note in PR, fix immediately
- Component style issues → Reference token in DESIGN_SYSTEM.md
- Story documentation gaps → Add story with examples

## Success Metrics

A well-maintained design system should:

- ✅ All components use design tokens
- ✅ 90%+ of components have Storybook stories
- ✅ All components pass accessibility audit (axe)
- ✅ WCAG 2.1 Level AA compliance maintained
- ✅ Keyboard navigation works on all interactive elements
- ✅ Focus indicators visible on all components
- ✅ 4.5:1 contrast on all text
- ✅ Responsive on all breakpoints
- ✅ Documentation is current
- ✅ Contributors follow guidelines

## Next Steps

1. **Install Storybook** (if not done)
   ```bash
   npm install --save-dev @storybook/react
   npx storybook@latest init
   ```

2. **Run Stories**
   ```bash
   npm run storybook
   ```

3. **Review Existing Stories**
   - Visit http://localhost:6006
   - Explore Buttons, Foundations sections

4. **Create New Stories**
   - Follow pattern in Buttons.stories.tsx
   - Add story file for each component
   - Include all states and variants

5. **Test Accessibility**
   - Install axe DevTools
   - Check each story
   - Verify keyboard navigation
   - Test with screen reader

---

Last Updated: 2026-05-01
