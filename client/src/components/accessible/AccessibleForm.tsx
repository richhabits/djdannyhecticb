import React, { FormHTMLAttributes, ReactNode } from 'react';

interface AccessibleFormProps extends FormHTMLAttributes<HTMLFormElement> {
  /**
   * Form title (displayed and announced)
   */
  title?: string;

  /**
   * Form description/instructions
   */
  description?: ReactNode;

  /**
   * Form children/fields
   */
  children: ReactNode;

  /**
   * Error banner to display at top of form
   */
  formError?: string;
}

/**
 * AccessibleForm Component
 * Wraps form elements with proper semantics, error handling, and screen reader support
 */
export const AccessibleForm = React.forwardRef<HTMLFormElement, AccessibleFormProps>(
  ({ title, description, children, formError, className = '', ...props }, ref) => {
    return (
      <form ref={ref} className={`flex flex-col gap-4 ${className}`} {...props}>
        {/* Form Title */}
        {title && (
          <h2 className="text-lg font-bold uppercase">{title}</h2>
        )}

        {/* Form Description */}
        {description && (
          <p className="text-sm text-gray-400">{description}</p>
        )}

        {/* Form Error Banner */}
        {formError && (
          <div
            className="p-3 rounded-none bg-red-500/10 border-2 border-red-500 text-red-500 text-sm font-semibold"
            role="alert"
          >
            {formError}
          </div>
        )}

        {/* Form Fields */}
        <fieldset className="flex flex-col gap-4">
          {children}
        </fieldset>
      </form>
    );
  }
);

AccessibleForm.displayName = 'AccessibleForm';

/**
 * FormFieldGroup Component
 * Groups related form fields with optional legend
 */
interface FormFieldGroupProps {
  legend?: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const FormFieldGroup: React.FC<FormFieldGroupProps> = ({
  legend,
  description,
  children,
  className = '',
}) => {
  return (
    <fieldset className={`flex flex-col gap-3 ${className}`}>
      {legend && (
        <div>
          <legend className="text-sm font-semibold">{legend}</legend>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
};

FormFieldGroup.displayName = 'FormFieldGroup';
