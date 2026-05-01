import { Meta, StoryObj } from '@storybook/react';
import { ViewerStats } from './ViewerStats';

const meta: Meta<typeof ViewerStats> = {
  title: 'Streaming/ViewerStats',
  component: ViewerStats,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Live stream statistics showing viewer count, duration, and total donations',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    viewerCount: 3500,
    streamDuration: '2:30',
    donationsRaised: 1250,
    compact: false,
  },
};

export const Compact: Story = {
  args: {
    viewerCount: 3500,
    streamDuration: '2:30',
    donationsRaised: 1250,
    compact: true,
  },
};

export const HighViewership: Story = {
  args: {
    viewerCount: 15000,
    streamDuration: '4:15',
    donationsRaised: 5500,
  },
};

export const CompactHighViewership: Story = {
  args: {
    viewerCount: 15000,
    streamDuration: '4:15',
    donationsRaised: 5500,
    compact: true,
  },
};

export const LowViewership: Story = {
  args: {
    viewerCount: 150,
    streamDuration: '45:30',
    donationsRaised: 125,
  },
};

export const CompactLowViewership: Story = {
  args: {
    viewerCount: 150,
    streamDuration: '45:30',
    donationsRaised: 125,
    compact: true,
  },
};

export const LargeNumbers: Story = {
  args: {
    viewerCount: 2500000,
    streamDuration: '12:30',
    donationsRaised: 50000,
  },
};

export const CompactLargeNumbers: Story = {
  args: {
    viewerCount: 2500000,
    streamDuration: '12:30',
    donationsRaised: 50000,
    compact: true,
  },
};

export const ShortStream: Story = {
  args: {
    viewerCount: 500,
    streamDuration: '5:00',
    donationsRaised: 75,
  },
};

export const LongStream: Story = {
  args: {
    viewerCount: 8000,
    streamDuration: '10:45:30',
    donationsRaised: 3200,
  },
};

export const NoDonations: Story = {
  args: {
    viewerCount: 5000,
    streamDuration: '1:30',
    donationsRaised: 0,
  },
};

export const NoDonationsCompact: Story = {
  args: {
    viewerCount: 5000,
    streamDuration: '1:30',
    donationsRaised: 0,
    compact: true,
  },
};

export const ZeroViewers: Story = {
  args: {
    viewerCount: 0,
    streamDuration: '0:00',
    donationsRaised: 0,
  },
};
