import { Meta, StoryObj } from '@storybook/react';
import { StreamAnalytics } from './StreamAnalytics';

const meta: Meta<typeof StreamAnalytics> = {
  title: 'Streaming/StreamAnalytics',
  component: StreamAnalytics,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Stream analytics dashboard showing viewer metrics and geographic distribution',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    peakViewers: 5200,
    avgViewers: 3847,
    streamDuration: '2:15:30',
    topCountries: [
      { code: 'US', viewers: 1850 },
      { code: 'UK', viewers: 890 },
      { code: 'CA', viewers: 650 },
      { code: 'AU', viewers: 457 },
    ],
  },
};

export const HighViewership: Story = {
  args: {
    peakViewers: 15000,
    avgViewers: 11500,
    streamDuration: '4:30:00',
    topCountries: [
      { code: 'US', viewers: 6500 },
      { code: 'UK', viewers: 2800 },
      { code: 'CA', viewers: 1200 },
      { code: 'AU', viewers: 850 },
    ],
  },
};

export const LowViewership: Story = {
  args: {
    peakViewers: 250,
    avgViewers: 145,
    streamDuration: '1:30:00',
    topCountries: [
      { code: 'US', viewers: 85 },
      { code: 'UK', viewers: 40 },
      { code: 'CA', viewers: 20 },
    ],
  },
};

export const MediumStream: Story = {
  args: {
    peakViewers: 2500,
    avgViewers: 1800,
    streamDuration: '1:45:15',
    topCountries: [
      { code: 'US', viewers: 950 },
      { code: 'UK', viewers: 450 },
      { code: 'CA', viewers: 300 },
      { code: 'AU', viewers: 100 },
    ],
  },
};

export const IntlAudience: Story = {
  args: {
    peakViewers: 8000,
    avgViewers: 5500,
    streamDuration: '3:00:00',
    topCountries: [
      { code: 'US', viewers: 2000 },
      { code: 'BR', viewers: 1500 },
      { code: 'DE', viewers: 1000 },
      { code: 'FR', viewers: 700 },
      { code: 'JP', viewers: 300 },
      { code: 'KR', viewers: 500 },
    ],
  },
};

export const LongStream: Story = {
  args: {
    peakViewers: 3500,
    avgViewers: 2200,
    streamDuration: '12:34:56',
    topCountries: [
      { code: 'US', viewers: 1200 },
      { code: 'UK', viewers: 600 },
      { code: 'CA', viewers: 400 },
    ],
  },
};

export const SingleCountry: Story = {
  args: {
    peakViewers: 1000,
    avgViewers: 750,
    streamDuration: '1:30:00',
    topCountries: [
      { code: 'US', viewers: 750 },
    ],
  },
};

export const USFocused: Story = {
  args: {
    peakViewers: 4200,
    avgViewers: 3100,
    streamDuration: '2:00:00',
    topCountries: [
      { code: 'US', viewers: 3000 },
      { code: 'UK', viewers: 100 },
      { code: 'CA', viewers: 0 },
    ],
  },
};
