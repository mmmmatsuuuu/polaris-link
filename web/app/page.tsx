"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, signInWithGoogle, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/todo");
    }
  }, [user, router]);

  if (loading || user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <button
        onClick={signInWithGoogle}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Login with Google
      </button>
    </main>
  );
}