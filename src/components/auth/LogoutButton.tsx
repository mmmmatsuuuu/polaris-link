'use client';

import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Logout Success');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      ログアウト
    </Button>
  );
}
