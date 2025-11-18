import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";

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
    <Box className="bg-gradient-to-b from-slate-50 to-white">
      <Section size="3" className="text-center">
        <Flex direction="column" align="center" gap="5" className="mx-auto max-w-5xl">
          <Badge size="2" color="blue" radius="full" className="tracking-[0.4em]" variant="soft">
            Polaris Link
          </Badge>
          <Heading size="9" className="leading-tight text-slate-900">
            学習コンテンツを公開し、ダッシュボードで進捗を共有するための
            <Text as="span" color="blue" weight="bold" className="block">
              シンプルな教室ポータル
            </Text>
          </Heading>
          <Text size="4" color="gray" className="max-w-3xl">
            トップページから公開授業を閲覧し、登録済みの生徒はログイン後に進捗記録や小テストを利用できます。
            教師は同じプラットフォームから科目・授業・生徒の管理を行います。
          </Text>
          <Flex wrap="wrap" justify="center" gap="3">
            {heroLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                radius="full"
                variant={link.accent ? "solid" : "soft"}
                color={link.accent ? "blue" : "gray"}
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </Flex>
        </Flex>
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
