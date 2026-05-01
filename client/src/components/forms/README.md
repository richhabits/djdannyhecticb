# Form System - Complete Component Library

A production-grade form system with comprehensive validation, error handling, accessibility, and loading states.

## Quick Links

- [Form System Documentation](./FORM_SYSTEM.md) - Complete API reference
- [Integration Examples](./INTEGRATION_EXAMPLES.md) - Real-world usage patterns
- [Storybook Stories](./FormField.stories.tsx) - Interactive component showcase

## What's Included

### Core Components

| Component | Purpose |
|-----------|---------|
| `FormField` | Reusable single-line input with validation states |
| `TextAreaField` | Multi-line input with character counter |
| `FormMessage` | Status message (error, success, warning, info, loading) |
| `FormContext` | Global form state management |

### Pre-built Forms

| Form | Use Case |
|------|----------|
| `DonationForm` | Accept donations with validation |
| `ContactForm` | Contact form with message field |
| `SubscribeForm` | Newsletter subscription |

### Utilities

| Tool | Purpose |
|------|---------|
| `useFormState` | Complete form state management hook |
| `validateForm` | Form-wide validation |
| `validateField` | Single field validation |
| Built-in validators | email, phone, required, minLength, etc. |

## Quick Start

### 1. Use a Pre-built Form

```tsx
import { DonationForm } from '@/components/forms';

export default function Page() {
  return <DonationForm />;
}
```

### 2. Build Custom Form with Hook

```tsx
import { useFormState } from '@/components/forms';
import { FormField } from '@/components/forms';

export function MyForm() {
  const { formData, errors, touched, handleChange, handleBlur, handleSubmit } = 
    useFormState({
      initialValues: { email: '' },
      validationRules: {
        email: [
          { type: 'required', message: 'Email required' },
          { type: 'email', message: 'Invalid email' },
        ],
      },
      onSubmit: async (data) => {
        await api.submit(data);
      },
    });

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="Email"
        name="email"
        value={formData.email}
        error={errors.email}
        touched={touched.email}
        onChange={(e) => handleChange('email', e.target.value)}
        onBlur={() => handleBlur('email')}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 3. Manual State Management

```tsx
import { FormField } from '@/components/forms';
import { validateField } from '@/components/forms';
import { useState } from 'react';

export function SimpleForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const emailRules = [
    { type: 'required', message: 'Email required' },
    { type: 'email', message: 'Invalid email' },
  ];

  return (
    <form>
      <FormField
        label="Email"
        name="email"
        value={email}
        error={error}
        touched={touched}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => {
          setTouched(true);
          setError(validateField(email, emailRules) || '');
        }}
      />
    </form>
  );
}
```

## File Structure

```
forms/
├── FormContext.ts              # Context API setup
├── FormField.tsx               # Single-line input
├── FormField.stories.tsx       # Storybook stories
├── TextAreaField.tsx           # Multi-line input
├── TextAreaField.stories.tsx   # Storybook stories
├── FormMessage.tsx             # Status messages
├── FormMessage.stories.tsx     # Storybook stories
├── FormValidation.ts           # Validation logic
├── useFormState.ts             # Form state hook
├── DonationForm.tsx            # Pre-built form
├── DonationForm.stories.tsx    # Storybook stories
├── ContactForm.tsx             # Pre-built form
├── ContactForm.stories.tsx     # Storybook stories
├── SubscribeForm.tsx           # Pre-built form
├── SubscribeForm.stories.tsx   # Storybook stories
├── index.ts                    # Export all
├── README.md                   # This file
├── FORM_SYSTEM.md              # Complete documentation
└── INTEGRATION_EXAMPLES.md     # Usage examples
```

## Key Features

### Validation
- Real-time validation on blur
- Submit-time validation
- Custom validation rules
- Built-in validators: email, phone, required, minLength, maxLength, number, min, max, pattern
- Error messages with actionable feedback

### Error Handling
- Clear, contextual error messages
- Only show errors when field is touched
- Error summary for form-level issues
- Error list for multiple errors
- Screen reader announcements

### Accessibility
- Semantic HTML structure
- Proper label associations
- ARIA attributes (invalid, describedby)
- Keyboard navigation support
- Focus indicators
- High contrast states

### Loading & Feedback
- Loading state indicator
- Success confirmation
- Error messages
- Form dirty state tracking
- Submit button disabled during processing

### TypeScript Support
- Full type safety
- Generic validation rules
- Proper form data typing
- Hook options interface

## States Covered

Each component supports:
- **Default** - Ready for input
- **Focused** - User is interacting
- **Filled** - User has entered data
- **Error** - Validation failed
- **Success** - Validation passed
- **Disabled** - Field disabled
- **Loading** - Processing submission

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- `lucide-react` - Icons
- `clsx` - Class utility
- `tailwind-merge` - Tailwind utilities
- React 18+

## Performance

- Memoized handlers prevent unnecessary re-renders
- Lazy validation only for touched fields
- Efficient state updates
- Code-split friendly components

## Accessibility Score

- WCAG 2.1 AA compliant
- Keyboard navigable
- Screen reader friendly
- Color contrast verified
- Focus visible indicators

## Examples in Codebase

See [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md) for:
- Login form
- Multi-step wizard
- Dynamic field arrays
- Conditional fields
- Testing patterns
- Customization examples

## Best Practices

1. ✅ Validate on blur + submit
2. ✅ Show errors only when touched
3. ✅ Provide clear error messages
4. ✅ Use hint text for requirements
5. ✅ Disable submit while processing
6. ✅ Show success feedback
7. ✅ Make error messages actionable
8. ✅ Group related fields

## Storybook

View all components and states interactively:

```bash
npm run storybook
```

Navigate to Forms → [Component Name] to see all states and variations.

## Support

For detailed information on:
- **API Reference** → See [FORM_SYSTEM.md](./FORM_SYSTEM.md)
- **Usage Patterns** → See [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md)
- **Visual States** → Run `npm run storybook`

## License

MIT
