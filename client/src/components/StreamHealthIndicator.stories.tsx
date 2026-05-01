import { Meta, StoryObj } from '@storybook/react';
import { StreamHealthIndicator } from './StreamHealthIndicator';

const meta: Meta<typeof StreamHealthIndicator> = {
  title: 'Streaming/StreamHealthIndicator',
  component: StreamHealthIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Real-time stream health monitor showing bitrate, FPS, and resolution with status indicators',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Healthy: Story = {
  args: {
    bitrate: 5.2,
    fps: 60,
    resolution: '1080p',
    isHealthy: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Optimal streaming conditions with good bitrate and high FPS',
      },
    },
  },
};

export const HealthyHighBitrate: Story = {
  args: {
    bitrate: 8.5,
    fps: 60,
    resolution: '1440p',
    isHealthy: true,
  },
};

export const Caution: Story = {
  args: {
    bitrate: 1.5,
    fps: 30,
    resolution: '720p',
    isHealthy: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Warning state - bitrate and FPS are below optimal but still usable',
      },
    },
  },
};

export const Critical: Story = {
  args: {
    bitrate: 0.5,
    fps: 15,
    resolution: '480p',
    isHealthy: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Critical condition - stream quality is severely affected',
      },
    },
  },
};

export const LowBitrate: Story = {
  args: {
    bitrate: 0.8,
    fps: 24,
    resolution: '360p',
  },
};

export const MidrangeStream: Story = {
  args: {
    bitrate: 2.5,
    fps: 30,
    resolution: '720p',
  },
};

export const HighEndStream: Story = {
  args: {
    bitrate: 10,
    fps: 60,
    resolution: '4K',
  },
};

export const VariableFPS: Story = {
  args: {
    bitrate: 3.2,
    fps: 48,
    resolution: '1080p',
  },
};
