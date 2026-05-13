/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * useOfflineSync Hook
 * Manage offline message/action queuing and syncing
 */

import { useEffect, useState, useCallback } from 'react';
import { useIsOnline } from './useNetworkQuality';
import {
  saveMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage,
  saveDonation,
  getDonations,
  deleteDonation,
} from '@/utils/offlineStorage';

interface SyncState {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
  syncError: Error | null;
}

export function useOfflineSync() {
  const isOnline = useIsOnline();
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    syncError: null,
  });

  // Update pending message count
  const updatePendingCount = useCallback(async () => {
    try {
      const messages = await getMessages('pending');
      const donations = await getDonations('pending');
      setSyncState((prev) => ({
        ...prev,
        pendingCount: messages.length + donations.length,
      }));
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  }, []);

  // Sync pending messages
  const syncMessages = useCallback(async () => {
    if (syncState.isSyncing) return;

    setSyncState((prev) => ({
      ...prev,
      isSyncing: true,
      syncError: null,
    }));

    try {
      const messages = await getMessages('pending');

      for (const message of messages) {
        try {
          const response = await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
          });

          if (response.ok) {
            await updateMessageStatus(message.id, 'sent');
            await deleteMessage(message.id);
          } else {
            await updateMessageStatus(message.id, 'failed');
          }
        } catch (error) {
          console.error(`Failed to sync message ${message.id}:`, error);
          await updateMessageStatus(message.id, 'failed');
        }
      }

      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: Date.now(),
      }));

      await updatePendingCount();
    } catch (error) {
      const syncError = error instanceof Error ? error : new Error(String(error));
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        syncError,
      }));
    }
  }, [syncState.isSyncing, updatePendingCount]);

  // Sync when coming online
  useEffect(() => {
    if (isOnline && syncState.pendingCount > 0) {
      // Debounce sync to avoid multiple simultaneous requests
      const timeout = setTimeout(() => {
        syncMessages();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [isOnline, syncState.pendingCount, syncMessages]);

  // Initialize pending count
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  return {
    ...syncState,
    syncMessages,
    updatePendingCount,
  };
}

/**
 * Hook for saving messages while offline
 */
export function useOfflineMessage() {
  const isOnline = useIsOnline();

  const sendMessage = useCallback(
    async (content: string, metadata?: Record<string, any>) => {
      const message = {
        content,
        timestamp: Date.now(),
        status: isOnline ? 'pending' : 'pending' as const,
        ...metadata,
      };

      try {
        if (isOnline) {
          // Try to send immediately
          const response = await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
          });

          if (response.ok) {
            return { success: true, id: (await response.json()).id };
          }
        }

        // Save to offline queue
        const id = await saveMessage(message);
        return { success: true, id, queued: true };
      } catch (error) {
        // Save to offline queue on error
        const id = await saveMessage({
          ...message,
          status: 'failed',
        });
        return { success: false, id, error, queued: true };
      }
    },
    [isOnline]
  );

  return { sendMessage, isOnline };
}

/**
 * Hook for tracking sync status in UI
 */
export function useSyncStatus() {
  const { isSyncing, pendingCount, lastSyncTime, syncError } = useOfflineSync();
  const isOnline = useIsOnline();

  return {
    isSyncing,
    hasPending: pendingCount > 0,
    pendingCount,
    lastSyncTime,
    isOnline,
    hasError: !!syncError,
    syncError,
  };
}
