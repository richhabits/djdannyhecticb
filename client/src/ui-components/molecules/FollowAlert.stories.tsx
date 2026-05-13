import { Meta, StoryObj } from '@storybook/react';
import FollowAlert from './FollowAlert';
import { Alert } from '@/hooks/useAlertQueue';

const meta: Meta<typeof FollowAlert> = {
  title: 'Alerts/FollowAlert',
  component: FollowAlert,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays follow notifications with streamer username',
      },
    },
  },
  argTypes: {
    onDismiss: { action: 'dismissed' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NewFollower: Story = {
  args: {
    alert: {
      id: '1',
      type: 'follow',
      title: 'Follow',
      message: 'User followed',
      data: { username: 'NewFollower' },
    } as Alert,
    onDismiss: () => {},
  },
};

export const PopularUser: Story = {
  args: {
    alert: {
      id: '2',
      type: 'follow',
      title: 'Follow',
      message: 'PopularUser followed',
      data: { username: 'PopularUser' },
    } as Alert,
    onDismiss: () => {},
  },
};

export const LongUsername: Story = {
  args: {
    alert: {
      id: '3',
      type: 'follow',
      title: 'Follow',
      message: 'VeryLongUsernameWithManyCharacters followed',
      data: { username: 'VeryLongUsernameWithManyCharacters' },
    } as Alert,
    onDismiss: () => {},
  },
};

export const SimpleUsername: Story = {
  args: {
    alert: {
      id: '4',
      type: 'follow',
      title: 'Follow',
      message: 'Fan followed',
      data: { username: 'Fan' },
    } as Alert,
    onDismiss: () => {},
  },
};

export const WithSpecialChars: Story = {
  args: {
    alert: {
      id: '5',
      type: 'follow',
      title: 'Follow',
      message: 'User_123 followed',
      data: { username: 'User_123' },
    } as Alert,
    onDismiss: () => {},
  },
};
