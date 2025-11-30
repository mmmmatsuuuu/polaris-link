"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, db, googleProvider } from "@/lib/firebase/client";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const allowed = await verifyUser(currentUser);
        if (allowed) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Googleログイン失敗", err);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

async function verifyUser(currentUser: User): Promise<boolean> {
  const email = currentUser.email?.trim().toLowerCase();
  if (!email) {
    await safeDeleteAndSignOut(currentUser);
    return false;
  }

  try {
    const snapshot = await getDocs(
      query(collection(db, "users"), where("email", "==", email)),
    );

    if (snapshot.empty) {
      await safeDeleteAndSignOut(currentUser);
      return false;
    }

    // 1件目を採用（メールはユニーク想定）
    const docRef = snapshot.docs[0].ref;
    const data = snapshot.docs[0].data() as { authId?: string };
    const updatePayload: Record<string, unknown> = { lastLogin: serverTimestamp() };
    if (!data.authId) updatePayload.authId = currentUser.uid;
    await updateDoc(docRef, updatePayload);

    return true;
  } catch (error) {
    console.error("Failed to verify user", error);
    await safeDeleteAndSignOut(currentUser);
    return false;
  }
}

async function safeDeleteAndSignOut(currentUser: User) {
  try {
    await currentUser.delete();
  } catch (error) {
    // recent login などで失敗する場合もあるが、signOut は続行する
    console.warn("Failed to delete auth user", error);
  } finally {
    await signOut(auth);
  }
}
