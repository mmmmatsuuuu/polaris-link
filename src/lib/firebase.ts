import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app);

// if (process.env.NODE_ENV === 'development') {
//   console.log('Running in development mode, attempting to connect to Firebase Emulators');

//   try {
//     const authEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
//     if (authEmulatorHost) {
//       connectAuthEmulator(auth, `http://${authEmulatorHost}`, { disableWarnings: true });
//       console.log(`Successfully connected to Auth Emulator at ${authEmulatorHost}`);
//     } else {
//       console.log('Auth Emulator host not found, skipping connection.');
//     }

//     const firestoreEmulatorHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST;
//     if (firestoreEmulatorHost) {
//       const [host, port] = firestoreEmulatorHost.split(':');
//       connectFirestoreEmulator(db, host, parseInt(port, 10));
//       console.log(`Successfully connected to Firestore Emulator at ${host}:${port}`);
//     } else {
//       console.log('Firestore Emulator host not found, skipping connection.');
//     }
//   } catch (error) {
//     console.error('Error connecting to Firebase Emulators: ', error);
//   }
// }

export { app, auth, db };
