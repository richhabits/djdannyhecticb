# Form System Integration Examples

Practical examples for integrating the form system into your application.

## Quick Start

### 1. Using Pre-built Forms

```tsx
// Donation Page
import { DonationForm } from '@/components/forms';

export default function DonationPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <DonationForm />
    </div>
  );
}
```

```tsx
// Contact Page
import { ContactForm } from '@/components/forms';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <ContactForm />
    </div>
  );
}
```

```tsx
// Footer with Newsletter
import { SubscribeForm } from '@/components/forms';

export default function Footer() {
  return (
    <footer className="bg-secondary py-12">
      <div className="container max-w-5xl mx-auto">
        <SubscribeForm />
      </div>
    </footer>
  );
}
```

## Custom Form Implementation

### 2. Building a Login Form

```tsx
import { useState } from 'react';
import { FormField, FormMessage, useFormState } from '@/components/forms';
import { validateForm, type FieldValidation } from '@/components/forms';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const validationRules: FieldValidation = {
    email: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Please enter a valid email' },
    ],
    password: [
      { type: 'required', message: 'Password is required' },
      { type: 'minLength', value: 6, message: 'Password must be at least 6 characters' },
    ],
  };

  const {
    formData,
    errors,
    touched,
    submitStatus,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormState({
    initialValues: {
      email: '',
      password: '',
    },
    validationRules,
    onSubmit: async (data) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <h1 className="text-2xl font-bold">Sign In</h1>

      {submitStatus === 'error' && (
        <FormMessage
          type="error"
          title="Login failed"
          description="Please check your credentials and try again"
        />
      )}

      {submitStatus === 'success' && (
        <FormMessage
          type="success"
          title="Login successful!"
          description="Redirecting..."
        />
      )}

      <FormField
        label="Email Address"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={formData.email}
        error={errors.email}
        touched={touched.email}
        onChange={(e) => handleChange('email', e.target.value)}
        onBlur={() => handleBlur('email')}
        required
      />

      <FormField
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        error={errors.password}
        touched={touched.password}
        onChange={(e) => handleChange('password', e.target.value)}
        onBlur={() => handleBlur('password')}
        required
      />

      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  );
}
```

### 3. Multi-step Form (Wizard)

```tsx
import { useState } from 'react';
import { FormField, FormMessage } from '@/components/forms';
import { validateForm, type FieldValidation } from '@/components/forms';
import { Button } from '@/components/ui/button';

export function SignupWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const stepValidationRules: Record<number, FieldValidation> = {
    1: {
      name: [
        { type: 'required', message: 'Name is required' },
        { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
      ],
      email: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Invalid email' },
      ],
    },
    2: {
      password: [
        { type: 'required', message: 'Password is required' },
        { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
      ],
      confirmPassword: [
        {
          type: 'custom',
          message: 'Passwords must match',
          validator: (v) => v === formData.password,
        },
      ],
    },
    3: {
      phone: [
        { type: 'required', message: 'Phone is required' },
      ],
      address: [
        { type: 'required', message: 'Address is required' },
      ],
    },
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (touched[field]) {
      const rules = stepValidationRules[step];
      const fieldErrors = validateForm({ [field]: value }, { [field]: rules[field] });
      
      if (fieldErrors[field]) {
        setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
      } else {
        setErrors((prev) => {
          const { [field]: _, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const canProceed = () => {
    const rules = stepValidationRules[step];
    const stepErrors = validateForm(formData, rules);
    setErrors(stepErrors);
    setTouched(Object.keys(rules).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (canProceed()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (canProceed()) {
      // Submit form
      console.log('Form submitted:', formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Create Account</h2>
        <div className="text-sm text-muted-foreground">Step {step} of 3</div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <FormField
            label="Full Name"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            error={errors.name}
            touched={touched.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            required
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            error={errors.email}
            touched={touched.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            required
          />
        </div>
      )}

      {/* Step 2: Security */}
      {step === 2 && (
        <div className="space-y-4">
          <FormField
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            error={errors.password}
            touched={touched.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            required
          />
          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            error={errors.confirmPassword}
            touched={touched.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            required
          />
        </div>
      )}

      {/* Step 3: Contact Info */}
      {step === 3 && (
        <div className="space-y-4">
          <FormField
            label="Phone"
            name="phone"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            error={errors.phone}
            touched={touched.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            required
          />
          <FormField
            label="Address"
            name="address"
            placeholder="123 Main St"
            value={formData.address}
            error={errors.address}
            touched={touched.address}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={() => handleBlur('address')}
            required
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-6">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
            Back
          </Button>
        )}
        {step < 3 && (
          <Button type="button" onClick={handleNext} className="flex-1">
            Next
          </Button>
        )}
        {step === 3 && (
          <Button type="submit" className="flex-1">
            Create Account
          </Button>
        )}
      </div>
    </form>
  );
}
```

