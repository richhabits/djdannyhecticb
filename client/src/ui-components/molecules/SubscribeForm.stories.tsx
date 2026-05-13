import { Meta, StoryObj } from '@storybook/react';
import { SubscribeForm } from './SubscribeForm';

const meta: Meta<typeof SubscribeForm> = {
  title: 'Forms/SubscribeForm',
  component: SubscribeForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

export const Inline: Story = {
  parameters: {
    layout: 'centered',
  },
};
