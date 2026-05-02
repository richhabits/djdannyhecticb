/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * Offline Data Persistence using IndexedDB
 * Stores chat messages, queued actions, and user preferences
 */

const DB_NAME = 'hectic-radio-offline';
const DB_VERSION = 1;

interface StoredMessage {
  id: string;
  content: string;
  timestamp: number;
  userId?: string;
  status: 'pending' | 'sent' | 'failed';
}

interface StoredDonation {
  id: string;
  amount: number;
  message: string;
  timestamp: number;
  status: 'pending' | 'sent' | 'failed';
}

interface StoredPreference {
  key: string;
  value: any;
  timestamp: number;
}

let db: IDBDatabase | null = null;

export async function initializeOfflineStorage(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!database.objectStoreNames.contains('messages')) {
        database.createObjectStore('messages', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('donations')) {
        database.createObjectStore('donations', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('preferences')) {
        database.createObjectStore('preferences', { keyPath: 'key' });
      }

      if (!database.objectStoreNames.contains('images')) {
        database.createObjectStore('images', { keyPath: 'url' });
      }
    };
  });
}

async function getDB(): Promise<IDBDatabase> {
  if (db) return db;
  return initializeOfflineStorage();
}

// Message storage
export async function saveMessage(message: Omit<StoredMessage, 'id'> & { id?: string }): Promise<string> {
  const database = await getDB();
  const id = message.id || `msg-${Date.now()}-${Math.random()}`;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');
    const request = store.put({ ...message, id });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(id);
  });
}

export async function getMessages(status?: string): Promise<StoredMessage[]> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['messages'], 'readonly');
    const store = transaction.objectStore('messages');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const messages = request.result;
      if (status) {
        resolve(messages.filter((m) => m.status === status));
      } else {
        resolve(messages);
      }
    };
  });
}

export async function deleteMessage(id: string): Promise<void> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function updateMessageStatus(id: string, status: 'pending' | 'sent' | 'failed'): Promise<void> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const message = getRequest.result;
      if (message) {
        message.status = status;
        const updateRequest = store.put(message);
        updateRequest.onerror = () => reject(updateRequest.error);
        updateRequest.onsuccess = () => resolve();
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Donation storage
export async function saveDonation(donation: Omit<StoredDonation, 'id'> & { id?: string }): Promise<string> {
  const database = await getDB();
  const id = donation.id || `donation-${Date.now()}-${Math.random()}`;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['donations'], 'readwrite');
    const store = transaction.objectStore('donations');
    const request = store.put({ ...donation, id });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(id);
  });
}

export async function getDonations(status?: string): Promise<StoredDonation[]> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['donations'], 'readonly');
    const store = transaction.objectStore('donations');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const donations = request.result;
      if (status) {
        resolve(donations.filter((d) => d.status === status));
      } else {
        resolve(donations);
      }
    };
  });
}

export async function deleteDonation(id: string): Promise<void> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['donations'], 'readwrite');
    const store = transaction.objectStore('donations');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Preference storage
export async function savePreference(key: string, value: any): Promise<void> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['preferences'], 'readwrite');
    const store = transaction.objectStore('preferences');
    const request = store.put({
      key,
      value,
      timestamp: Date.now(),
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getPreference(key: string): Promise<any> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['preferences'], 'readonly');
    const store = transaction.objectStore('preferences');
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.value : null);
    };
  });
}

// Image caching
export async function cacheImage(url: string, blob: Blob): Promise<void> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['images'], 'readwrite');
    const store = transaction.objectStore('images');
    const request = store.put({
      url,
      blob,
      timestamp: Date.now(),
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getCachedImage(url: string): Promise<Blob | null> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['images'], 'readonly');
    const store = transaction.objectStore('images');
    const request = store.get(url);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.blob : null);
    };
  });
}

// Storage management
export async function getStorageStats(): Promise<{ used: number; quota: number; percentage: number }> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return { used: 0, quota: 0, percentage: 0 };
  }

  const estimate = await navigator.storage.estimate();
  const used = estimate.usage || 0;
  const quota = estimate.quota || 0;
  const percentage = quota ? (used / quota) * 100 : 0;

  return { used, quota, percentage };
}

export async function clearOldData(maxAgeDays: number = 7): Promise<void> {
  const database = await getDB();
  const cutoffTime = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

  const stores = ['messages', 'donations', 'images', 'preferences'];

  for (const storeName of stores) {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result;
        items.forEach((item) => {
          if (item.timestamp && item.timestamp < cutoffTime) {
            store.delete(item.id || item.key || item.url);
          }
        });
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }
}
