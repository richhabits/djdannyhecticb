import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

/**
 * Button component for user interactions
 * Supports multiple variants, sizes, and states
 */
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger' | 'tertiary';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
  }
>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'font-medium transition-colors duration-base rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-red disabled:opacity-disabled disabled:cursor-not-allowed';

    const variantClasses = {
      primary:
        'bg-accent-red text-text-primary hover:bg-accent-red-hover active:bg-accent-red-dark',
      secondary:
        'bg-dark-border text-text-primary hover:bg-dark-border active:bg-dark-surface border border-dark-border',
      danger:
        'bg-accent-danger text-text-primary hover:bg-accent-danger-hover active:bg-accent-danger',
      tertiary:
        'text-accent-red hover:text-accent-red-hover active:text-accent-red-dark',
    };

    const sizeClasses = {
      sm: 'px-md py-xs text-caption h-10',
      md: 'px-md py-sm text-body h-11',
      lg: 'px-lg py-sm text-body h-12',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${widthClass}
          ${className || ''}
        `}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-sm">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'tertiary'],
      description: 'Button visual variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch button to full width',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Primary call-to-action button for main user interactions. Supports multiple variants (primary, secondary, danger, tertiary), sizes (sm, md, lg), and states (default, hover, disabled, loading). Always use semantic button element for keyboard accessibility.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
    size: 'md',
  },
};

// Primary button variants
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    children: 'Delete',
    variant: 'danger',
  },
};

export const Tertiary: Story = {
  args: {
    children: 'Tertiary Button',
    variant: 'tertiary',
  },
};

// Size variants
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

// State stories
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Submit',
    isLoading: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
};

// Interactive story showing all states
export const AllStates: Story = {
  render: () => (
    <div className="space-y-md">
      <div>
        <h3 className="text-h3 font-semibold mb-md">Variants</h3>
        <div className="flex gap-md flex-wrap">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="tertiary">Tertiary</Button>
        </div>
      </div>

      <div>
        <h3 className="text-h3 font-semibold mb-md">Sizes</h3>
        <div className="flex gap-md items-center flex-wrap">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      <div>
        <h3 className="text-h3 font-semibold mb-md">States</h3>
        <div className="flex gap-md flex-wrap">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button isLoading>Loading</Button>
        </div>
      </div>

      <div>
        <h3 className="text-h3 font-semibold mb-md">Full Width</h3>
        <Button fullWidth>Full Width Button</Button>
      </div>
    </div>
  ),
};

// Icon button example (accessibility important)
export const IconButton: Story = {
  render: () => (
    <div className="space-y-md">
      <p className="text-caption text-text-secondary">
        Icon buttons must have aria-label for accessibility
      </p>
      <div className="flex gap-md">
        <button
          aria-label="Close dialog"
          className="w-11 h-11 rounded-md bg-dark-border hover:bg-dark-border text-text-primary flex items-center justify-center focus-visible:outline-2 focus-visible:outline-accent-red"
        >
          ✕
        </button>
        <button
          aria-label="Settings"
          className="w-11 h-11 rounded-md bg-dark-border hover:bg-dark-border text-text-primary flex items-center justify-center focus-visible:outline-2 focus-visible:outline-accent-red"
        >
          ⚙️
        </button>
        <button
          aria-label="Menu"
          className="w-11 h-11 rounded-md bg-dark-border hover:bg-dark-border text-text-primary flex items-center justify-center focus-visible:outline-2 focus-visible:outline-accent-red"
        >
          ☰
        </button>
      </div>
    </div>
  ),
};

// Accessibility notes
export const Accessibility: Story = {
  render: () => (
    <div className="space-y-lg">
      <div className="bg-dark-surface p-lg rounded-lg border border-dark-border space-y-md">
        <h3 className="text-h3 font-semibold">Keyboard Navigation</h3>
        <ul className="space-y-sm text-body">
          <li>• <strong>Tab:</strong> Navigate to button</li>
          <li>• <strong>Enter/Space:</strong> Activate button</li>
          <li>• <strong>Focus Ring:</strong> 2px red outline with 2px offset</li>
        </ul>
      </div>

      <div className="bg-dark-surface p-lg rounded-lg border border-dark-border space-y-md">
        <h3 className="text-h3 font-semibold">Screen Reader</h3>
        <ul className="space-y-sm text-body">
          <li>• All buttons have meaningful text</li>
          <li>• Icon buttons have aria-label</li>
          <li>• Disabled state announced automatically</li>
        </ul>
      </div>

      <div className="bg-dark-surface p-lg rounded-lg border border-dark-border space-y-md">
        <h3 className="text-h3 font-semibold">Visual</h3>
        <ul className="space-y-sm text-body">
          <li>• 4.5:1 contrast ratio (red on black)</li>
          <li>• Clear hover state visual feedback</li>
          <li>• Minimum 44x44px touch target</li>
          <li>• Visible disabled state</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'button-name',
            enabled: true,
          },
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};

// Usage example with error handling
export const FormSubmit: Story = {
  render: () => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [success, setSuccess] = React.useState(false);

    const handleSubmit = async () => {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    };

    return (
      <div className="space-y-md">
        <Button isLoading={isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? 'Submitting...' : 'Submit Form'}
        </Button>
        {success && (
          <div className="text-accent-success text-body">
            ✓ Form submitted successfully!
          </div>
        )}
      </div>
    );
  },
};
