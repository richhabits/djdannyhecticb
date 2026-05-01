import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../client/src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    '@storybook/addon-viewport',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../client/src'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@assets': path.resolve(__dirname, '../attached_assets'),
    };
    return config;
  },
};

export default config;
