import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TextAreaField } from './TextAreaField';

const meta: Meta<typeof TextAreaField> = {
  title: 'Forms/TextAreaField',
  component: TextAreaField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Message',
    name: 'message',
    placeholder: 'Enter your message here...',
    rows: 4,
  },
};

export const WithValue: Story = {
  args: {
    label: 'Message',
    name: 'message',
    placeholder: 'Enter your message here...',
    value: 'This is a sample message',
    rows: 4,
  },
};

export const WithHint: Story = {
  args: {
    label: 'Feedback',
    name: 'feedback',
    placeholder: 'Tell us what you think...',
    hint: 'Please provide constructive feedback',
    rows: 5,
  },
};

export const WithMaxLength: Story = {
  args: {
    label: 'Bio',
    name: 'bio',
    placeholder: 'Tell us about yourself...',
    maxLength: 200,
    rows: 4,
  },
};

export const WithError: Story = {
  args: {
    label: 'Message',
    name: 'message',
    placeholder: 'Enter your message here...',
    value: 'This message is too short',
    error: 'Message must be at least 10 characters',
    touched: true,
    rows: 4,
  },
};

export const WithSuccess: Story = {
  args: {
    label: 'Message',
    name: 'message',
    placeholder: 'Enter your message here...',
    value: 'This is a great message that passes validation!',
    success: true,
    touched: true,
    rows: 4,
  },
};

export const Required: Story = {
  args: {
    label: 'Message',
    name: 'message',
    placeholder: 'Enter your message here...',
    required: true,
    rows: 4,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Message',
    name: 'message',
    placeholder: 'Enter your message here...',
    value: 'This field is disabled',
    disabled: true,
    rows: 4,
  },
};

// Interactive with character counter
function InteractiveTextAreaWrapper() {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  const minLength = 10;
  const maxLength = 500;

  const error = touched && value && value.length < minLength
    ? `Message must be at least ${minLength} characters`
    : undefined;

  const success = touched && value && value.length >= minLength;

  return (
    <TextAreaField
      label="Message"
      name="message"
      placeholder="Enter your message here..."
      value={value}
      error={error}
      touched={touched}
      success={success}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => setTouched(true)}
      maxLength={maxLength}
      rows={5}
    />
  );
}

export const Interactive: Story = {
  render: () => <InteractiveTextAreaWrapper />,
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-md">
      <div>
        <h3 className="text-sm font-semibold mb-4">Default</h3>
        <TextAreaField
          label="Message"
          name="message"
          placeholder="Enter your message..."
          rows={3}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4">With Value</h3>
        <TextAreaField
          label="Message"
          name="message"
          placeholder="Enter your message..."
          value="This is a sample message"
          rows={3}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4">Error State</h3>
        <TextAreaField
          label="Message"
          name="message"
          placeholder="Enter your message..."
          value="Too short"
          error="Message must be at least 10 characters"
          touched={true}
          rows={3}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4">Success State</h3>
        <TextAreaField
          label="Message"
          name="message"
          placeholder="Enter your message..."
          value="This is a great message that passes validation!"
          success={true}
          touched={true}
          rows={3}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4">Disabled State</h3>
        <TextAreaField
          label="Message"
          name="message"
          placeholder="Enter your message..."
          value="This field is disabled"
          disabled={true}
          rows={3}
        />
      </div>
    </div>
  ),
};