### 4. Dynamic Form Fields

```tsx
import { useState } from 'react';
import { FormField, FormMessage } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface PhoneField {
  id: string;
  value: string;
}

export function DynamicPhoneForm() {
  const [phones, setPhones] = useState<PhoneField[]>([{ id: '1', value: '' }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePhoneChange = (id: string, value: string) => {
    setPhones((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value } : p))
    );
  };

  const addPhone = () => {
    setPhones((prev) => [...prev, { id: Date.now().toString(), value: '' }]);
  };

  const removePhone = (id: string) => {
    setPhones((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    phones.forEach((phone, index) => {
      if (!phone.value.trim()) {
        newErrors[`phone-${index}`] = 'Phone number is required';
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Phones:', phones);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <h2 className="text-2xl font-bold">Add Phone Numbers</h2>

      <div className="space-y-3">
        {phones.map((phone, index) => (
          <div key={phone.id} className="flex gap-2">
            <div className="flex-1">
              <FormField
                label={`Phone ${index + 1}`}
                name={`phone-${index}`}
                placeholder="+1 (555) 000-0000"
                value={phone.value}
                error={errors[`phone-${index}`]}
                onChange={(e) => handlePhoneChange(phone.id, e.target.value)}
              />
            </div>
            {phones.length > 1 && (
              <button
                type="button"
                onClick={() => removePhone(phone.id)}
                className="h-12 px-3 rounded-lg bg-destructive/20 hover:bg-destructive/30 text-destructive transition-colors mt-8"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addPhone}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Another Phone
      </Button>

      <Button type="submit" className="w-full">
        Save
      </Button>
    </form>
  );
}
```

### 5. Conditional Fields

```tsx
import { useState } from 'react';
import { FormField } from '@/components/forms';
import { Button } from '@/components/ui/button';

export function ConditionalFieldsForm() {
  const [accountType, setAccountType] = useState('personal');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    companySize: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form className="space-y-6 max-w-md">
      <h2 className="text-2xl font-bold">Create Account</h2>

      <div className="space-y-2">
        <label className="block text-sm font-semibold">Account Type</label>
        <div className="flex gap-4">
          {['personal', 'business'].map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="radio"
                value={type}
                checked={accountType === type}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-4 h-4"
              />
              <span className="capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <FormField
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        required
      />

      <FormField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        required
      />

      {/* Conditional fields based on account type */}
      {accountType === 'business' && (
        <>
          <FormField
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            required
          />

          <FormField
            label="Company Size"
            name="companySize"
            value={formData.companySize}
            onChange={(e) => handleChange('companySize', e.target.value)}
            required
          />
        </>
      )}

      <Button type="submit" className="w-full">
        Create Account
      </Button>
    </form>
  );
}
```

## Testing

### Unit Tests Example

```tsx
// FormField.test.tsx
import { render, screen, userEvent } from '@testing-library/react';
import { FormField } from '@/components/forms';

describe('FormField', () => {
  it('should display error message when touched and has error', () => {
    render(
      <FormField
        label="Email"
        name="email"
        error="Invalid email"
        touched={true}
      />
    );

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('should display success state when valid', () => {
    render(
      <FormField
        label="Email"
        name="email"
        value="valid@example.com"
        success={true}
        touched={true}
      />
    );

    expect(screen.getByRole('img', { hidden: true })).toHaveClass('text-green-500');
  });

  it('should call onChange when user types', async () => {
    const onChange = vi.fn();
    render(
      <FormField
        label="Email"
        name="email"
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test@example.com');

    expect(onChange).toHaveBeenCalled();
  });
});
```

## Styling & Customization

### Tailwind Customization

```tsx
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        secondary: 'hsl(var(--secondary) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        destructive: 'hsl(var(--destructive) / <alpha-value>)',
      },
    },
  },
};
```

## Performance Tips

1. **Memoize form handlers** to prevent unnecessary re-renders
2. **Use lazy validation** for large forms
3. **Debounce async validators** (e.g., email availability checks)
4. **Code split heavy forms** using dynamic imports
5. **Optimize input rendering** with `shouldComponentUpdate` or `React.memo`

## Accessibility Checklist

- [ ] All form fields have associated labels
- [ ] Error messages announced to screen readers
- [ ] Required indicators clearly marked
- [ ] Focus visible on all interactive elements
- [ ] Form can be submitted with keyboard
- [ ] Color not the only indicator of error/success
- [ ] Sufficient color contrast
- [ ] Hint text available for complex fields
