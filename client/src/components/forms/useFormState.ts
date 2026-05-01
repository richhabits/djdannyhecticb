import { useState, useCallback } from 'react';
import { validateForm, FieldValidation } from './FormValidation';

export interface UseFormStateOptions<T extends Record<string, string>> {
  initialValues: T;
  validationRules: FieldValidation;
  onSubmit: (data: T) => Promise<void>;
}

export function useFormState<T extends Record<string, string>>({
  initialValues,
  validationRules,
  onSubmit,
}: UseFormStateOptions<T>) {
  const [formData, setFormData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const handleChange = useCallback(
    (field: keyof T, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);

      if (touched[field as string]) {
        const fieldErrors = validateForm(
          { ...formData, [field]: value },
          { [field as string]: validationRules[field as string] }
        );

        if (fieldErrors[field as string]) {
          setErrors((prev) => ({
            ...prev,
            [field]: fieldErrors[field as string],
          }));
        } else {
          setErrors((prev) => {
            const { [field]: _, ...rest } = prev;
            return rest;
          });
        }
      }

      setSubmitStatus('idle');
    },
    [formData, touched, validationRules]
  );

  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      const fieldErrors = validateForm(
        formData,
        { [field]: validationRules[field] }
      );

      if (fieldErrors[field]) {
        setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
      }
    },
    [formData, validationRules]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateForm(formData, validationRules);
      setErrors(validationErrors);

      const allTouched = Object.keys(validationRules).reduce(
        (acc, field) => ({ ...acc, [field]: true }),
        {}
      );
      setTouched(allTouched);

      if (Object.keys(validationErrors).length > 0) {
        setSubmitStatus('error');
        return;
      }

      setIsSubmitting(true);
      setSubmitStatus('loading');

      try {
        await onSubmit(formData);
        setSubmitStatus('success');
        setFormData(initialValues);
        setErrors({});
        setTouched({});
        setIsDirty(false);

        // Reset after 3 seconds
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } catch (error) {
        setSubmitStatus('error');
        setErrors({
          submit: error instanceof Error ? error.message : 'An error occurred',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validationRules, onSubmit, initialValues]
  );

  const reset = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
    setSubmitStatus('idle');
  }, [initialValues]);

  const resetField = useCallback((field: keyof T) => {
    setFormData((prev) => ({
      ...prev,
      [field]: initialValues[field],
    }));
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
    setTouched((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, [initialValues]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    touched,
    setTouched,
    isSubmitting,
    isDirty,
    submitStatus,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    resetField,
  };
}
