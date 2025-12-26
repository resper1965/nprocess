/**
 * Hook for Firebase Cloud Messaging
 * Handles service worker registration, token management, and message listening
 */

import { useEffect, useState, useCallback } from 'react';
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import { messaging as messagingInstance } from '@/lib/firebase-config';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface UseFCMOptions {
  onMessage?: (payload: any) => void;
  autoRegister?: boolean;
}

interface UseFCMReturn {
  token: string | null;
  loading: boolean;
  error: Error | null;
  supported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<string | null>;
  refreshToken: () => Promise<string | null>;
  deleteCurrentToken: () => Promise<void>;
}

export function useFCM(options: UseFCMOptions = {}): UseFCMReturn {
  const { onMessage: onMessageCallback, autoRegister = false } = options;

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check if FCM is supported
  const supported = typeof window !== 'undefined' &&
                   'Notification' in window &&
                   'serviceWorker' in navigator &&
                   messagingInstance !== null;

  // Register service worker
  useEffect(() => {
    if (!supported) {
      console.warn('[FCM] Push notifications not supported in this browser');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('[FCM] Service Worker registered:', registration.scope);

        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[FCM] New service worker available. Refresh to update.');
              }
            });
          }
        });
      } catch (err) {
        console.error('[FCM] Service Worker registration failed:', err);
        setError(err as Error);
      }
    };

    registerServiceWorker();
  }, [supported]);

  // Setup message listener
  useEffect(() => {
    if (!supported || !messagingInstance || !onMessageCallback) return;

    const unsubscribe = onMessage(messagingInstance, (payload) => {
      console.log('[FCM] Foreground message received:', payload);
      onMessageCallback(payload);
    });

    return () => unsubscribe();
  }, [supported, onMessageCallback]);

  // Update permission state
  useEffect(() => {
    if (supported && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [supported]);

  // Save token to Firestore
  const saveTokenToFirestore = useCallback(async (fcmToken: string) => {
    try {
      const auth = getAuth();
      const db = getFirestore();

      if (!auth.currentUser) {
        console.warn('[FCM] No authenticated user to save token');
        return;
      }

      await setDoc(
        doc(db, 'users', auth.currentUser.uid),
        {
          fcmToken,
          fcmTokenUpdatedAt: new Date(),
        },
        { merge: true }
      );

      console.log('[FCM] Token saved to Firestore');
    } catch (err) {
      console.error('[FCM] Error saving token to Firestore:', err);
      throw err;
    }
  }, []);

  // Request notification permission and get token
  const requestPermission = useCallback(async (): Promise<string | null> => {
    if (!supported || !messagingInstance) {
      setError(new Error('FCM not supported in this browser'));
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        console.log('[FCM] Notification permission denied');
        setLoading(false);
        return null;
      }

      const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
      if (!vapidKey) {
        throw new Error('FCM VAPID key not configured');
      }

      const currentToken = await getToken(messagingInstance, { vapidKey });

      if (currentToken) {
        console.log('[FCM] Token obtained:', currentToken.substring(0, 20) + '...');
        setToken(currentToken);
        await saveTokenToFirestore(currentToken);
        setLoading(false);
        return currentToken;
      } else {
        console.warn('[FCM] No registration token available');
        setLoading(false);
        return null;
      }
    } catch (err) {
      console.error('[FCM] Error requesting permission:', err);
      setError(err as Error);
      setLoading(false);
      return null;
    }
  }, [supported, saveTokenToFirestore]);

  // Refresh token (useful when token expires)
  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (!supported || !messagingInstance) {
      return null;
    }

    try {
      // Delete current token
      if (token) {
        await deleteToken(messagingInstance);
        console.log('[FCM] Old token deleted');
      }

      // Request new token
      return await requestPermission();
    } catch (err) {
      console.error('[FCM] Error refreshing token:', err);
      setError(err as Error);
      return null;
    }
  }, [supported, token, requestPermission]);

  // Delete current token
  const deleteCurrentToken = useCallback(async (): Promise<void> => {
    if (!supported || !messagingInstance || !token) {
      return;
    }

    try {
      await deleteToken(messagingInstance);
      setToken(null);
      console.log('[FCM] Token deleted successfully');
    } catch (err) {
      console.error('[FCM] Error deleting token:', err);
      setError(err as Error);
    }
  }, [supported, token]);

  // Auto-register on mount if enabled
  useEffect(() => {
    if (autoRegister && supported && permission === 'default') {
      requestPermission();
    }
  }, [autoRegister, supported, permission, requestPermission]);

  return {
    token,
    loading,
    error,
    supported,
    permission,
    requestPermission,
    refreshToken,
    deleteCurrentToken,
  };
}
