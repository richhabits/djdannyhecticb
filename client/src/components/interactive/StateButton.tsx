/**
 * StateButton Component
 * Button with built-in loading, error, and success states
 */

import React, { ReactNode } from 'react';

interface StateButtonProps {
  children: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loadingText?: string;
  errorText?: string;
  successText?: string;
  icon?: ReactNode;
}

export function StateButton({
  children,
  isLoading = false,
  isError = false,
  isSuccess = false,
  onClick,
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md',
  loadingText = 'Loading...',
  errorText = 'Error',
  successText = 'Success',
  icon,
}: StateButtonProps) {
  const variantClasses = {
    primary: 'bg-accent-primary hover:bg-accent-primary-hover text-white',
    secondary: 'bg-dark-surface hover:bg-dark-tertiary border border-border-primary',
    danger: 'bg-accent-danger hover:bg-accent-danger-hover text-white',
  };

  const sizeClasses = {
    sm: 'px-md py-sm text-sm',
    md: 'px-lg py-md text-base',
    lg: 'px-xl py-lg text-lg',
  };

  const isDisabled = isLoading || isError || disabled;

  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-md font-semibold
        transition-all duration-base
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary
        flex items-center justify-center gap-sm
        ${className}
      `}
      onClick={onClick}
      disabled={isDisabled}
    >
      {isLoading && <span className="animate-spin">⏳</span>}
      {isError && <span className="text-accent-danger">⚠️</span>}
      {isSuccess && <span className="text-accent-success">✓</span>}
      {icon && !isLoading && !isError && !isSuccess && icon}

      <span>
        {isLoading ? loadingText : isError ? errorText : isSuccess ? successText : children}
      </span>
    </button>
  );
}

/**
 * Floating Action Button
 */
interface FloatingActionButtonProps {
  icon: ReactNode;
  onClick: () => void;
  label?: string;
  isLoading?: boolean;
  className?: string;
}

export function FloatingActionButton({
  icon,
  onClick,
  label,
  isLoading = false,
  className = '',
}: FloatingActionButtonProps) {
  return (
    <button
      className={`
        fixed bottom-lg right-lg
        w-14 h-14
        rounded-full
        bg-accent-primary hover:bg-accent-primary-hover
        text-white
        shadow-lg hover-lift
        flex items-center justify-center
        transition-all duration-base
        focus-visible:outline-2 focus-visible:outline-offset-2
        ${className}
      `}
      onClick={onClick}
      disabled={isLoading}
      title={label}
    >
      {isLoading ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <span className="text-xl">{icon}</span>
      )}
    </button>
  );
}

/**
 * Button Group with state management
 */
interface ButtonGroupOption {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
}

interface ButtonGroupProps {
  options: ButtonGroupOption[];
  selectedId?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function ButtonGroup({ options, selectedId, onChange, className = '' }: ButtonGroupProps) {
  return (
    <div className={`flex gap-sm rounded-md bg-dark-surface p-sm ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          className={`
            flex-1 px-md py-sm rounded transition-all duration-base
            flex items-center justify-center gap-sm
            ${
              selectedId === option.id
                ? 'bg-accent-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }
          `}
          onClick={() => onChange?.(option.id)}
        >
          {option.icon && <span>{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
}
