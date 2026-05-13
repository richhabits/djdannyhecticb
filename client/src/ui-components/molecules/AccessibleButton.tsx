import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Additional accessible label (will be used as aria-label if children is not a string)
   */
  ariaLabel?: string;

  /**
   * Icon to display (will have aria-hidden="true")
   */
  icon?: ReactNode;

  /**
   * Loading state (sets aria-busy and disables button)
   */
  loading?: boolean;

  /**
   * Children content
   */
  children?: ReactNode;
}

/**
 * AccessibleButton Component
 * WCAG 2.1 AA compliant button with proper focus management, keyboard support, and ARIA attributes
 */
export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    { ariaLabel, icon, loading = false, children, className = '', disabled = false, ...props },
    ref
  ) => {
    // Determine the accessible label
    const accessibleLabel =
      ariaLabel || (typeof children === 'string' ? children : undefined);

    return (
      <button
        ref={ref}
        aria-label={accessibleLabel}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          px-4 py-2 rounded-none
          font-semibold text-sm
          transition-all duration-200
          focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-orange
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:enabled:opacity-90
          active:enabled:scale-95
          ${className}
        `}
        {...props}
      >
        {icon && (
          <span aria-hidden="true" className="flex items-center justify-center">
            {icon}
          </span>
        )}
        {children && <span>{children}</span>}
        {loading && (
          <span
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';
