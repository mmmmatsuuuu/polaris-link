import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { firebaseConfig } from "@/lib/firebase/config";

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: applicationDefault(),
        projectId: firebaseConfig.projectId,
      });

const adminAuth = getAuth(adminApp);

export { adminAuth };
