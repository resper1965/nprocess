/**
 * Firebase Cloud Messaging helpers
 */
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { messaging as messagingInstance } from './firebase-config';

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !messagingInstance) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY || '';
      
      if (!vapidKey) {
        console.warn('FCM VAPID key not configured');
        return null;
      }

      const token = await getToken(messagingInstance, { vapidKey });
      
      // Save token to Firestore
      if (token) {
        const { doc, setDoc, getFirestore } = await import('firebase/firestore');
        const { getAuth } = await import('firebase/auth');
        const db = getFirestore();
        const auth = getAuth();
        
        if (auth.currentUser) {
          await setDoc(
            doc(db, 'users', auth.currentUser.uid),
            { fcmToken: token },
            { merge: true }
          );
        }
      }
      
      return token;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = (): Promise<any> => {
  if (typeof window === 'undefined' || !messagingInstance) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    onMessage(messagingInstance, (payload) => {
      resolve(payload);
    });
  });
};

