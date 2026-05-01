# Form System Documentation

A comprehensive, production-grade form component library with complete validation, error handling, accessibility, and loading states.

## Architecture

### Core Components

#### FormField
Reusable form field component with validation states, error messages, and success feedback.

```tsx
<FormField
  label="Email"
  name="email"
  type="email"
  placeholder="you@example.com"
  value={email}
  error={errors.email}
  touched={touched.email}
  success={touched.email && !errors.email}
  onChange={(e) => handleChange('email', e.target.value)}
  onBlur={() => handleBlur('email')}
  required
/>
```

**Props:**
- `label: string` - Field label
- `name: string` - Field name (HTML id)
- `type?: string` - Input type (default: 'text')
- `placeholder?: string` - Placeholder text
- `value?: string` - Field value
- `error?: string` - Error message
- `touched?: boolean` - Whether field was interacted with
- `success?: boolean` - Whether field validation passed
- `disabled?: boolean` - Disabled state
- `required?: boolean` - Required indicator
- `hint?: string` - Helper text
- `onChange?: (e) => void` - Change handler
- `onBlur?: (e) => void` - Blur handler
- `maxLength?: number` - Max characters

**States:**
- Default: Empty, ready for input
- Focused: User is typing
- Error: Validation failed (red border, error icon)
- Success: Validation passed (green border, check icon)
- Disabled: Field is disabled
- Touched: User has interacted with field

#### TextAreaField
Multi-line textarea with character counter and validation.

```tsx
<TextAreaField
  label="Message"
  name="message"
  placeholder="Tell us..."
  value={message}
  error={errors.message}
  touched={touched.message}
  success={touched.message && !errors.message}
  maxLength={500}
  rows={4}
  onChange={(e) => handleChange('message', e.target.value)}
  onBlur={() => handleBlur('message')}
/>
```

#### FormMessage
Status message component (error, success, warning, info, loading).

```tsx
<FormMessage
  type="error"
  title="Please fix the errors below"
  errors={errors}
  onDismiss={() => setSubmitStatus('idle')}
/>
```

**Types:**
- `error` - Red alert with error icon
- `success` - Green confirmation with check icon
- `warning` - Yellow warning with alert icon
- `info` - Blue info with info icon
- `loading` - Loading spinner

### Pre-built Forms

#### DonationForm
Complete donation form with donor name, amount, email, and optional message.

```tsx
import { DonationForm } from '@/components/forms';

export default function DonationPage() {
  return <DonationForm />;
}
```

**Features:**
- Real-time validation
- Amount range validation ($1-$100,000)
- Email validation
- Message character limit (500)
- Submit status feedback
- Accessible error summary

#### ContactForm
Contact form with name, email, subject, and message.

```tsx
import { ContactForm } from '@/components/forms';

export default function ContactPage() {
  return <ContactForm />;
}
```

#### SubscribeForm
Newsletter subscription form with name and email.

```tsx
import { SubscribeForm } from '@/components/forms';

export default function Footer() {
  return <SubscribeForm />;
}
```

## Validation System

### ValidationRule
Define validation rules for form fields.

```tsx
interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 
        'pattern' | 'custom' | 'number' | 'min' | 'max';
  message: string;
  value?: string | number;
  validator?: (value: string) => boolean;
}
```

### Built-in Validators

```tsx
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumber,
  validateMin,
  validateMax,
  validatePattern,
  validateField,
  validateForm,
} from '@/components/forms';

// Validate single field
const error = validateField('user@example.com', [
  { type: 'required', message: 'Email is required' },
  { type: 'email', message: 'Invalid email' },
]);

// Validate entire form
const errors = validateForm(formData, validationRules);
```

### Custom Validation

```tsx
const validationRules: FieldValidation = {
  password: [
    { type: 'required', message: 'Password required' },
    { type: 'minLength', value: 8, message: 'Min 8 characters' },
    {
      type: 'custom',
      message: 'Must contain uppercase and number',
      validator: (value) => /[A-Z]/.test(value) && /[0-9]/.test(value),
    },
  ],
};
```

## useFormState Hook

Comprehensive form state management hook.

