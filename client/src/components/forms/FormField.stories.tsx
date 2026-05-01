import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FormField } from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'Forms/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      options: ['text', 'email', 'number', 'password', 'url'],
      control: { type: 'select' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default state
export const Default: Story = {
  args: {
    label: 'Full Name',
    name: 'name',
    placeholder: 'Enter your name',
  },
};

// Focused state
export const Focused: Story = {
  args: {
    label: 'Email Address',
    name: 'email',
    type: 'email',
    placeholder: 'you@example.com',
    value: 'user@example.com',
  },
};

// With value
export const WithValue: Story = {
  args: {
    label: 'Username',
    name: 'username',
    value: 'johndoe',
    placeholder: 'Enter username',
  },
};

// With hint
export const WithHint: Story = {
  args: {
    label: 'Password',
    name: 'password',
    type: 'password',
    placeholder: 'Enter password',
    hint: 'Must be at least 8 characters long',
  },
};

// Error state
export const WithError: Story = {
  args: {
    label: 'Email Address',
    name: 'email',
    type: 'email',
    placeholder: 'you@example.com',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
    touched: true,
  },
};

// Success state
export const WithSuccess: Story = {
  args: {
    label: 'Email Address',
    name: 'email',
    type: 'email',
    placeholder: 'you@example.com',
    value: 'valid@example.com',
    touched: true,
    success: true,
  },
};

// Required field
export const Required: Story = {
  args: {
    label: 'Full Name',
    name: 'name',
    placeholder: 'Enter your name',
    required: true,
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    label: 'Full Name',
    name: 'name',
    placeholder: 'Enter your name',
    value: 'John Doe',
    disabled: true,
  },
};

// Number input
export const NumberInput: Story = {
  args: {
    label: 'Age',
    name: 'age',
    type: 'number',
    placeholder: 'Enter your age',
    hint: 'Must be 18 or older',
  },
};

// Interactive state with validation
function InteractiveFieldWrapper() {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const error = touched && value && !validateEmail(value)
    ? 'Please enter a valid email address'
    : undefined;

  const success = touched && value && validateEmail(value);

  return (
    <FormField
      label="Email Address"
      name="email"
      type="email"
      placeholder="you@example.com"
      value={value}
      error={error}
      touched={touched}
      success={success}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => setTouched(true)}
    />
  );
}

export const Interactive: Story = {
  render: () => <InteractiveFieldWrapper />,
};

// All states showcased
export const AllStates: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-md">
      <div>
        <h3 className="text-sm font-semibold mb-4">Default</h3>
        <FormField
          label="Full Name"
          name="name"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4">With Value</h3>
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value="user@example.com"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4">Error State</h3>
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value="invalid"
          error="Invalid email format"
          touched={true}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4">Success State</h3>
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value="valid@example.com"
          success={true}
          touched={true}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4">Disabled State</h3>
        <FormField
          label="Full Name"
          name="name"
          placeholder="Enter your name"
          value="John Doe"
          disabled={true}
        />
      </div>
    </div>
  ),
};
