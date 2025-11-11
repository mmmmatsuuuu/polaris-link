
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Dockerコンテナからホストマシン（で公開されているエミュレータ）に接続するためのホスト名
const host = "127.0.0.1";

if (process.env.NODE_ENV === "development") {
  try {
    connectFirestoreEmulator(db, host, 8080);
    connectAuthEmulator(auth, `http://${host}:9099`);
    connectStorageEmulator(storage, host, 9199);
    console.log("Emulators connected");
  } catch (error) {
    console.warn("⚠️ Emulator connection failed (may be HMR):", error);
  }
} else {
  console.log("production mode");
  enableIndexedDbPersistence(db).catch((error) => {
    console.error(error);
  });
}

export { app, db, storage, auth };
