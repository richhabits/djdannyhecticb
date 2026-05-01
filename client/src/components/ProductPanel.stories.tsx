import { Meta, StoryObj } from '@storybook/react';
import { ProductPanel } from './ProductPanel';

const meta: Meta<typeof ProductPanel> = {
  title: 'Streaming/ProductPanel',
  component: ProductPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays streaming-related products grouped by type (tracks, merchandise, links)',
      },
    },
  },
  argTypes: {
    onProductClick: { action: 'product clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'NOW PLAYING',
    products: [
      {
        id: '1',
        name: 'Morning Vibes Mix (Extended)',
        type: 'track',
        url: 'https://spotify.com/track/123',
        description: 'Full 45-min exclusive mix',
      },
      {
        id: '2',
        name: 'Hectic Radio Hoodie',
        type: 'merchandise',
        price: 49.99,
        url: 'https://shop.example.com',
        description: 'Limited edition drop',
      },
      {
        id: '3',
        name: 'Discord Community',
        type: 'link',
        url: 'https://discord.gg/example',
        description: 'Join 5K+ members',
      },
    ],
  },
};

export const TracksOnly: Story = {
  args: {
    title: 'CURRENT PLAYLIST',
    products: [
      {
        id: '1',
        name: 'Night Vibes Vol.2',
        type: 'track',
        url: 'https://spotify.com/track/1',
        description: 'Smooth electronica',
      },
      {
        id: '2',
        name: 'Deep House Journey',
        type: 'track',
        url: 'https://spotify.com/track/2',
        description: 'Progressive beats',
      },
      {
        id: '3',
        name: 'Tech Fusion Mix',
        type: 'track',
        url: 'https://spotify.com/track/3',
        description: 'Latest releases',
      },
    ],
  },
};

export const MerchandiseOnly: Story = {
  args: {
    title: 'MERCH DROP',
    products: [
      {
        id: '1',
        name: 'Limited Edition Tee',
        type: 'merchandise',
        price: 29.99,
        url: 'https://shop.example.com/tee',
        description: 'Exclusive design',
      },
      {
        id: '2',
        name: 'Hectic Radio Cap',
        type: 'merchandise',
        price: 24.99,
        url: 'https://shop.example.com/cap',
        description: 'Adjustable fit',
      },
    ],
  },
};

export const LinksOnly: Story = {
  args: {
    title: 'CONNECT WITH US',
    products: [
      {
        id: '1',
        name: 'Discord Server',
        type: 'link',
        url: 'https://discord.gg/example',
        description: 'Join 8K+ members',
      },
      {
        id: '2',
        name: 'Twitter/X',
        type: 'link',
        url: 'https://twitter.com/example',
        description: 'Follow for updates',
      },
      {
        id: '3',
        name: 'Instagram',
        type: 'link',
        url: 'https://instagram.com/example',
        description: 'Behind the scenes',
      },
    ],
  },
};

export const Mixed: Story = {
  args: {
    title: 'NOW PLAYING & MORE',
    products: [
      {
        id: '1',
        name: 'Midnight Sessions Vol.5',
        type: 'track',
        url: 'https://spotify.com/track/mix5',
        description: 'Full DJ mix',
      },
      {
        id: '2',
        name: 'House Essentials',
        type: 'track',
        url: 'https://spotify.com/track/essentials',
        description: 'Curated playlist',
      },
      {
        id: '3',
        name: 'Hectic Radio Hoodie',
        type: 'merchandise',
        price: 49.99,
        url: 'https://shop.example.com/hoodie',
        description: 'Limited edition',
      },
      {
        id: '4',
        name: 'Hectic Radio Beanie',
        type: 'merchandise',
        price: 24.99,
        url: 'https://shop.example.com/beanie',
        description: 'Winter wear',
      },
      {
        id: '5',
        name: 'Subscribe on YouTube',
        type: 'link',
        url: 'https://youtube.com',
        description: '50K subscribers',
      },
      {
        id: '6',
        name: 'Twitch Channel',
        type: 'link',
        url: 'https://twitch.tv',
        description: 'Live streams daily',
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    title: 'FEATURED PRODUCTS',
    products: [],
  },
};

export const SingleProduct: Story = {
  args: {
    title: 'SPOTLIGHT',
    products: [
      {
        id: '1',
        name: 'Exclusive Album Drop',
        type: 'track',
        url: 'https://spotify.com/album/123',
        description: 'Now available on all platforms',
      },
    ],
  },
};
