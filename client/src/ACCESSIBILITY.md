# Accessibility Guidelines

djdannyhecticb is built to **WCAG 2.1 Level AA** standards, ensuring the platform is usable by everyone, including people with disabilities.

## Accessibility Standards Overview

### WCAG 2.1 Compliance Level

- **Target Level:** AA (enhanced accessibility)
- **Key Principles:** POUR (Perceivable, Operable, Understandable, Robust)
- **Updates:** Regular audits and improvements

### Legal & Ethical Commitment

- Compliant with ADA (Americans with Disabilities Act)
- Supports disability rights and inclusion
- Regular accessibility audits
- Community feedback integration

## Contrast Requirements

### Minimum Ratios

All text must meet contrast requirements for readability:

| Text Type | Minimum Ratio | Level | Examples |
|-----------|---------------|-------|----------|
| Body text | 4.5:1 | AA | White (#FFF) on #0A0A0A = 21:1 ✅ |
| Large text (18pt+) | 3:1 | AA | Silver (#999) on #0A0A0A = 7:1 ✅ |
| UI components | 3:1 | AA | Gray (#666) on #0A0A0A = 4.48:1 ✅ |
| AAA Enhanced | 7:1 | AAA | All text in dark mode |

### Testing Contrast

Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

**Colors in djdannyhecticb:**
- White (#FFFFFF) on dark bg (#0A0A0A): 21:1 ✅ Excellent
- Gray (#999999) on dark bg: 7:1 ✅ AAA
- Gray (#666666) on dark bg: 4.48:1 ✅ AA
- All tier colors: 5:1+ on dark bg ✅ AAA

## Focus Management

### Focus Ring Requirements

All interactive elements **must** have a visible focus indicator:

```css
:focus-visible {
  outline: 2px solid #FF4444;  /* accent-red */
  outline-offset: 2px;
  border-radius: 2px;
}
```

### Focus Styles in Components

```tsx
// Button with focus
<button className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-red">
  Click me
</button>

// Input with focus
<input
  type="text"
  className="focus-visible:outline-none focus-visible:border-accent-red focus-visible:border-2"
/>

// Link with focus
<a href="#" className="focus-visible:underline focus-visible:outline-accent-red">
  Link text
</a>
```

### Tab Order

1. **Logical Flow:** Left-to-right, top-to-bottom (visual order)
2. **Skip Elements:** Use `tabindex="-1"` for non-interactive elements
3. **Focus Trap in Modals:** Tab cycles within modal only (not background)
4. **Skip Link:** First element on page should skip to main content

**Example Skip Link:**

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

<main id="main-content">
  {/* Main page content */}
</main>
```

### Focus Restoration

When modals/overlays close, restore focus to the triggering element:

```tsx
const [isOpen, setIsOpen] = useState(false);
const triggerRef = useRef<HTMLButtonElement>(null);

const closeModal = () => {
  setIsOpen(false);
  triggerRef.current?.focus();
};

return (
  <>
    <button ref={triggerRef} onClick={() => setIsOpen(true)}>
      Open Modal
    </button>
    {isOpen && (
      <Modal onClose={closeModal}>
        {/* Modal content */}
      </Modal>
    )}
  </>
);
```

## Keyboard Navigation

### Standard Keyboard Interactions

| Key | Action | Component |
|-----|--------|-----------|
| **Tab** | Move to next focusable element | All |
| **Shift+Tab** | Move to previous focusable element | All |
| **Enter** | Activate button or link | Buttons, Links |
| **Space** | Toggle checkbox, toggle button | Checkbox, Radio, Toggle |
| **Escape** | Close modal, menu, or overlay | Modals, Menus |
| **Arrow Keys** | Navigate options in list/menu/tabs | Select, Menu, Tabs |
| **Home** | Go to first option | Menu, Tab bar |
| **End** | Go to last option | Menu, Tab bar |

### Keyboard-Only Testing

Test all functionality using only keyboard:
1. Press Tab to navigate all interactive elements
2. Verify focus is always visible
3. Verify all actions can be triggered (no "hover-only" actions)
4. Test menu navigation with arrow keys
5. Test modal Escape key to close
6. Verify focus is restored when modal closes

## ARIA Labels & Semantics

### All Interactive Elements Need Labels

```tsx
// BAD ❌ - No label
<button>✕</button>

// GOOD ✅ - aria-label
<button aria-label="Close modal">✕</button>

// GOOD ✅ - Text label
<button>Close</button>
```

### Form Labels

```tsx
// BAD ❌ - Placeholder only (not accessible)
<input type="text" placeholder="Email" />

// GOOD ✅ - Associated label
<label htmlFor="email-input">Email Address</label>
<input id="email-input" type="email" />

// GOOD ✅ - aria-label alternative
<input type="email" aria-label="Email Address" />
```

### Button vs Div

```tsx
// BAD ❌ - Not keyboard accessible
<div onClick={handleClick}>Click me</div>

// GOOD ✅ - Native button
<button onClick={handleClick}>Click me</button>

// GOOD ✅ - If using div, add role + keyboard handling
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</div>
```

### ARIA Roles

| Role | Use Case | Example |
|------|----------|---------|
| `role="button"` | Keyboard-accessible clickable element | Custom button component |
| `role="status"` | Dynamic status messages (not intrusive) | "Item saved" message |
| `role="alert"` | Important announcements (interrupts) | Error message, validation |
| `role="region"` | Important content section | Chat area, donation feed |
| `role="complementary"` | Supporting content | Sidebar, "more info" section |
| `role="main"` | Main page content | Primary content area |
| `role="navigation"` | Navigation collection | Menu, breadcrumbs |
| `role="contentinfo"` | Footer/metadata | Footer section |
| `role="progressbar"` | Progress indicator | Upload progress |
| `role="slider"` | Numeric input with range | Quality selector |

### ARIA Attributes

```tsx
// Describe element purpose
<button aria-label="Volume control">🔊</button>

// Indicate current state
<button aria-pressed="false" onClick={toggle}>
  Follow
</button>

// Required field indicator
<input required aria-required="true" />

// Link to error message
<input aria-describedby="email-error" />
<span id="email-error" className="text-accent-danger">
  Enter valid email
</span>

// Hide decorative elements from screen readers
<span aria-hidden="true">→</span>

// Expanded/collapsed state
<button aria-expanded={isOpen}>Menu</button>

// Live region (auto-announce changes)
<div aria-live="polite" aria-atomic="true">
  {notification}
</div>
```

## Images & Media

### Alt Text Requirements

Every image must have descriptive alt text:

```tsx
// BAD ❌ - Vague or missing alt
<img src="event.jpg" alt="event" />
<img src="logo.jpg" alt="logo" />
<img src="stream.jpg" />

// GOOD ✅ - Descriptive alt text
<img
  src="event.jpg"
  alt="Live electronic music performance at Ministry of Sound, May 15, 2026"
/>

// GOOD ✅ - Decorative images (hidden from screen readers)
<img src="background.jpg" alt="" aria-hidden="true" />

// GOOD ✅ - Icon with context
<img src="spotify-icon.png" alt="Spotify" />
```

### Audio/Video Accessibility

```tsx
// Video with captions
<video controls>
  <source src="stream.mp4" type="video/mp4" />
  <track kind="captions" src="captions.vtt" />
</video>

// Audio transcript
<audio controls>
  <source src="podcast.mp3" type="audio/mpeg" />
</audio>
<p>Transcript: {transcriptText}</p>

// Description of audio stream
<p>
  Live DJ broadcast: Electronic music set by Danny Hectic
</p>
```

## Color & Visual Communication

### Never Use Color Alone

```tsx
// BAD ❌ - Only color indicates status
<div className="bg-red-500" /> {/* Is this error? Important? */}

// GOOD ✅ - Color + text
<div className="flex items-center gap-sm">
  <div className="w-4 h-4 rounded-full bg-accent-danger" />
  <span>Error: Something went wrong</span>
</div>

// GOOD ✅ - Color + icon
<div className="flex items-center gap-sm">
  <Icon icon="error" className="text-accent-danger" />
  <span>Error: Something went wrong</span>
</div>
```

### Form Error Display

```tsx
// Show both color and text
<div className="space-y-sm">
  <input
    className="border-2 border-accent-danger"
    aria-describedby="email-error"
  />
  <span id="email-error" className="text-caption text-accent-danger">
    ❌ Email is required
  </span>
</div>
```

## Motion & Animations

### Respect Reduced Motion

Users with vestibular disorders or motion sensitivity need animations disabled:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**In Tailwind:**

```tsx
<div className="motion-reduce:animate-none animate-fade-in">
  Content
</div>

<div className="motion-reduce:duration-0 duration-base transition-all">
  Animated content
</div>
```

### Flash/Flicker Warnings

- Never use animations faster than 3 per second
- Never use high-contrast flashing (can trigger seizures)
- Use gentle, predictable animations
- Provide pause/stop controls for auto-playing content

## Dyslexia & Reading Disorders

### Text Formatting for Readability

```tsx
// Use these fonts for better readability
<div className="font-system">Standard system font</div>

// Avoid:
// - Justified text (breaks word spacing)
// - All caps (harder to read)
// - Italics for long text (harder to scan)
// - Light gray on light background

// Good practices:
// - Line length 50-75 characters
// - Line height 1.5+
// - Adequate padding around text
// - High contrast colors
```

## Cognitive Disabilities

### Clear Communication

```tsx
// Simple, clear language
// ✅ "Save your changes" instead of "Persist mutations"
// ✅ "Delete account" instead of "Obliterate user profile"

// Consistent terminology
// ✅ Always call it "Donate" not sometimes "Support" or "Tip"

// Clear error messages
// ❌ "Error 422"
// ✅ "Please enter a valid email address"

// Predictable interactions
// - Links look like links (underlined, colored)
// - Buttons look like buttons (raised, clickable)
// - Forms follow standard patterns
```

## Screen Reader Testing

### Testing Tools

**Windows:**
- NVDA (free): https://www.nvaccess.org/
- JAWS (commercial): https://www.freedomscientific.com/

**macOS:**
- VoiceOver (built-in): Settings > Accessibility > VoiceOver
- Enable: Cmd+F5 (or Cmd+Option+F5)

**iOS:**
- VoiceOver (built-in): Settings > Accessibility > VoiceOver

**Android:**
- TalkBack (built-in): Settings > Accessibility > TalkBack

### Screen Reader Testing Checklist

```
Navigation & Structure
[ ] Page has a main landmark <main>
[ ] Heading hierarchy is logical (H1 → H2 → H3)
[ ] Navigation is announced as a navigation landmark
[ ] Footer is announced as contentinfo landmark

Form Labels
[ ] All inputs have associated labels
[ ] Required fields are marked with aria-required
[ ] Errors are linked with aria-describedby
[ ] Field groups are semantically grouped

Links & Buttons
[ ] All links have meaningful text (not "click here")
[ ] All buttons have text or aria-label
[ ] Link/button purpose is clear without context

Images & Media
[ ] All images have descriptive alt text
[ ] Decorative images have empty alt=""
[ ] Video has captions or transcript
[ ] Audio has transcript or description

Live Updates
[ ] Dynamic updates use aria-live
[ ] Status messages are announced
[ ] Loading states are communicated

Focus Management
[ ] Focus is visible on all interactive elements
[ ] Tab order is logical
[ ] Skip links work
[ ] Focus is restored when modals close
```

### Common Screen Reader Announcements

**Inputs:**
```
Screen reader announces:
"Email address, edit text, required"
```

**Buttons:**
```
Screen reader announces:
"Submit, button"
```

**Links:**
```
Screen reader announces:
"Learn more about streaming, link"
```

**Status:**
```
Screen reader announces:
"Stream is live, status"
```

## Accessibility Audit Checklist

Run through this checklist before shipping:

### Perceivable (Can users see/hear content?)
- [ ] All text has 4.5:1 contrast ratio minimum
- [ ] Images have descriptive alt text
- [ ] Audio has captions or transcript
- [ ] Colors aren't the only way to convey info
- [ ] Content doesn't flash > 3 times/second

### Operable (Can users interact with it?)
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicator is visible
- [ ] Tab order is logical
- [ ] Skip links are available
- [ ] No keyboard traps
- [ ] All buttons and links have proper labels
- [ ] Forms are properly labeled
- [ ] Animations respect reduced motion preference

### Understandable (Can users understand the content?)
- [ ] Language is clear and simple
- [ ] UI is predictable and consistent
- [ ] Error messages explain what went wrong
- [ ] Form validation is clear
- [ ] Abbreviations are explained
- [ ] No unexplained symbols

### Robust (Works with assistive technology?)
- [ ] HTML is valid and semantic
- [ ] ARIA attributes are used correctly
- [ ] Form controls are properly identified
- [ ] Roles and properties are correct
- [ ] Status messages are announced
- [ ] Page works in multiple browsers
- [ ] Works with screen readers

## Component-Specific Guidelines

### Buttons

```tsx
<button
  className="bg-accent-red hover:bg-accent-red-hover focus-visible:outline-2 focus-visible:outline-accent-red"
  aria-label={iconOnly ? "Close" : undefined}
>
  {iconOnly ? "✕" : "Close Button"}
</button>
```

✅ Visual focus ring, aria-label for icon-only buttons

### Links

```tsx
// ✅ Descriptive link text
<a href="/booking">Book a DJ set</a>

// ❌ Vague link text
<a href="/booking">Click here</a>

// ✅ External link indicator
<a href="https://example.com">
  External site <span aria-label="opens in new tab">(↗)</span>
</a>
```

### Form Inputs

```tsx
<div className="space-y-sm">
  <label htmlFor="email" className="block font-medium">
    Email Address
    <span aria-label="required">*</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-describedby="email-hint email-error"
    className="w-full px-md py-sm border-2 border-dark-border rounded-md focus-visible:border-accent-red"
  />
  <p id="email-hint" className="text-caption text-text-secondary">
    We'll never share your email
  </p>
  {error && (
    <p id="email-error" className="text-caption text-accent-danger">
      {error}
    </p>
  )}
</div>
```

### Modals

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  className="z-modal bg-dark-surface rounded-lg shadow-xl"
>
  <h2 id="modal-title" className="text-h2 font-bold">
    Confirm Action
  </h2>
  <p>Are you sure you want to proceed?</p>
  <div className="flex gap-md justify-end">
    <button onClick={onCancel}>Cancel</button>
    <button onClick={onConfirm} className="bg-accent-danger">
      Delete
    </button>
  </div>
</div>
```

### Live Regions

```tsx
// Polite (doesn't interrupt screen reader)
<div aria-live="polite" aria-atomic="true">
  {successMessage}
</div>

// Assertive (interrupts screen reader - use sparingly)
<div aria-live="assertive">
  Connection lost. Reconnecting...
</div>
```

## Resources & Tools

### Contrast Checking
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Accessible Colors: https://accessible-colors.com/
- Polychroma: https://www.colorbox.io/

### Keyboard Testing
- Tab through every page
- Ensure logical tab order
- No keyboard traps
- All functionality accessible

### Screen Reader Testing
- NVDA (Windows): https://www.nvaccess.org/
- JAWS (Windows): https://www.freedomscientific.com/
- VoiceOver (macOS/iOS): Built-in
- TalkBack (Android): Built-in

### Automated Auditing
- axe DevTools: https://www.deque.com/axe/devtools/
- Lighthouse: Built into Chrome DevTools
- Wave: https://wave.webaim.org/
- Pa11y: https://pa11y.org/

### Documentation & Specs
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Practices: https://www.w3.org/WAI/ARIA/apg/
- WebAIM: https://webaim.org/
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility

### Learning Resources
- A11y Project: https://www.a11yproject.com/
- Inclusive Components: https://inclusive-components.design/
- Deque University: https://dequeuniversity.com/
- Level Access: https://www.levelaccess.com/

## Accessibility Performance

### Cumulative Impact

Each accessibility feature compounds:
- 1% of population uses screen readers
- 15% of population has some form of disability
- 80% of accessibility benefits **all users** (mobile, older users, etc.)

### Keyboard Navigation Benefits Everyone

- Older users with reduced dexterity
- People on mobile/tablet devices
- Power users who prefer keyboard
- Mobile keyboards on iOS/Android

### Clear Text Benefits Everyone

- English language learners
- People with cognitive disabilities
- Mobile users with small screens
- Older users with declining vision

## Continuous Improvement

1. **Regular Audits:** Test quarterly with real users and tools
2. **User Feedback:** Collect accessibility feedback
3. **Automated Testing:** Use tools in CI/CD pipeline
4. **Screen Reader Testing:** Test with NVDA and VoiceOver
5. **Keyboard Testing:** Test all features keyboard-only
6. **Documentation:** Keep accessibility docs updated
7. **Training:** Educate team on accessibility
8. **Reporting:** Track and fix accessibility issues

## Contact & Support

For accessibility questions or to report issues:
- Email: accessibility@djdannyhectic.com
- Issue tracker: GitHub issues with `accessibility` label
- Response time: 24-48 hours for accessibility issues
