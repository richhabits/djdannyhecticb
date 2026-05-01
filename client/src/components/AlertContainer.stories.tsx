import { Meta, StoryObj } from '@storybook/react';
import { AlertContainer } from './AlertContainer';
import { Alert } from '@/hooks/useAlertQueue';

const meta: Meta<typeof AlertContainer> = {
  title: 'Alerts/AlertContainer',
  component: AlertContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Container for managing and displaying multiple streaming alerts with stacking and queue indicators',
      },
    },
  },
  argTypes: {
    onDismiss: { action: 'dismissed' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockRaidAlert: Alert = {
  id: '1',
  type: 'raid',
  title: 'Raid',
  message: 'Streamer raided',
  data: { username: 'PopularStreamer', raidCount: 500 },
};

const mockSubscribeAlert: Alert = {
  id: '2',
  type: 'subscribe',
  title: 'Subscribe',
  message: 'User subscribed',
  data: { username: 'NewSub', tier: 'gold', months: 1, message: 'Love it!' },
};

const mockDonationAlert: Alert = {
  id: '3',
  type: 'donation',
  title: 'Donation',
  message: 'Donation received',
  data: { username: 'Donor', amount: 50, message: 'Keep it up!' },
};

const mockFollowAlert: Alert = {
  id: '4',
  type: 'follow',
  title: 'Follow',
  message: 'New follower',
  data: { username: 'NewFollower' },
};

const mockSuccessAlert: Alert = {
  id: '5',
  type: 'success',
  title: 'Success',
  message: 'Stream started successfully',
  data: {},
};

const mockErrorAlert: Alert = {
  id: '6',
  type: 'error',
  title: 'Error',
  message: 'Connection issue detected',
  data: { error: 'Network timeout' },
};

export const SingleAlert: Story = {
  args: {
    alerts: [mockRaidAlert],
    onDismiss: () => {},
  },
};

export const TwoAlerts: Story = {
  args: {
    alerts: [mockRaidAlert, mockSubscribeAlert],
    onDismiss: () => {},
  },
};

export const ThreeAlerts: Story = {
  args: {
    alerts: [mockRaidAlert, mockSubscribeAlert, mockDonationAlert],
    onDismiss: () => {},
  },
};

export const QueuedAlerts: Story = {
  args: {
    alerts: [
      mockRaidAlert,
      mockSubscribeAlert,
      mockDonationAlert,
      mockFollowAlert,
      mockSuccessAlert,
      mockErrorAlert,
    ],
    onDismiss: () => {},
  },
};

export const ManyQueuedAlerts: Story = {
  args: {
    alerts: [
      mockRaidAlert,
      mockSubscribeAlert,
      mockDonationAlert,
      mockFollowAlert,
      mockSuccessAlert,
      mockErrorAlert,
      {
        ...mockDonationAlert,
        id: '7',
        data: { username: 'Donor2', amount: 25 },
      },
      {
        ...mockSubscribeAlert,
        id: '8',
        data: { username: 'NewSub2', tier: 'silver', months: 2 },
      },
    ],
    onDismiss: () => {},
  },
};

export const AllAlertTypes: Story = {
  args: {
    alerts: [mockRaidAlert, mockSubscribeAlert, mockDonationAlert],
    onDismiss: () => {},
  },
};

export const ErrorAndSuccess: Story = {
  args: {
    alerts: [mockErrorAlert, mockSuccessAlert],
    onDismiss: () => {},
  },
};
