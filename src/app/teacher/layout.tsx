'use client';

import { PrivateRoute } from "@/components/auth/PrivateRoute";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivateRoute requiredRole="teacher">{children}</PrivateRoute>;
}
