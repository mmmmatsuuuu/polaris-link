'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { LoginButton } from '@/components/auth/LoginButton';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Polaris-Link</h1>
      </div>

      <div className="mt-8">
        {loading ? (
          <p>読み込み中...</p>
        ) : user ? (
          <div>
            <p>ようこそ, {user.displayName || 'User'} さん</p>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </main>
  );
}
