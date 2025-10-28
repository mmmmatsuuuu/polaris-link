'use client';

import { useAuth, AppUser } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole: 'student' | 'teacher';
}

export const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== requiredRole) {
        // Redirect to a different page if the role doesn't match
        // For now, let's redirect to the home page.
        router.push('/');
      }
    }
  }, [user, loading, router, requiredRole]);

  if (loading || !user || user.role !== requiredRole) {
    // You can render a loading spinner or a skeleton screen here
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};
