// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: 'AIzaSyCoTXUGWWoKS8hJFM8z5BgSljcigX2cum8',
  authDomain: 'nprocess-33a44.firebaseapp.com',
  projectId: 'nprocess-33a44',
  storageBucket: 'nprocess-33a44.firebasestorage.app',
  messagingSenderId: '406039759652',
  appId: '1:406039759652:web:fbfdcdcb317bb1087201b1'
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'nProcess Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

