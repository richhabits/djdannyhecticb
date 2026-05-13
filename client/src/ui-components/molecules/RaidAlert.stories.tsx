import { Meta, StoryObj } from '@storybook/react';
import RaidAlert from './RaidAlert';
import { Alert } from '@/hooks/useAlertQueue';

const meta: Meta<typeof RaidAlert> = {
  title: 'Alerts/RaidAlert',
  component: RaidAlert,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays raid notifications with viewer count and streamer name',
      },
    },
  },
  argTypes: {
    onDismiss: { action: 'dismissed' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SmallRaid: Story = {
  args: {
    alert: {
      id: '1',
      type: 'raid',
      title: 'Raid',
      message: 'SmallStreamer raided',
      data: { username: 'SmallStreamer', raidCount: 50 },
    } as Alert,
    onDismiss: () => {},
  },
};

export const MediumRaid: Story = {
  args: {
    alert: {
      id: '2',
      type: 'raid',
      title: 'Raid',
      message: 'PopularStreamer raided',
      data: { username: 'PopularStreamer', raidCount: 500 },
    } as Alert,
    onDismiss: () => {},
  },
};

export const MassiveRaid: Story = {
  args: {
    alert: {
      id: '3',
      type: 'raid',
      title: 'Raid',
      message: 'MassiveStreamer raided',
      data: { username: 'MassiveStreamer', raidCount: 5000 },
    } as Alert,
    onDismiss: () => {},
  },
};

export const SingleViewer: Story = {
  args: {
    alert: {
      id: '4',
      type: 'raid',
      title: 'Raid',
      message: 'SoloStreamer raided',
      data: { username: 'SoloStreamer', raidCount: 1 },
    } as Alert,
    onDismiss: () => {},
  },
};

export const LongUsername: Story = {
  args: {
    alert: {
      id: '5',
      type: 'raid',
      title: 'Raid',
      message: 'VeryLongStreamernameHere raided',
      data: { username: 'VeryLongStreamernameHere', raidCount: 250 },
    } as Alert,
    onDismiss: () => {},
  },
};
