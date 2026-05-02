import { useState } from 'react';
import { FormField } from './FormField';
import { TextAreaField } from './TextAreaField';
import { FormMessage } from './FormMessage';
import { Button } from '@/components/ui/button';
import { validateForm, FieldValidation } from './FormValidation';

interface DonationFormData {
  donorName: string;
  amount: string;
  message: string;
  email: string;
}

type SubmitStatus = 'idle' | 'success' | 'error';

export function DonationForm() {
  const [formData, setFormData] = useState<DonationFormData>({
    donorName: '',
    amount: '',
    message: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');

  const validationRules: FieldValidation = {
    donorName: [
      { type: 'required', message: 'Name is required' },
      { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
      { type: 'maxLength', value: 100, message: 'Name must be less than 100 characters' },
    ],
    amount: [
      { type: 'required', message: 'Amount is required' },
      { type: 'number', message: 'Amount must be a valid number' },
      { type: 'min', value: 1, message: 'Amount must be at least $1' },
      { type: 'max', value: 100000, message: 'Amount must not exceed $100,000' },
    ],
    email: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Please enter a valid email address' },
    ],
    message: [
      { type: 'maxLength', value: 500, message: 'Message must be less than 500 characters' },
    ],
  };

  const handleChange = (field: keyof DonationFormData, value: string) => {
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

    setSubmitStatus('idle');
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const fieldErrors = validateForm(
      formData as unknown as Record<string, string>,
      { [field]: validationRules[field as keyof DonationFormData] }
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
      donorName: true,
      amount: true,
      email: true,
      message: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitStatus('success');
      setFormData({ donorName: '', amount: '', message: '', email: '' });
      setErrors({});
      setTouched({});

      // Reset after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <h2 className="text-2xl font-bold">Support the Stream</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Your contribution helps keep the stream running smoothly.
        </p>
      </div>

      {submitStatus === 'success' && (
        <FormMessage
          type="success"
          title="Thank you for your support!"
          description="Your donation has been received. We appreciate your generosity!"
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

      <FormField
        label="Your Name"
        name="donorName"
        placeholder="e.g., John Doe"
        value={formData.donorName}
        error={errors.donorName}
        touched={touched.donorName}
        success={touched.donorName && !errors.donorName && formData.donorName.length > 0}
        onChange={(e) => handleChange('donorName', e.target.value)}
        onBlur={() => handleBlur('donorName')}
        required
      />

      <FormField
        label="Donation Amount"
        name="amount"
        type="number"
        placeholder="e.g., 50"
        value={formData.amount}
        error={errors.amount}
        touched={touched.amount}
        success={touched.amount && !errors.amount && formData.amount.length > 0}
        hint="Minimum $1, maximum $100,000"
        onChange={(e) => handleChange('amount', e.target.value)}
        onBlur={() => handleBlur('amount')}
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

      <TextAreaField
        label="Message"
        name="message"
        placeholder="Add a message for the streamer... (optional)"
        value={formData.message}
        error={errors.message}
        touched={touched.message}
        success={touched.message && !errors.message && formData.message.length > 0}
        onChange={(e) => handleChange('message', e.target.value)}
        onBlur={() => handleBlur('message')}
        maxLength={500}
        rows={3}
      />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12"
        onClick={handleSubmit}
      >
        {isSubmitting ? (
          <>
            <span className="animate-spin mr-2">⌛</span>
            Processing...
          </>
        ) : (
          `Donate ${formData.amount ? `$${formData.amount}` : ''}`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your donation is secure and processed via Stripe. No spam, we promise!
      </p>
    </form>
  );
}
