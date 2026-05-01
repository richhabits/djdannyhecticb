import React from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextAreaFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  value?: string;
  error?: string;
  touched?: boolean;
  success?: boolean;
  disabled?: boolean;
  required?: boolean;
  hint?: string;
  rows?: number;
  maxLength?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

export function TextAreaField({
  label,
  name,
  placeholder,
  value,
  error,
  touched,
  success,
  disabled,
  required,
  hint,
  rows = 4,
  maxLength = 500,
  onChange,
  onBlur,
}: TextAreaFieldProps) {
  const hasError = touched && error;
  const isSuccess = touched && !error && success;
  const charCount = (value || '').length;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label htmlFor={name} className="block text-sm font-semibold text-white">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        {maxLength && (
          <span
            className={cn(
              'text-xs',
              charCount > maxLength * 0.9
                ? 'text-destructive'
                : 'text-muted-foreground'
            )}
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative">
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            hasError ? `${name}-error` : hint ? `${name}-hint` : undefined
          }
          className={cn(
            'w-full px-4 py-3 rounded-lg transition-all duration-200',
            'bg-secondary border-2 resize-none',
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
          <Check className="absolute right-3 top-3 w-5 h-5 text-green-500" />
        )}
        {hasError && (
          <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-destructive" />
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
