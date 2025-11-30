import Link from "next/link";
import React, { useEffect, useState } from "react";
import { DropdownMenu, Text, Flex, Card, Avatar } from "@radix-ui/themes";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthProvider";
import { db } from "@/lib/firebase/client";

const studentLinks = [
  { href: "/lessons", label: "授業一覧" },
  { href: "/student", label: "マイページ" },
];

const teacherLinks = [
  { href: "/lessons", label: "授業一覧" },
  { href: "/student", label: "生徒ページ" },
  { href: "/teacher", label: "教師ページ" },
  { href: "/admin", label: "管理ページ" },
];

type UserMeta = {
  role?: "teacher" | "student";
  displayName?: string;
  studentNumber?: number | string;
  photoURL?: string;
};

export function NavMenu() {
  const { user, loading, logout } = useAuth();
  const [meta, setMeta] = useState<UserMeta>({});

  useEffect(() => {
    let cancelled = false;

    async function fetchRole() {
      if (!user) {
        setMeta({});
        return;
      }
      try {
        const snapshot = await getDocs(
          query(
            collection(db, "users"),
            where("authId", "==", user.uid),
          ),
        );
        const data =
          snapshot.docs[0]?.data() as UserMeta | undefined;
        if (!cancelled)
          setMeta({
            ...data,
            photoURL: user.photoURL ?? data?.photoURL,
          });
      } catch (error) {
        console.error("Failed to fetch role", error);
        if (!cancelled) setMeta({});
      }
    }

    fetchRole();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      {!loading && meta.role === "student" && (
        <>
          <NavSection 
            title={
              <Card className="w-full" variant="surface">
                <Flex gap="2">
                  <Avatar
                    radius="full"
                    size="3"
                    src={meta.photoURL}
                    fallback={(meta.displayName || "S").slice(0, 1)}
                  />
                  <Flex direction="column" gap="1">
                    <Text size="1">
                      学籍番号: {meta.studentNumber ?? "未登録"}
                    </Text>
                    <Text weight="medium" size="3">
                      {meta.displayName || user?.displayName || "生徒さん"}
                    </Text>
                  </Flex>
                </Flex>
              </Card>
            }
            links={studentLinks} 
          />
          <DropdownMenu.Separator />
        </>
      )}
      {!loading && meta.role === "teacher" && (
        <>
          <NavSection 
            title={
              <Card className="w-full" variant="surface">
                <Flex gap="2">
                  <Avatar
                    radius="full"
                    size="3"
                    src={meta.photoURL}
                    fallback={(meta.displayName || "T").slice(0, 1)}
                  />
                  <Flex direction="column" gap="1">
                    <Text weight="medium" size="3">
                      {meta.displayName || user?.displayName || "先生"}
                    </Text>
                  </Flex>
                </Flex>
              </Card>
            }
            links={teacherLinks} 
          />
          <DropdownMenu.Separator />
        </>
      )}
      <DropdownMenu.Item onSelect={handleLogout}>
        ログアウト
      </DropdownMenu.Item>
    </>
  );
}

function NavSection({
  title,
  links,
}: {
  title: React.ReactNode;
  links: { href: string; label: string }[];
}) {
  return (
    <>
      <DropdownMenu.Label className="my-4 py-8">
        {title}
      </DropdownMenu.Label>
      {links.map((link) => (
        <DropdownMenu.Item key={link.href} asChild>
          <Link href={link.href}>{link.label}</Link>
        </DropdownMenu.Item>
      ))}
    </>
  );
}
