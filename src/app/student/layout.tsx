'use client';

import { PrivateRoute } from "@/components/auth/PrivateRoute";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivateRoute requiredRole="student">{children}</PrivateRoute>;
}