```tsx
import { useFormState } from '@/components/forms';

function MyForm() {
  const {
    formData,
    errors,
    touched,
    isSubmitting,
    isDirty,
    submitStatus,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    resetField,
  } = useFormState({
    initialValues: {
      name: '',
      email: '',
    },
    validationRules: {
      name: [{ type: 'required', message: 'Name required' }],
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
        label="Name"
        name="name"
        value={formData.name}
        error={errors.name}
        touched={touched.name}
        onChange={(e) => handleChange('name', e.target.value)}
        onBlur={() => handleBlur('name')}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

## Accessibility Features

### ARIA Labels
- Proper `htmlFor` associations on labels
- `aria-invalid` for error states
- `aria-describedby` linking to error/hint text
- `role="alert"` on error messages
- `role="status"` on success messages

### Keyboard Navigation
- Tab order follows form flow
- Enter submits form
- Escape clears focus
- All interactive elements keyboard accessible

### Screen Reader Support
- Semantic HTML structure
- Error messages announced
- Success feedback announced
- Required field indicators

### Color Contrast
- Error states: High contrast red (WCAG AA)
- Success states: High contrast green
- Focus indicators: Clear ring around focused elements

## Styling

### Tailwind Classes
The form system uses Tailwind CSS with semantic color tokens:

```tsx
bg-secondary        // Input background
border-input        // Default border
border-destructive  // Error state
text-foreground     // Text color
text-muted-foreground  // Hint text
```

### Custom Theme Integration

Customize theme tokens in your `tailwind.config.ts`:

```tsx
export default {
  theme: {
    extend: {
      colors: {
        secondary: '#1a1a1a',
        destructive: '#ef4444',
        'muted-foreground': '#666666',
      },
    },
  },
};
```

## Form Patterns

### Pattern 1: Manual State Management

```tsx
function CustomForm() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      const error = validateField(value, emailRules);
      setErrors(prev => ({ ...prev, email: error }));
    }
  };

  const handleBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    const error = validateField(email, emailRules);
    setErrors(prev => ({ ...prev, email: error }));
  };

  return (
    <FormField
      label="Email"
      name="email"
      value={email}
      error={errors.email}
      touched={touched.email}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
    />
  );
}
```

### Pattern 2: Hook-based State Management

```tsx
function FormWithHook() {
  const { formData, errors, touched, handleChange, handleBlur, handleSubmit } = 
    useFormState({
      initialValues: { email: '' },
      validationRules: { email: emailRules },
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

### Pattern 3: React Hook Form Integration

```tsx
import { useForm, Controller } from 'react-hook-form';
import { FormField } from '@/components/forms';

function FormWithRHF() {
  const { control, formState: { errors } } = useForm({
    defaultValues: { email: '' },
  });

  return (
    <form>
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormField
            label="Email"
            {...field}
            error={error?.message}
          />
        )}
      />
    </form>
  );
}
```

## Storybook Stories

All components have comprehensive Storybook stories covering:

- Default state
- With value
- Focused state
- Error state
- Success state
- Required field
- Disabled state
- All states showcase
- Interactive examples

View stories:
```bash
npm run storybook
# Navigate to Forms section
```

## Validation Rules Reference

| Rule | Purpose | Example |
|------|---------|---------|
| `required` | Field must have value | `{ type: 'required', message: 'Required' }` |
| `email` | Valid email format | `{ type: 'email', message: 'Invalid email' }` |
| `minLength` | Minimum character count | `{ type: 'minLength', value: 8, message: 'Min 8' }` |
| `maxLength` | Maximum character count | `{ type: 'maxLength', value: 100, message: 'Max 100' }` |
| `number` | Valid number | `{ type: 'number', message: 'Must be number' }` |
| `min` | Minimum numeric value | `{ type: 'min', value: 18, message: 'Min 18' }` |
| `max` | Maximum numeric value | `{ type: 'max', value: 100, message: 'Max 100' }` |
| `pattern` | Matches regex | `{ type: 'pattern', value: '^[A-Z]', message: 'Start with uppercase' }` |
| `custom` | Custom validator function | `{ type: 'custom', validator: (v) => v.length > 0, message: 'Invalid' }` |

## TypeScript Support

Full TypeScript support with proper types:

```tsx
import { useFormState, type UseFormStateOptions, type ValidationRule } from '@/components/forms';

interface MyFormData {
  name: string;
  email: string;
}

const options: UseFormStateOptions<MyFormData> = {
  initialValues: { name: '', email: '' },
  validationRules: {
    name: [...],
    email: [...],
  },
  onSubmit: async (data: MyFormData) => {
    // data is properly typed
  },
};
```

## Best Practices

### 1. Validate on Blur and Submit
- Validate on blur to provide real-time feedback
- Validate on submit for final check
- Don't validate on every keystroke (unless live search)

### 2. Show Errors Only When Touched
- Don't show errors until user interacts with field
- This prevents overwhelming users
- Use the `touched` flag to control error display

### 3. Provide Clear, Actionable Errors
```tsx
// Bad
error: 'Invalid input'

// Good
error: 'Email must be in format: name@example.com'
```

### 4. Use Hint Text for Requirements
```tsx
<FormField
  label="Password"
  hint="Minimum 8 characters, 1 uppercase, 1 number"
/>
```

### 5. Group Related Fields
```tsx
<form>
  <fieldset>
    <legend>Personal Information</legend>
    <FormField ... />
    <FormField ... />
  </fieldset>
</form>
```

### 6. Disable Submit During Processing
```tsx
<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Processing...' : 'Submit'}
</button>
```

### 7. Show Success Feedback
```tsx
{submitStatus === 'success' && (
  <FormMessage type="success" title="Success!" />
)}
```

## Performance Considerations

1. **Memoization**: Use `useCallback` for handlers to prevent re-renders
2. **Lazy Validation**: Only validate touched fields
3. **Debounce**: For async validators, use debounce
4. **Code Splitting**: Import form components dynamically if needed

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

All modern browsers with ES2020 support.

## License

MIT
