'use client';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

export function LoginButton() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Login Success:', result.user);
      // TODO: ログイン成功後、Firestoreにユーザー情報を保存する
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  return (
    <Button onClick={handleLogin} variant="outline">
      Googleでログイン
    </Button>
  );
}
