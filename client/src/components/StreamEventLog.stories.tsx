import { Meta, StoryObj } from '@storybook/react';
import { StreamEventLog } from './StreamEventLog';

const meta: Meta<typeof StreamEventLog> = {
  title: 'Streaming/StreamEventLog',
  component: StreamEventLog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Real-time activity feed showing follows, subscriptions, donations, and raids',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    events: [
      { id: '1', type: 'follow', username: 'CoolDude42', timestamp: new Date(Date.now() - 30000) },
      { id: '2', type: 'subscribe', username: 'VibeChecker', timestamp: new Date(Date.now() - 60000) },
      { id: '3', type: 'donation', username: 'TopSupporter', timestamp: new Date(Date.now() - 90000), amount: 25 },
      { id: '4', type: 'raid', username: 'RadStreamer', timestamp: new Date(Date.now() - 120000), details: 'Raided with 500 viewers' },
    ],
    maxVisible: 5,
  },
};

export const RecentActivity: Story = {
  args: {
    events: [
      { id: '1', type: 'raid', username: 'PopularStreamer', timestamp: new Date(Date.now() - 5000), details: 'Raided with 1000 viewers' },
      { id: '2', type: 'donation', username: 'GenerousViewer', timestamp: new Date(Date.now() - 15000), amount: 100 },
      { id: '3', type: 'subscribe', username: 'NewMember', timestamp: new Date(Date.now() - 25000) },
      { id: '4', type: 'follow', username: 'CasualWatcher', timestamp: new Date(Date.now() - 35000) },
    ],
  },
};

export const HighActivity: Story = {
  args: {
    events: [
      { id: '1', type: 'follow', username: 'User1', timestamp: new Date(Date.now() - 5000) },
      { id: '2', type: 'follow', username: 'User2', timestamp: new Date(Date.now() - 10000) },
      { id: '3', type: 'subscribe', username: 'Subscriber1', timestamp: new Date(Date.now() - 15000) },
      { id: '4', type: 'donation', username: 'Donor1', timestamp: new Date(Date.now() - 20000), amount: 50 },
      { id: '5', type: 'donation', username: 'Donor2', timestamp: new Date(Date.now() - 25000), amount: 25 },
      { id: '6', type: 'raid', username: 'Raider1', timestamp: new Date(Date.now() - 30000), details: 'Raided with 250 viewers' },
      { id: '7', type: 'follow', username: 'User3', timestamp: new Date(Date.now() - 35000) },
      { id: '8', type: 'subscribe', username: 'Subscriber2', timestamp: new Date(Date.now() - 40000) },
    ],
    maxVisible: 10,
  },
};

export const DonationsOnly: Story = {
  args: {
    events: [
      { id: '1', type: 'donation', username: 'Generous1', timestamp: new Date(Date.now() - 10000), amount: 500 },
      { id: '2', type: 'donation', username: 'Generous2', timestamp: new Date(Date.now() - 20000), amount: 100 },
      { id: '3', type: 'donation', username: 'Generous3', timestamp: new Date(Date.now() - 30000), amount: 50 },
      { id: '4', type: 'donation', username: 'Generous4', timestamp: new Date(Date.now() - 40000), amount: 25 },
    ],
  },
};

export const RaidsOnly: Story = {
  args: {
    events: [
      { id: '1', type: 'raid', username: 'BigStreamer', timestamp: new Date(Date.now() - 5000), details: 'Raided with 5000 viewers' },
      { id: '2', type: 'raid', username: 'PopularStreamer', timestamp: new Date(Date.now() - 15000), details: 'Raided with 1500 viewers' },
      { id: '3', type: 'raid', username: 'MediumStreamer', timestamp: new Date(Date.now() - 25000), details: 'Raided with 500 viewers' },
    ],
  },
};

export const MixedActivities: Story = {
  args: {
    events: [
      { id: '1', type: 'raid', username: 'StreamerX', timestamp: new Date(Date.now() - 2000), details: 'Raided with 2000 viewers' },
      { id: '2', type: 'donation', username: 'FanA', timestamp: new Date(Date.now() - 8000), amount: 200 },
      { id: '3', type: 'subscribe', username: 'SubB', timestamp: new Date(Date.now() - 18000) },
      { id: '4', type: 'follow', username: 'ViewerC', timestamp: new Date(Date.now() - 25000) },
      { id: '5', type: 'donation', username: 'FanD', timestamp: new Date(Date.now() - 35000), amount: 75 },
      { id: '6', type: 'subscribe', username: 'SubE', timestamp: new Date(Date.now() - 45000) },
    ],
    maxVisible: 6,
  },
};

export const Empty: Story = {
  args: {
    events: [],
  },
};

export const SingleEvent: Story = {
  args: {
    events: [
      { id: '1', type: 'follow', username: 'FirstViewer', timestamp: new Date() },
    ],
  },
};
