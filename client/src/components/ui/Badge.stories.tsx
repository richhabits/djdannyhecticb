import { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Small badge component for labeling and categorization',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Live: Story = {
  args: {
    children: '🔴 LIVE',
    variant: 'destructive',
  },
};

export const Featured: Story = {
  args: {
    children: '⭐ Featured',
    variant: 'secondary',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const WithEmojis: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="destructive">🔴 Live</Badge>
      <Badge variant="secondary">🥇 Gold Tier</Badge>
      <Badge>✅ Verified</Badge>
      <Badge variant="outline">🚀 New</Badge>
    </div>
  ),
};

export const StreamStatus: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span>Stream Status:</span>
        <Badge variant="destructive">LIVE</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Subscriber Tier:</span>
        <Badge variant="secondary">Gold</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Verification:</span>
        <Badge>Verified</Badge>
      </div>
    </div>
  ),
};
