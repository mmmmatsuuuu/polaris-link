'use client';

import { AuthProvider } from "@/components/auth/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReactNode } from "react";

export default function AuthLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
