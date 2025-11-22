import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";

const highlights = [
  { title: "公開授業", description: "科目ごとに整理された動画と小テストを自由に閲覧できます。" },
  { title: "学習ログ", description: "登録済みの生徒は視聴状況と小テスト結果を自分のダッシュボードで確認。" },
  { title: "教師管理", description: "教師専用の管理画面から科目・授業・生徒をまとめて更新。" },
];

const heroLinks = [
  { href: "/lessons", label: "授業一覧へ", accent: true },
  { href: "/login", label: "ログイン" },
];

export default function Home() {
  return (
    <Box>
      <Section size="3" className="text-center px-4">
        <HeroSection
          kicker={<Text className="tracking-[0.4em]">Polaris Link</Text>}
          title={
            <>
              学習コンテンツを公開し、ダッシュボードで進捗を共有するための
              <Text as="span" weight="bold" className="block">
                シンプルな教室ポータル
              </Text>
            </>
          }
          subtitle={
            <>トップページから公開授業を閲覧し、登録済みの生徒はログイン後に進捗記録や小テストを利用できます。
            教師は同じプラットフォームから科目・授業・生徒の管理を行います。</>
          }
          actions={
            heroLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                radius="full"
                variant={link.accent ? "solid" : "soft"}
                color={link.accent ? "blue" : "gray"}
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))
          }
          align="center"
        />
      </Section>

      <Section size="2" className="bg-white">
        <Grid
          columns={{ initial: "1", sm: "3" }}
          gap="4"
          className="mx-auto max-w-6xl"
        >
          {highlights.map((item) => (
            <Card key={item.title} variant="surface" className="text-left">
              <Flex direction="column" gap="2">
                <Heading size="4">{item.title}</Heading>
                <Text size="3" color="gray">
                  {item.description}
                </Text>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Section>
    </Box>
  );
}
