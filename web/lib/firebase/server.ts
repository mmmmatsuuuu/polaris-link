import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { firebaseConfig } from "@/lib/firebase/config";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

if (process.env.NODE_ENV === "development") {
  const emulatorTarget =
    process.env.FIRESTORE_EMULATOR_HOST ?? "firebase:8080";
  const [host, portString] = emulatorTarget.split(":");
  const port = Number(portString ?? "0");

  if (host && port) {
    connectFirestoreEmulator(db, host, port);
    console.log(
      `Server Firestore emulator connected at http://${host}:${port}`,
    );
  }
}

export { db };
