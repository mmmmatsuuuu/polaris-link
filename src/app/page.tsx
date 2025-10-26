'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { LoginButton } from '@/components/auth/LoginButton';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="container flex flex-col items-center justify-center py-24">
      <h1 className="text-4xl font-bold">Polaris-Link</h1>
      <p className="mt-2 text-muted-foreground">A new way to learn.</p>

      <div className="mt-8">
        {loading ? (
          <p>読み込み中...</p>
        ) : user ? (
          <div className="text-center">
            <p>ようこそ, {user.displayName || 'User'} さん</p>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </div>
  );
}
