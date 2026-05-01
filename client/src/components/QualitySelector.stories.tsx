import { Meta, StoryObj } from '@storybook/react';
import { QualitySelector } from './QualitySelector';

const meta: Meta<typeof QualitySelector> = {
  title: 'Streaming/QualitySelector',
  component: QualitySelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Video quality selector with HD, SD, and audio-only options grouped by resolution',
      },
    },
  },
  argTypes: {
    onQualityChange: { action: 'quality changed' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentQuality: 'auto',
    onQualityChange: (quality) => console.log('Quality changed to:', quality),
  },
};

export const Auto: Story = {
  args: {
    currentQuality: 'auto',
  },
};

export const High1080p60: Story = {
  args: {
    currentQuality: '1080p60',
  },
};

export const Medium720p: Story = {
  args: {
    currentQuality: '720p30',
  },
};

export const Low480p: Story = {
  args: {
    currentQuality: '480p30',
  },
};

export const AudioOnly: Story = {
  args: {
    currentQuality: 'audio',
  },
};

export const WithCustomQualities: Story = {
  args: {
    currentQuality: '720p',
    qualities: [
      { label: 'Source', value: 'source', bitrate: '8000-10000', fps: '60' },
      { label: 'High', value: '720p', bitrate: '4000-6000', fps: '60', recommended: true },
      { label: 'Medium', value: '480p', bitrate: '1500-2500', fps: '30' },
      { label: 'Low', value: '360p', bitrate: '800-1200', fps: '30' },
    ],
  },
};

export const AllOptions: Story = {
  args: {
    currentQuality: '1080p60',
    qualities: [
      { label: 'Auto', value: 'auto', bitrate: 'Adaptive', fps: '60', recommended: true },
      { label: '1080p60', value: '1080p60', bitrate: '5000-8000', fps: '60' },
      { label: '1080p30', value: '1080p30', bitrate: '3000-5000', fps: '30' },
      { label: '720p60', value: '720p60', bitrate: '2500-4000', fps: '60' },
      { label: '720p30', value: '720p30', bitrate: '1500-2500', fps: '30' },
      { label: '480p30', value: '480p30', bitrate: '800-1500', fps: '30' },
      { label: '360p30', value: '360p30', bitrate: '500-800', fps: '30' },
      { label: 'Audio', value: 'audio', bitrate: '128', fps: 'N/A' },
    ],
  },
};

export const WithInteraction: Story = {
  args: {
    currentQuality: 'auto',
  },
  render: (args) => (
    <QualitySelector {...args} onQualityChange={(q) => alert(`Selected: ${q}`)} />
  ),
};
