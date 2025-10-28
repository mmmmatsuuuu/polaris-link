'use client';

import { PublicOnlyRoute } from "@/components/auth/PublicOnlyRoute";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicOnlyRoute>{children}</PublicOnlyRoute>;
}
