# WCAG 2.1 AAA Accessibility Integration Guide

Quick reference for integrating accessibility features into the Ghost Detail application.

## 3-Step Integration

### 1. Import Accessibility Styles
Add to `client/src/index.css` or the top of your main CSS file:

```css
@import './styles/accessibility-advanced.css';
```

### 2. Add Components to App Root
In `client/src/App.tsx`, add the accessibility components:

```tsx
import { AccessibilityPanel, KeyboardShortcuts } from '@/components/accessibility';

export function App() {
  return (
    <>
      {/* Accessibility Features */}
      <AccessibilityPanel />
      <KeyboardShortcuts />
      
      {/* Your existing app content */}
      <YourAppContent />
    </>
  );
}
```

### 3. Add Skip Link (Optional but Recommended)
In your main layout component:

```tsx
export function Layout({ children }) {
  return (
    <div>
      {/* Skip link - must be first element */}
      <a href="#main-content" className="sr-skip-link">
        Skip to main content
      </a>
      
      {/* Your navigation */}
      <nav>{/* ... */}</nav>
      
      {/* Main content with ID */}
      <main id="main-content">
        {children}
      </main>
      
      {/* Footer */}
      <footer>{/* ... */}</footer>
    </div>
  );
}
```

---

## What Gets Enabled

### User-Visible Features
1. **Accessibility Button** (bottom-right corner)
   - Red floating button with settings icon
   - Click to open settings panel
   - Alt+A keyboard shortcut

2. **Accessibility Settings Panel**
   - High contrast mode toggle
   - Large text (125%) toggle
   - Text spacing toggle (for dyslexia)
   - Colorblind mode selector
   - Focus indicator selector
   - Reset button
   - All settings persist in localStorage

3. **Keyboard Shortcuts**
   - Alt+A - Open/close accessibility settings
   - Alt+H - Go to home page
   - Alt+S - Skip to main content
   - Alt+C - Focus search
   - Alt+? - Show all shortcuts
   - Press Alt+? to see full list in modal

4. **Skip Link**
   - Hidden by default
   - Visible when Tab key pressed
   - Links to #main-content element
   - Improves keyboard navigation

### Behind-The-Scenes Features
- System preference detection (high contrast, reduced motion)
- 7:1 contrast ratio on all text (AAA requirement)
- Enhanced focus indicators (3px red outline)
- 48x48px minimum touch targets
- Text spacing options for dyslexia
- Colorblind safe color palettes
- Captions and transcripts support
- ARIA labels and descriptions
- Full keyboard navigation support

---

## Component Usage Examples

### Using the Accessibility Hook
If you need to check current preferences in your components:

```tsx
import { useAccessibilityEnhancements } from '@/hooks/useAccessibilityEnhancements';

export function MyComponent() {
  const { preferences, updatePreferences } = useAccessibilityEnhancements();

  return (
    <div>
      {/* Check current settings */}
      {preferences.highContrast && <p>High contrast is ON</p>}
      
      {/* Update settings programmatically */}
      <button onClick={() => updatePreferences({ largeText: true })}>
        Enable Large Text
      </button>

      {/* Show current colorblind mode */}
      <p>Colorblind mode: {preferences.colorblindMode}</p>
    </div>
  );
}
```

### Using Captioned Content
For videos with captions and transcripts:

```tsx
import { CaptionedContent } from '@/components/accessibility';

export function VideoSection() {
  return (
    <CaptionedContent
      videoUrl="/videos/demo.mp4"
      captionUrl="/videos/demo.vtt"
      transcriptText={`
        [00:00] Welcome to our tutorial
        [00:05] First, let's cover the basics
        ...
      `}
      title="How to Use This Feature"
      description="A step-by-step guide"
    />
  );
}
```

### Accessible Form Example
```tsx
export function ContactForm() {
  return (
    <form>
      <div>
        <label htmlFor="name">
          Name <span aria-label="required">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          aria-describedby="name-help"
          className="focus-visible:outline focus-visible:outline-red-500"
        />
        <p id="name-help" className="text-xs text-gray-400">
          Your full name
        </p>
      </div>

      {/* Form continues... */}
    </form>
  );
}
```

### Status Messages
```tsx
// Error message
<div role="alert" aria-live="assertive">
  <span className="status-error">Error: Please check your input</span>
</div>

// Success message
<div role="status" aria-live="polite">
  <span className="status-success">Successfully saved!</span>
</div>

// Info message
<div role="status">
  <span className="status-info">Please note: This is important</span>
</div>
```

---

## Testing What You've Integrated

### Quick Test 1: Keyboard Navigation
1. Open the app
2. Press Tab repeatedly
3. Verify:
   - All buttons/links are reachable
   - Focus outline is visible (red 3px box)
   - Tab order makes sense
   - Can activate buttons with Enter
   - Can toggle checkboxes with Space

### Quick Test 2: Accessibility Panel
1. Click the red settings button (bottom-right)
2. Or press Alt+A
3. Verify:
   - Panel opens
   - All options are clickable
   - Settings toggle work
   - Values persist after refresh
   - Can close with X button or Escape

