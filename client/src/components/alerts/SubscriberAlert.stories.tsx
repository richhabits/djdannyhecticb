import { Meta, StoryObj } from '@storybook/react';
import SubscriberAlert from './SubscriberAlert';
import { Alert } from '@/hooks/useAlertQueue';

const meta: Meta<typeof SubscriberAlert> = {
  title: 'Alerts/SubscriberAlert',
  component: SubscriberAlert,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays new subscriber notifications with tier levels (Bronze, Silver, Gold, Platinum)',
      },
    },
  },
  argTypes: {
    onDismiss: { action: 'dismissed' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BronzeTier: Story = {
  args: {
    alert: {
      id: '1',
      type: 'subscribe',
      title: 'Subscribe',
      message: 'NewSubscriber subscribed',
      data: {
        username: 'NewSubscriber',
        tier: 'bronze',
        months: 1,
        message: 'Love the streams!',
      },
    } as Alert,
    onDismiss: () => {},
  },
};

export const SilverTier: Story = {
  args: {
    alert: {
      id: '2',
      type: 'subscribe',
      title: 'Subscribe',
      message: 'RegularViewer subscribed',
      data: {
        username: 'RegularViewer',
        tier: 'silver',
        months: 3,
        message: 'Keep it up!',
      },
    } as Alert,
    onDismiss: () => {},
  },
};

export const GoldTier: Story = {
  args: {
    alert: {
      id: '3',
      type: 'subscribe',
      title: 'Subscribe',
      message: 'VIPFan subscribed',
      data: {
        username: 'VIPFan',
        tier: 'gold',
        months: 6,
        message: '🔥',
      },
    } as Alert,
    onDismiss: () => {},
  },
};

export const PlatinumTier: Story = {
  args: {
    alert: {
      id: '4',
      type: 'subscribe',
      title: 'Subscribe',
      message: 'SuperFan subscribed',
      data: {
        username: 'SuperFan',
        tier: 'platinum',
        months: 12,
        message: 'Supporting you all year!',
      },
    } as Alert,
    onDismiss: () => {},
  },
};

export const WithoutMessage: Story = {
  args: {
    alert: {
      id: '5',
      type: 'subscribe',
      title: 'Subscribe',
      message: 'SilentSubscriber subscribed',
      data: {
        username: 'SilentSubscriber',
        tier: 'gold',
        months: 1,
      },
    } as Alert,
    onDismiss: () => {},
  },
};

export const MultiMonthSubscriber: Story = {
  args: {
    alert: {
      id: '6',
      type: 'subscribe',
      title: 'Subscribe',
      message: 'LongTimeSupporter renewed',
      data: {
        username: 'LongTimeSupporter',
        tier: 'platinum',
        months: 24,
        message: 'Two years strong!',
      },
    } as Alert,
    onDismiss: () => {},
  },
};
