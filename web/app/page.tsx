"use client";

import Link from "next/link";
import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Flex
        direction="column"
        align="center"
        gap="5"
        className="mx-auto max-w-4xl px-6 py-24 text-center"
      >
        <Text size="2" weight="medium" color="blue" className="tracking-[0.4em] uppercase">
          Polaris Link
        </Text>
        <Heading size="9">
          教師と生徒が同じ画面で進捗を共有できる学習プラットフォーム
        </Heading>
        <Text size="4" color="gray">
          Googleログインで授業の視聴状況や小テスト結果を保存。ログイン前でも公開授業を確認できます。
        </Text>
        <Flex
          direction={{ initial: "column", sm: "row" }}
          gap="4"
          align="center"
          justify="center"
          className="w-full"
        >
          {!user && (
            <Button size="4" onClick={handleLogin} className="w-full sm:w-auto">
              Googleでログイン
            </Button>
          )}
          <Button
            asChild
            variant="soft"
            size="4"
            className="w-full sm:w-auto"
          >
            <Link href="/lessons">公開中の授業を見る</Link>
          </Button>
        </Flex>
      </Flex>
    </main>
  );
}
