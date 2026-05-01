/**
 * StateInput Component
 * Input field with built-in error, loading, and validation states
 */

import React, { ReactNode } from 'react';

interface StateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  helpText?: string;
  icon?: ReactNode;
  className?: string;
  containerClassName?: string;
}

export function StateInput({
  label,
  error,
  isLoading = false,
  isSuccess = false,
  helpText,
  icon,
  className = '',
  containerClassName = '',
  ...props
}: StateInputProps) {
  return (
    <div className={`flex flex-col gap-sm ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-accent-danger ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          className={`
            w-full px-md py-sm rounded-md
            bg-dark-surface border-2 border-border-primary
            text-text-primary placeholder-text-tertiary
            transition-colors duration-base
            focus-visible:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-accent-danger' : isSuccess ? 'border-accent-success' : ''}
            ${isLoading ? 'border-accent-primary' : ''}
            ${className}
          `}
          disabled={isLoading}
          {...props}
        />

        {icon && (
          <div className="absolute right-md text-text-secondary pointer-events-none">
            {icon}
          </div>
        )}

        {isLoading && (
          <div className="absolute right-md text-accent-primary animate-spin">⏳</div>
        )}
        {isSuccess && !isLoading && (
          <div className="absolute right-md text-accent-success">✓</div>
        )}
        {error && !isLoading && (
          <div className="absolute right-md text-accent-danger">⚠️</div>
        )}
      </div>

      {error && (
        <p className="text-xs text-accent-danger animate-fade-in-scale">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-xs text-text-tertiary">{helpText}</p>
      )}
    </div>
  );
}

/**
 * Textarea with state
 */
interface StateTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  helpText?: string;
  containerClassName?: string;
  charLimit?: number;
}

export function StateTextarea({
  label,
  error,
  isLoading = false,
  isSuccess = false,
  helpText,
  containerClassName = '',
  charLimit,
  value = '',
  ...props
}: StateTextareaProps) {
  const charCount = String(value).length;
  const isNearLimit = charLimit && charCount >= charLimit * 0.9;

  return (
    <div className={`flex flex-col gap-sm ${containerClassName}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-text-primary">
            {label}
            {props.required && <span className="text-accent-danger ml-1">*</span>}
          </label>
          {charLimit && (
            <span
              className={`text-xs ${
                isNearLimit ? 'text-accent-warning' : 'text-text-tertiary'
              }`}
            >
              {charCount} / {charLimit}
            </span>
          )}
        </div>
      )}

      <textarea
        className={`
          w-full px-md py-sm rounded-md
          bg-dark-surface border-2 border-border-primary
          text-text-primary placeholder-text-tertiary
          transition-colors duration-base
          focus-visible:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-none
          ${error ? 'border-accent-danger' : isSuccess ? 'border-accent-success' : ''}
          ${isLoading ? 'border-accent-primary' : ''}
          ${isNearLimit ? 'border-accent-warning' : ''}
        `}
        disabled={isLoading}
        value={value}
        maxLength={charLimit}
        {...props}
      />

      {error && (
        <p className="text-xs text-accent-danger animate-fade-in-scale">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-xs text-text-tertiary">{helpText}</p>
      )}
    </div>
  );
}

/**
 * Select with state
 */
interface SelectOption {
  value: string;
  label: string;
}

interface StateSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  helpText?: string;
  containerClassName?: string;
  placeholder?: string;
}

export function StateSelect({
  label,
  options,
  error,
  isLoading = false,
  isSuccess = false,
  helpText,
  containerClassName = '',
  placeholder,
  ...props
}: StateSelectProps) {
  return (
    <div className={`flex flex-col gap-sm ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-accent-danger ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          className={`
            w-full px-md py-sm rounded-md
            bg-dark-surface border-2 border-border-primary
            text-text-primary
            transition-colors duration-base
            focus-visible:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none
            ${error ? 'border-accent-danger' : isSuccess ? 'border-accent-success' : ''}
            ${isLoading ? 'border-accent-primary' : ''}
          `}
          disabled={isLoading}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-md top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path
              d="M1 1L6 6L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p className="text-xs text-accent-danger animate-fade-in-scale">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-xs text-text-tertiary">{helpText}</p>
      )}
    </div>
  );
}

/**
 * Checkbox with state
 */
interface StateCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  containerClassName?: string;
}

export function StateCheckbox({
  label,
  error,
  helpText,
  containerClassName = '',
  ...props
}: StateCheckboxProps) {
  return (
    <div className={`flex flex-col gap-sm ${containerClassName}`}>
      <div className="flex items-center gap-sm">
        <input
          type="checkbox"
          className={`
            w-4 h-4 rounded
            bg-dark-surface border-2 border-border-primary
            text-accent-primary
            transition-colors duration-base
            focus-visible:outline-none
            cursor-pointer
            ${error ? 'border-accent-danger' : ''}
          `}
          {...props}
        />
        {label && (
          <label className="text-sm text-text-primary cursor-pointer">{label}</label>
        )}
      </div>

      {error && (
        <p className="text-xs text-accent-danger animate-fade-in-scale">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-xs text-text-tertiary">{helpText}</p>
      )}
    </div>
  );
}
