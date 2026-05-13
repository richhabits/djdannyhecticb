import React, { InputHTMLAttributes, ReactNode } from 'react';
import { generateId } from '@/utils/a11y';

interface AccessibleInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text (required for accessibility)
   */
  label: string;

  /**
   * Error message to display
   */
  error?: string | ReactNode;

  /**
   * Helper/hint text below input
   */
  hint?: string | ReactNode;

  /**
   * Show as required field
   */
  required?: boolean;

  /**
   * Custom icon/element to display in label
   */
  icon?: ReactNode;
}

/**
 * AccessibleInput Component
 * WCAG 2.1 AA compliant input field with proper label association, error messaging, and focus management
 */
export const AccessibleInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(
  (
    { label, error, hint, required = false, icon, id, className = '', ...props },
    ref
  ) => {
    // Generate unique ID if not provided
    const inputId = id || generateId('input');
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    // Build aria-describedby based on what's present
    const ariaDescribedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ');

    return (
      <div className="flex flex-col gap-2">
        {/* Label */}
        <label htmlFor={inputId} className="flex items-center gap-2 text-sm font-semibold">
          {icon && <span aria-hidden="true">{icon}</span>}
          <span>
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </span>
        </label>

        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={ariaDescribedBy || undefined}
          aria-invalid={error ? 'true' : 'false'}
          required={required}
          className={`
            px-3 py-2 rounded-none
            bg-black border-2 border-white
            text-white placeholder-gray-500
            transition-colors duration-200
            focus-visible:outline-none focus-visible:border-accent-orange
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 bg-red-500/5' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Hint Text */}
        {hint && (
          <p id={hintId} className="text-xs text-gray-400">
            {hint}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p id={errorId} className="text-xs text-red-500 font-semibold" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';
