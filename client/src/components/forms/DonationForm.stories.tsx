import { Meta, StoryObj } from '@storybook/react';
import { DonationForm } from './DonationForm';

const meta: Meta<typeof DonationForm> = {
  title: 'Forms/DonationForm',
  component: DonationForm,
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

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
