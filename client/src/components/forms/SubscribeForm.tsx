import { useState } from 'react';
import { FormField } from './FormField';
import { FormMessage } from './FormMessage';
import { Button } from '@/components/ui/button';
import { validateForm, FieldValidation } from './FormValidation';

interface SubscribeFormData {
  email: string;
  name: string;
}

type SubmitStatus = 'idle' | 'success' | 'error' | 'loading';

export function SubscribeForm() {
  const [formData, setFormData] = useState<SubscribeFormData>({
    email: '',
    name: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');

  const validationRules: FieldValidation = {
    email: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Please enter a valid email address' },
    ],
    name: [
      { type: 'required', message: 'Name is required' },
      { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
    ],
  };

  const handleChange = (field: keyof SubscribeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      const fieldErrors = validateForm(
        { ...formData, [field]: value },
        { [field]: validationRules[field] }
      );

      if (fieldErrors[field]) {
        setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
      } else {
        setErrors((prev) => {
          const { [field]: _, ...rest } = prev;
          return rest;
        });
      }
    }

    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const fieldErrors = validateForm(
      formData as unknown as Record<string, string>,
      { [field]: validationRules[field as keyof SubscribeFormData] }
    );

    if (fieldErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData as unknown as Record<string, string>, validationRules);
    setErrors(validationErrors);
    setTouched({
      email: true,
      name: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('loading');
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitStatus('success');
      setFormData({ email: '', name: '' });
      setErrors({});
      setTouched({});

      // Reset after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <h3 className="text-lg font-bold">Subscribe to Updates</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Get notified about new streams and exclusive content.
        </p>
      </div>

      {submitStatus === 'success' && (
        <FormMessage
          type="success"
          title="Subscription confirmed!"
          description="Check your email for confirmation."
          onDismiss={() => setSubmitStatus('idle')}
        />
      )}

      {submitStatus === 'error' && Object.keys(errors).length > 0 && (
        <FormMessage
          type="error"
          title="Please fix the errors below"
          errors={errors}
          onDismiss={() => setSubmitStatus('idle')}
        />
      )}

      {submitStatus === 'loading' && (
        <FormMessage
          type="loading"
          title="Subscribing..."
        />
      )}

      <FormField
        label="Your Name"
        name="name"
        placeholder="John Doe"
        value={formData.name}
        error={errors.name}
        touched={touched.name}
        success={touched.name && !errors.name && formData.name.length > 0}
        onChange={(e) => handleChange('name', e.target.value)}
        onBlur={() => handleBlur('name')}
        required
      />

      <FormField
        label="Email Address"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={formData.email}
        error={errors.email}
        touched={touched.email}
        success={touched.email && !errors.email && formData.email.length > 0}
        onChange={(e) => handleChange('email', e.target.value)}
        onBlur={() => handleBlur('email')}
        required
      />

      <Button
        type="submit"
        disabled={submitStatus === 'loading'}
        variant="default"
        className="w-full"
      >
        {submitStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        We send updates about once a week. Unsubscribe anytime.
      </p>
    </form>
  );
}
