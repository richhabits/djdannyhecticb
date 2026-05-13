import React from 'react';
import { AlertCircle, Check, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormMessageProps {
  type: 'error' | 'success' | 'warning' | 'info' | 'loading';
  title: string;
  description?: string;
  errors?: Record<string, string>;
  onDismiss?: () => void;
}

export function FormMessage({
  type,
  title,
  description,
  errors,
  onDismiss,
}: FormMessageProps) {
  const icons = {
    error: AlertCircle,
    success: Check,
    warning: AlertCircle,
    info: AlertCircle,
    loading: Loader,
  };

  const colors = {
    error: 'bg-destructive/10 border-destructive/50 text-destructive',
    success: 'bg-green-500/10 border-green-500/50 text-green-600',
    warning: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-600',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-600',
    loading: 'bg-primary/10 border-primary/50 text-primary',
  };

  const IconComponent = icons[type];

  return (
    <div
      className={cn(
        'p-4 rounded-lg border flex items-start gap-3',
        colors[type]
      )}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <IconComponent
        className={cn(
          'w-5 h-5 flex-shrink-0 mt-0.5',
          type === 'loading' && 'animate-spin'
        )}
      />

      <div className="flex-1">
        <p className="font-semibold text-sm">{title}</p>

        {description && (
          <p className="text-sm mt-1 opacity-90">{description}</p>
        )}

        {errors && Object.keys(errors).length > 0 && (
          <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field} className="opacity-90">
                {message}
              </li>
            ))}
          </ul>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Dismiss message"
        >
          ✕
        </button>
      )}
    </div>
  );
}
