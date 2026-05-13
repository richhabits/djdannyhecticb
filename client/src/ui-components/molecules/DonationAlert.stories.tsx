import { Meta, StoryObj } from '@storybook/react';
import DonationAlert from './DonationAlert';
import { Alert } from '@/hooks/useAlertQueue';

const meta: Meta<typeof DonationAlert> = {
  title: 'Alerts/DonationAlert',
  component: DonationAlert,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays donation/tip notifications with amount and optional message',
      },
    },
  },
  argTypes: {
    onDismiss: { action: 'dismissed' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SmallDonation: Story = {
  args: {
    alert: {
      id: '1',
      type: 'donation',
      title: 'Donation',
      message: 'GenerousDonor donated',
      data: {
        username: 'GenerousDonor',
        amount: 5,
        message: 'Love your streams!',
      },
    } as Alert,
    onDismiss: () => {},
  },
};

export const MediumDonation: Story = {
  args: {
    alert: {
      id: '2',
      type: 'donation',
      title: 'Donation',
      message: 'BigSpender donated',
      data: {
        username: 'BigSpender',
        amount: 50,
        message: 'Keep the vibes going!',
      },
    } as Alert,
    onDismiss: () => {},
  },
};

export const LargeDonation: Story = {
  args: {
    alert: {
      id: '3',
      type: 'donation',
      title: 'Donation',
      message: 'Whale donated',
      data: {
        username: 'Whale',
        amount: 500,
        message: '🚀',
      },
    } as Alert,
    onDismiss: () => {},
  },
};

export const MassiveDonation: Story = {
  args: {
    alert: {
      id: '4',
      type: 'donation',
      title: 'Donation',
      message: 'Legendary supporter donated',
      data: {
        username: 'LegendarySupporter',
        amount: 1000,
        message: 'This is for the legends!',
      },
    } as Alert,
    onDismiss: () => {},
  },
};

export const WithoutMessage: Story = {
  args: {
    alert: {
      id: '5',
      type: 'donation',
      title: 'Donation',
      message: 'SilentDonor donated',
      data: {
        username: 'SilentDonor',
        amount: 25,
      },
    } as Alert,
    onDismiss: () => {},
  },
};

export const DecimalAmount: Story = {
  args: {
    alert: {
      id: '6',
      type: 'donation',
      title: 'Donation',
      message: 'PreciseDonor donated',
      data: {
        username: 'PreciseDonor',
        amount: 33.33,
        message: 'For the culture!',
      },
    } as Alert,
    onDismiss: () => {},
  },
};
