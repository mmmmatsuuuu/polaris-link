import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from "firebase/auth";
import { firebaseConfig } from "@/lib/firebase/config";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

function connectEmulatorsForClient() {
  const firestoreHost =
    process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";
  const authHost =
    process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";
  const [firestoreHostname, firestorePort] = firestoreHost.split(":");
  connectFirestoreEmulator(db, firestoreHostname, Number(firestorePort));

  const [authHostname, authPort] = authHost.split(":");
  connectAuthEmulator(auth, `http://${authHostname}:${authPort}`);
}

if (typeof window !== "undefined") {
  if (process.env.NODE_ENV === "development") {
    try {
      connectEmulatorsForClient();
      console.log("Client emulators connected");
    } catch (error) {
      console.warn("⚠️ Client emulator connection failed:", error);
    }
  } else {
    enableIndexedDbPersistence(db).catch((error) => {
      console.error(error);
    });
  }
}

export { app, db, auth, googleProvider };
