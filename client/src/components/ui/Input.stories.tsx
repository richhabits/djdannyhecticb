import { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Core input component for text entry with various states',
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'url', 'tel'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Username',
    defaultValue: 'djdannyhectic',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'your@email.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Password',
    defaultValue: 'secure123',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search tracks...',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter amount',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'This is disabled',
    disabled: true,
    defaultValue: 'Cannot edit',
  },
};

export const ReadOnly: Story = {
  args: {
    placeholder: 'Read only',
    readOnly: true,
    defaultValue: 'This is read-only',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-full max-w-md">
      <label className="text-sm font-medium text-white">Username</label>
      <Input placeholder="Enter username" />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="space-y-2 w-full max-w-md">
      <label className="text-sm font-medium text-white">Email</label>
      <Input
        placeholder="your@email.com"
        className="border-red-500 focus:ring-red-500"
      />
      <p className="text-xs text-red-500">Invalid email format</p>
    </div>
  ),
};

export const WithSuccess: Story = {
  render: () => (
    <div className="space-y-2 w-full max-w-md">
      <label className="text-sm font-medium text-white">Email</label>
      <Input
        placeholder="your@email.com"
        defaultValue="user@example.com"
        className="border-green-500 focus:ring-green-500"
      />
      <p className="text-xs text-green-500">Email verified</p>
    </div>
  ),
};

export const Large: Story = {
  args: {
    placeholder: 'Large input',
    className: 'h-12 text-lg',
  },
};

export const Compact: Story = {
  args: {
    placeholder: 'Compact input',
    className: 'h-8 text-sm',
  },
};
