'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface PublicOnlyRouteProps {
  children: ReactNode;
}

export const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'student') {
        router.push('/student/dashboard');
      } else if (user.role === 'teacher') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};
