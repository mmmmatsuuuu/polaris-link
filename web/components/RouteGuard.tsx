"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthProvider";

type Role = "teacher" | "student" | null;

const GUEST_ALLOWED = ["/", "/lessons"];
const STUDENT_ALLOWED = ["/", "/lessons", "/student"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [role, setRole] = useState<Role>(null);
  const [checking, setChecking] = useState(false);

  // Fetch role when authenticated
  useEffect(() => {
    let cancelled = false;

    async function fetchRole() {
      if (!user) {
        setRole(null);
        return;
      }
      setChecking(true);
      try {
        const snapshot = await getDocs(
          query(collection(db, "users"), where("authId", "==", user.uid)),
        );
        if (snapshot.empty) {
          await logout();
          setRole(null);
          return;
        }
        const data = snapshot.docs[0]?.data() as { role?: Role };
        if (!cancelled) setRole((data?.role as Role) ?? null);
      } catch (error) {
        console.error("Failed to fetch role", error);
        if (!cancelled) setRole(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    fetchRole();
    return () => {
      cancelled = true;
    };
  }, [user, logout]);

  const allowed = useMemo(() => {
    if (loading || checking) return true; // 待機中は描画を止めるため許可扱い
    if (!user) return isPathAllowed(pathname, GUEST_ALLOWED);
    if (role === "teacher") return true;
    if (role === "student") return isPathAllowed(pathname, STUDENT_ALLOWED);
    return false;
  }, [loading, checking, user, role, pathname]);

  useEffect(() => {
    if (loading || checking) return;
    if (allowed) return;

    const redirectTo =
      !user ? "/" : role === "student" ? "/student" : "/";
    router.replace(redirectTo);
  }, [allowed, loading, checking, role, user, router]);

  if (loading || checking) {
    return null;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}

function isPathAllowed(pathname: string, allowList: string[]) {
  return allowList.some((base) => {
    if (base === "/") return pathname === "/";
    return pathname === base || pathname.startsWith(`${base}/`);
  });
}
