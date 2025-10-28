'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

export interface AppUser extends User {
  role: 'student' | 'teacher';
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        let appUser: AppUser;

        if (docSnap.exists()) {
          // 2回目以降のログイン：最終ログイン日時などを更新
          await updateDoc(userRef, {
            name: user.displayName,
            email: user.email,
            lastLogin: serverTimestamp(),
          });
          const userData = docSnap.data();
          appUser = { ...user, role: userData.role };
        } else {
          // 初回ログイン：新しいドキュメントを作成
          const newUser = {
            name: user.displayName,
            email: user.email,
            role: 'student', // デフォルトの役割
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          };
          await setDoc(userRef, newUser);
          appUser = { ...user, role: 'student' };
        }
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