### Quick Test 3: High Contrast
1. Open accessibility panel
2. Toggle "High Contrast Mode"
3. Verify:
   - Text is brighter white
   - Borders are more visible
   - Focus outlines are thicker
   - Still readable and usable

### Quick Test 4: Large Text
1. Open accessibility panel
2. Toggle "Large Text (125%)"
3. Verify:
   - All text is larger
   - Layout doesn't break
   - Still readable
   - Forms still usable

### Quick Test 5: Colorblind Modes
1. Open accessibility panel
2. Select different colorblind modes
3. Verify:
   - Status indicators change color
   - UI is still understandable
   - No color is the only indicator

### Quick Test 6: Skip Link
1. On any page, press Tab immediately
2. Verify:
   - Red "Skip to main content" link appears
   - Press Enter
   - Focus moves to main content
   - Page scrolls to main area

### Quick Test 7: Keyboard Shortcuts
1. Press Alt+?
2. Verify:
   - Modal opens showing all shortcuts
3. Try each shortcut:
   - Alt+A - accessibility panel
   - Alt+S - skip to content
   - Escape - close dialogs

---

## Customization Options

### Change the Accent Color
If you want to change the red (#FF4444) accent color:

1. Edit `client/src/styles/accessibility-advanced.css`
2. Find all instances of `#FF4444`
3. Replace with your color (must maintain 7:1 contrast)
4. Update colorblind palettes if needed

Example color change:
```css
/* Before */
:focus-visible {
  outline: 3px solid #FF4444;
}

/* After */
:focus-visible {
  outline: 3px solid #007BFF; /* Your color */
}
```

### Change the Floating Button Position
```tsx
// In client/src/components/accessibility/AccessibilityPanel.tsx
// Find this line:
className="fixed bottom-6 right-6 z-40..."

// Change to:
className="fixed bottom-6 left-6 z-40..." // Left side
// or
className="fixed top-6 right-6 z-40..."  // Top right
```

### Add Custom Accessibility Preferences
```tsx
// In client/src/hooks/useAccessibilityEnhancements.ts
// Add to AccessibilityPreferences interface:
export interface AccessibilityPreferences {
  // ... existing fields
  customSetting: boolean;  // Your new setting
}

// Update DEFAULT_PREFERENCES:
const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  // ... existing defaults
  customSetting: false,
};
```

---

## File Reference

### CSS Styles
- `client/src/styles/accessibility-advanced.css` - All accessibility styles
  - High contrast mode
  - Large text support
  - Focus indicators
  - Touch targets
  - Text spacing
  - Colorblind palettes

### React Hooks
- `client/src/hooks/useAccessibilityEnhancements.ts` - Preference management
  - System detection
  - localStorage persistence
  - Document manipulation
  - Screen reader announcements

### Components
- `client/src/components/accessibility/AccessibilityPanel.tsx` - Settings dialog
- `client/src/components/accessibility/KeyboardShortcuts.tsx` - Shortcuts modal
- `client/src/components/accessibility/CaptionedContent.tsx` - Video component
- `client/src/components/accessibility/AccessibilityDemo.tsx` - Demo/testing page

### Utilities
- `client/src/utils/keyboard-shortcuts.ts` - Shortcut definitions and handlers

### Documentation
- `client/src/components/accessibility/ACCESSIBILITY_GUIDE.md` - Full guide
- `client/src/components/accessibility/IMPLEMENTATION_CHECKLIST.md` - Checklist
- `ACCESSIBILITY_IMPLEMENTATION_SUMMARY.md` - Project summary
- `ACCESSIBILITY_INTEGRATION.md` - This file

---

## Troubleshooting

### Focus Outline Not Showing?
- Check browser DevTools for CSS overrides
- Ensure `accessibility-advanced.css` is imported
- Verify z-index allows outline to be visible
- Clear browser cache and reload

### Settings Not Persisting?
- Check browser localStorage is enabled
- Check browser console for errors
- Verify localStorage quota not exceeded
- Check if in private/incognito mode (data clears)

### Colorblind Palette Not Changing?
- Verify colorblind mode is selected in panel
- Check CSS custom properties are defined
- Ensure elements use `var(--color-status-*)` 
- Check for inline styles overriding CSS

### Keyboard Shortcuts Not Working?
- Verify `initializeKeyboardShortcuts()` is called
- Check Alt key works on your OS (some block Alt+letters)
- Test with different keyboard layout
- Check browser extensions aren't blocking shortcuts

### Skip Link Not Appearing?
- Verify skip link element has `sr-skip-link` class
- Check it's not hidden by `display: none`
- Ensure it's the first element on page
- Test with Tab key (not just clicking)

---

## Support & Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Checker](https://wave.webaim.org/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Questions?
- Check `ACCESSIBILITY_GUIDE.md` for detailed explanations
- Review component code for implementation details
- See `AccessibilityDemo.tsx` for working examples
- Run through `IMPLEMENTATION_CHECKLIST.md`

---

**Status**: Ready to integrate  
**Compliance**: WCAG 2.1 Level AAA  
**Last Updated**: 2026-05-01
