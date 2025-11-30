"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Flex, Text } from "@radix-ui/themes";
import { useAuth } from "@/context/AuthProvider";

type LoginPromptProps = {
  variant?: "card" | "inline" | "button";
  redirectOnLogin?: boolean;
};

export default function LoginPrompt({
  variant = "card",
  redirectOnLogin = true,
}: LoginPromptProps) {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  if (loading || user) {
    return null;
  }

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      if (redirectOnLogin) {
        router.push("/");
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  if (variant === "button") {
    return (
      <Button onClick={handleLogin} size="3">
        Googleでログイン
      </Button>
    );
  }

  const content = (
    <Flex
      direction={{ initial: "column", sm: "row" }}
      gap="4"
      align="start"
      justify="between"
    >
      <Flex direction="column" gap="2" flexGrow="1">
        <Text size="5" weight="medium">
          学習ログを残すにはログインが必要です
        </Text>
        <Text size="2" color="gray">
          Googleアカウントでサインインすると視聴履歴や小テスト結果を保存できます。
        </Text>
      </Flex>
      <Flex direction={{ initial: "column", sm: "row" }} gap="3">
        <Button onClick={handleLogin} size="3">
          Googleでログイン
        </Button>
        <Button asChild variant="soft" size="3">
          <Link href="/">ログイン画面へ</Link>
        </Button>
      </Flex>
    </Flex>
  );

  if (variant === "inline") {
    return (
      <Card variant="classic" size="3">
        {content}
      </Card>
    );
  }

  return (
    <Card variant="surface" size="4">
      {content}
    </Card>
  );
}
