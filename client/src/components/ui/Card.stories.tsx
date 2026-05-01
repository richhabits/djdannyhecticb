import { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card container component for grouping related content',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        Content of the card
      </CardContent>
    </Card>
  ),
};

export const WithTitle: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Stream Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        Your stream statistics for today
      </CardContent>
    </Card>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Events from the last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        Activity feed content
      </CardContent>
    </Card>
  ),
};

export const Complex: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>@username - Active streamer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Followers</p>
          <p className="text-2xl font-bold">15,240</p>
        </div>
        <div>
          <p className="text-sm font-medium">Total Watch Time</p>
          <p className="text-2xl font-bold">2,450 hrs</p>
        </div>
      </CardContent>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Card 1</CardTitle>
        </CardHeader>
        <CardContent>Content 1</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Card 2</CardTitle>
        </CardHeader>
        <CardContent>Content 2</CardContent>
      </Card>
    </div>
  ),
};
