'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRoles: ('student' | 'teacher')[];
}

export const PrivateRoute = ({ children, requiredRoles }: PrivateRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      router.push('/login');
      return;
    }
    const isAuthorized = requiredRoles.includes(user.role);
    if (!isAuthorized) {
      router.push('/');
    }
  }, [user, loading, router, requiredRoles]);

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  const isAuthorized = requiredRoles.includes(user.role);

  if (!isAuthorized) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};