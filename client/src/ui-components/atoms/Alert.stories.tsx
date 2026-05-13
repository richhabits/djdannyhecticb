import { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Alert component for displaying important messages and notifications',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the add command.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert>
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your stream has started successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert>
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Your stream quality is below recommended levels.
      </AlertDescription>
    </Alert>
  ),
};

export const Info: Story = {
  render: () => (
    <Alert>
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        A new version of the app is available. Update now?
      </AlertDescription>
    </Alert>
  ),
};

export const ConnectionError: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription>
        Failed to connect to the streaming server. Check your internet connection and try again.
      </AlertDescription>
    </Alert>
  ),
};

export const StreamHealthWarning: Story = {
  render: () => (
    <Alert>
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle>Stream Quality Issue</AlertTitle>
      <AlertDescription>
        Your bitrate has dropped to 1.2 Mbps. Consider lowering your resolution.
      </AlertDescription>
    </Alert>
  ),
};

export const MultipleAlerts: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <Alert>
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle>Notification</AlertTitle>
        <AlertDescription>New subscriber: cooluser420</AlertDescription>
      </Alert>
      <Alert>
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Low bitrate detected. Quality may be affected.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Encoder connection lost</AlertDescription>
      </Alert>
    </div>
  ),
};
