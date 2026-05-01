import { useAlertQueue } from '@/hooks/useAlertQueue';
import { AlertContainer } from './AlertContainer';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function AlertQueueDemo() {
  const { alerts, add: addAlert, dismiss: dismissAlert, dismissAll } = useAlertQueue();
  const [isRunningTest, setIsRunningTest] = useState(false);

  const testAlertSequence = () => {
    if (isRunningTest) return;
    setIsRunningTest(true);

    const testAlerts = [
      {
        type: 'raid' as const,
        title: 'RAID INCOMING!',
        message: 'StreamKing123 raided with 250 viewers',
        data: { username: 'StreamKing123', raidCount: 250 },
      },
      {
        type: 'subscribe' as const,
        title: 'NEW SUBSCRIBER!',
        message: 'VipVibes subscribed for 3 months',
        data: { username: 'VipVibes', tier: 'platinum', months: 3, message: 'Love the streams!' },
      },
      {
        type: 'donation' as const,
        title: 'Donation Received',
        message: 'BeatLover donated $50',
        data: { username: 'BeatLover', amount: 50, message: 'Keep up the great work!' },
      },
      {
        type: 'follow' as const,
        title: 'NEW FOLLOWER!',
        message: 'MusicFan42 followed the stream',
        data: { username: 'MusicFan42' },
      },
      {
        type: 'subscribe' as const,
        title: 'NEW SUBSCRIBER!',
        message: 'SoundWave subscribed for 1 month',
        data: { username: 'SoundWave', tier: 'gold', months: 1 },
      },
      {
        type: 'donation' as const,
        title: 'Donation Received',
        message: 'DanceFloor donated $25',
        data: { username: 'DanceFloor', amount: 25 },
      },
      {
        type: 'raid' as const,
        title: 'RAID INCOMING!',
        message: 'RadioHost99 raided with 150 viewers',
        data: { username: 'RadioHost99', raidCount: 150 },
      },
      {
        type: 'error' as const,
        title: 'Connection Issue',
        message: 'Stream quality dropped below 720p',
        data: { details: 'Network latency: 150ms' },
      },
      {
        type: 'success' as const,
        title: 'Stream Quality Restored',
        message: 'Stream is now running at 1080p 60fps',
        data: { details: 'All systems optimal' },
      },
      {
        type: 'follow' as const,
        title: 'NEW FOLLOWER!',
        message: 'BassHead88 followed the stream',
        data: { username: 'BassHead88' },
      },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < testAlerts.length) {
        const alert = testAlerts[index];
        addAlert({
          type: alert.type,
          title: alert.title,
          message: alert.message,
          data: alert.data,
        });
        index++;
      } else {
        clearInterval(interval);
        setIsRunningTest(false);
      }
    }, 800);
  };

  const addCustomAlert = (type: 'raid' | 'subscribe' | 'donation' | 'follow' | 'error' | 'success') => {
    const configs = {
      raid: {
        title: 'RAID INCOMING!',
        message: 'TestRaider raided with 100 viewers',
        data: { username: 'TestRaider', raidCount: 100 },
      },
      subscribe: {
        title: 'NEW SUBSCRIBER!',
        message: 'TestUser subscribed for 1 month',
        data: { username: 'TestUser', tier: 'gold', months: 1, message: 'Love it!' },
      },
      donation: {
        title: 'Donation Received',
        message: 'Donor42 donated $20',
        data: { username: 'Donor42', amount: 20, message: 'Keep streaming!' },
      },
      follow: {
        title: 'NEW FOLLOWER!',
        message: 'Follower99 followed the stream',
        data: { username: 'Follower99' },
      },
      error: {
        title: 'Error',
        message: 'Something went wrong',
        data: { details: 'Check your connection' },
      },
      success: {
        title: 'Success',
        message: 'Operation completed successfully',
        data: { details: 'All good' },
      },
    };

    const config = configs[type];
    addAlert({
      type,
      title: config.title,
      message: config.message,
      data: config.data,
    });
  };

  return (
    <div className="p-8 bg-gray-900 rounded-lg space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Alert Queue Demo</h2>
        <p className="text-gray-400 mb-4">
          Queue Status: {alerts.length} alert{alerts.length !== 1 ? 's' : ''} (Max 3 visible)
        </p>
      </div>

      {/* Alert Preview */}
      <AlertContainer alerts={alerts} onDismiss={dismissAlert} />

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => addCustomAlert('raid')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            + Raid Alert
          </Button>
          <Button
            onClick={() => addCustomAlert('subscribe')}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            + Subscribe Alert
          </Button>
          <Button
            onClick={() => addCustomAlert('donation')}
            className="bg-green-600 hover:bg-green-700"
          >
            + Donation Alert
          </Button>
          <Button
            onClick={() => addCustomAlert('follow')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Follow Alert
          </Button>
          <Button
            onClick={() => addCustomAlert('error')}
            className="bg-red-600 hover:bg-red-700"
          >
            + Error Alert
          </Button>
          <Button
            onClick={() => addCustomAlert('success')}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            + Success Alert
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={testAlertSequence}
            disabled={isRunningTest}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isRunningTest ? 'Running Test...' : 'Run 10-Alert Sequence'}
          </Button>
          <Button
            onClick={dismissAll}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Dismiss All
          </Button>
        </div>
      </div>

      {/* Alert Details */}
      <div className="bg-gray-800 rounded p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Queue Details:</h3>
        {alerts.length === 0 ? (
          <p className="text-gray-400">No alerts in queue</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={alert.id} className="text-sm text-gray-300">
                <span className="font-semibold">#{index + 1}</span> {alert.type.toUpperCase()} -
                {alert.title} (Priority: {alert.priority}, Duration: {alert.duration}ms)
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
