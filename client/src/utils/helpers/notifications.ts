/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * Push Notification Manager
 * Handle notification permissions, subscriptions, and display
 */

export interface NotificationPayload {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  if (Notification.permission !== 'default') {
    return Notification.permission;
  }

  return Notification.requestPermission();
}

export function isNotificationEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
  }

  return false;
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Failed to get push subscription:', error);
    return null;
  }
}

export async function showNotification(payload: NotificationPayload): Promise<void> {
  if (!isNotificationEnabled()) {
    console.warn('Notifications not enabled');
    return;
  }

  if (!('serviceWorker' in navigator)) {
    // Fallback to regular notification
    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      tag: payload.tag,
    });
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/logo-danny-hectic-b.png',
      badge: payload.badge || '/logo-icon.png',
      tag: payload.tag,
      data: payload.data,
      actions: payload.actions,
      requireInteraction: false,
    });
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

// Notification event handlers
export function setupNotificationHandlers(callback: (action: string, notification: any) => void) {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'NOTIFICATION_CLICK') {
      callback(event.data.action, event.data.notification);
    }
  });
}

// Convenience methods for specific notification types
export async function notifyStreamLive(streamerName: string): Promise<void> {
  await showNotification({
    title: `${streamerName} is Live!`,
    body: 'Tap to watch the stream',
    icon: '/logo-danny-hectic-b.png',
    tag: 'stream-live',
    data: { action: 'open-live', streamer: streamerName },
    actions: [{ action: 'watch', title: 'Watch' }],
  });
}

export async function notifyNewSubscriber(subscriberName: string): Promise<void> {
  await showNotification({
    title: 'New Subscriber!',
    body: `${subscriberName} just subscribed`,
    icon: '/logo-danny-hectic-b.png',
    tag: 'new-subscriber',
    data: { action: 'open-profile', subscriber: subscriberName },
  });
}

export async function notifyDonation(amount: string, donorName?: string): Promise<void> {
  await showNotification({
    title: 'Donation Received!',
    body: `${donorName || 'Anonymous'} donated ${amount}`,
    icon: '/logo-danny-hectic-b.png',
    tag: 'donation',
    data: { action: 'open-donations' },
  });
}

export async function notifyRaidIncoming(raiderName: string, raidSize: number): Promise<void> {
  await showNotification({
    title: 'Raid Incoming!',
    body: `${raiderName} is raiding with ${raidSize} viewers`,
    icon: '/logo-danny-hectic-b.png',
    tag: 'raid',
    data: { action: 'open-live', raider: raiderName },
  });
}

export async function notifyPoll(pollTitle: string): Promise<void> {
  await showNotification({
    title: 'New Poll',
    body: pollTitle,
    icon: '/logo-danny-hectic-b.png',
    tag: 'poll',
    data: { action: 'open-poll', title: pollTitle },
  });
}

export async function notifyDirectMessage(senderName: string, message: string): Promise<void> {
  await showNotification({
    title: `Message from ${senderName}`,
    body: message.substring(0, 100),
    icon: '/logo-danny-hectic-b.png',
    tag: `dm-${senderName}`,
    data: { action: 'open-messages', sender: senderName },
    actions: [{ action: 'reply', title: 'Reply' }],
  });
}

export async function notifyUpdateAvailable(): Promise<void> {
  await showNotification({
    title: 'Update Available',
    body: 'New version ready. Refresh to update.',
    icon: '/logo-danny-hectic-b.png',
    tag: 'update',
    data: { action: 'refresh' },
    actions: [{ action: 'update', title: 'Update' }],
    requireInteraction: true,
  });
}
