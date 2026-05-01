import React from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  touched?: boolean;
  success?: boolean;
  disabled?: boolean;
  required?: boolean;
  hint?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  maxLength?: number;
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  error,
  touched,
  success,
  disabled,
  required,
  hint,
  onChange,
  onBlur,
  maxLength,
}: FormFieldProps) {
  const hasError = touched && error;
  const isSuccess = touched && !error && success;

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-white"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            hasError ? `${name}-error` : hint ? `${name}-hint` : undefined
          }
          className={cn(
            'w-full px-4 py-3 rounded-lg transition-all duration-200',
            'bg-secondary border-2',
            'text-foreground placeholder-muted-foreground',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasError && 'border-destructive focus-visible:ring-destructive',
            isSuccess && 'border-green-500 focus-visible:ring-green-500',
            !hasError && !isSuccess && 'border-input hover:border-muted-foreground'
          )}
        />

        {/* Status Icons */}
        {isSuccess && (
          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
        {hasError && (
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-destructive" />
        )}
      </div>

      {/* Hint Text */}
      {hint && !hasError && (
        <p id={`${name}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}

      {/* Error Message */}
      {hasError && (
        <p
          id={`${name}-error`}
          className="text-xs text-destructive font-medium"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Success Message */}
      {isSuccess && (
        <p className="text-xs text-green-500 font-medium" role="status">
          ✓ {label} looks good!
        </p>
      )}
    </div>
  );
}
