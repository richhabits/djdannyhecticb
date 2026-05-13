import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FormMessage } from './FormMessage';

const meta: Meta<typeof FormMessage> = {
  title: 'Forms/FormMessage',
  component: FormMessage,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {
  args: {
    type: 'error',
    title: 'Form submission failed',
    description: 'There were errors in your form. Please check and try again.',
  },
};

export const ErrorWithList: Story = {
  args: {
    type: 'error',
    title: 'Please fix the errors below',
    errors: {
      email: 'Invalid email format',
      password: 'Password must be at least 8 characters',
      name: 'Name is required',
    },
  },
};

export const Success: Story = {
  args: {
    type: 'success',
    title: 'Form submitted successfully!',
    description: 'Your information has been saved.',
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    title: 'Warning',
    description: 'This action cannot be undone. Please proceed with caution.',
  },
};

export const Info: Story = {
  args: {
    type: 'info',
    title: 'Information',
    description: 'Your profile has been updated. Changes may take a few moments to appear.',
  },
};

export const Loading: Story = {
  args: {
    type: 'loading',
    title: 'Processing your request...',
    description: 'Please wait while we process your form.',
  },
};

// Dismissible message
function DismissibleMessageWrapper() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return <p className="text-sm text-muted-foreground">Message dismissed</p>;
  }

  return (
    <FormMessage
      type="success"
      title="Success!"
      description="Your action was completed successfully."
      onDismiss={() => setVisible(false)}
    />
  );
}

export const Dismissible: Story = {
  render: () => <DismissibleMessageWrapper />,
};

// All message types
export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div>
        <h3 className="text-sm font-semibold mb-2">Error</h3>
        <FormMessage
          type="error"
          title="Form submission failed"
          description="There were errors in your form."
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Success</h3>
        <FormMessage
          type="success"
          title="Form submitted successfully!"
          description="Your information has been saved."
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Warning</h3>
        <FormMessage
          type="warning"
          title="Warning"
          description="This action cannot be undone."
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Info</h3>
        <FormMessage
          type="info"
          title="Information"
          description="Your profile has been updated."
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Loading</h3>
        <FormMessage
          type="loading"
          title="Processing your request..."
          description="Please wait while we process your form."
        />
      </div>
    </div>
  ),
};

export const ErrorWithMultipleErrors: Story = {
  args: {
    type: 'error',
    title: 'Validation errors',
    errors: {
      username: 'Username is required',
      email: 'Please enter a valid email',
      password: 'Password must be at least 8 characters',
      phone: 'Phone number is invalid',
    },
  },
};
