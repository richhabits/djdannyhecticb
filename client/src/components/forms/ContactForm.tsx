import { useState } from 'react';
import { FormField } from './FormField';
import { TextAreaField } from './TextAreaField';
import { FormMessage } from './FormMessage';
import { Button } from '@/components/ui/button';
import { validateForm, FieldValidation } from './FormValidation';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type SubmitStatus = 'idle' | 'success' | 'error' | 'loading';

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');

  const validationRules: FieldValidation = {
    name: [
      { type: 'required', message: 'Name is required' },
      { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
      { type: 'maxLength', value: 100, message: 'Name must be less than 100 characters' },
    ],
    email: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Please enter a valid email address' },
    ],
    subject: [
      { type: 'required', message: 'Subject is required' },
      { type: 'minLength', value: 5, message: 'Subject must be at least 5 characters' },
      { type: 'maxLength', value: 100, message: 'Subject must be less than 100 characters' },
    ],
    message: [
      { type: 'required', message: 'Message is required' },
      { type: 'minLength', value: 10, message: 'Message must be at least 10 characters' },
      { type: 'maxLength', value: 1000, message: 'Message must be less than 1000 characters' },
    ],
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
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
      formData,
      { [field]: validationRules[field as keyof ContactFormData] }
    );

    if (fieldErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData, validationRules);
    setErrors(validationErrors);
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('loading');
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
      setTouched({});

      // Reset after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <h2 className="text-2xl font-bold">Get in Touch</h2>
        <p className="text-muted-foreground text-sm mt-1">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      {submitStatus === 'success' && (
        <FormMessage
          type="success"
          title="Message sent successfully!"
          description="Thank you for reaching out. We'll get back to you soon."
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
          title="Sending your message..."
          description="Please wait while we process your request."
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

      <FormField
        label="Subject"
        name="subject"
        placeholder="How can we help?"
        value={formData.subject}
        error={errors.subject}
        touched={touched.subject}
        success={touched.subject && !errors.subject && formData.subject.length > 0}
        hint="Be specific about your inquiry"
        onChange={(e) => handleChange('subject', e.target.value)}
        onBlur={() => handleBlur('subject')}
        required
      />

      <TextAreaField
        label="Message"
        name="message"
        placeholder="Tell us more about your message..."
        value={formData.message}
        error={errors.message}
        touched={touched.message}
        success={touched.message && !errors.message && formData.message.length > 0}
        onChange={(e) => handleChange('message', e.target.value)}
        onBlur={() => handleBlur('message')}
        maxLength={1000}
        rows={5}
        required
      />

      <Button
        type="submit"
        disabled={submitStatus === 'loading'}
        className="w-full h-12"
      >
        {submitStatus === 'loading' ? (
          <>
            <span className="animate-spin mr-2">⌛</span>
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        We respect your privacy. Your information will not be shared with third parties.
      </p>
    </form>
  );
}
