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
import { HeroSection } from "@/components/ui/HeroSection";

const stats = [
  { label: "公開授業", value: 24 },
  { label: "今月の学習ログ", value: 132 },
  { label: "小テスト実施", value: 58 },
];

const activities = [
  { label: "CSVインポート (授業)", detail: "成功 15件", time: "10:12" },
  { label: "授業公開: SNSセキュリティ", detail: "公開済みに変更", time: "09:40" },
];

export default function TeacherDashboardPage() {
  return (
    <Box className="bg-slate-50">
      <Section className="border-b border-slate-100 bg-white px-4">
        <HeroSection
          kicker={<Badge variant="soft">教師ダッシュボード</Badge>}
          title="生徒の状況を俯瞰"
          subtitle="概要カードから公開授業・ログ数を確認し、下部のリンクで詳細ページへ遷移します。"
          actions={
            <Flex gap="2" wrap="wrap">
              <Button asChild>
                <Link href="/teacher/subjects">科目利用状況</Link>
              </Button>
              <Button asChild variant="soft">
                <Link href="/teacher/students">生徒別利用状況</Link>
              </Button>
            </Flex>
          }
        />
      </Section>

      <Section>
        <Grid className="mx-auto max-w-6xl" columns={{ initial: "1", md: "3" }} gap="4">
          {stats.map((stat) => (
            <Card key={stat.label} variant="classic" className="text-center">
              <Text color="gray">{stat.label}</Text>
              <Heading size="6">{stat.value}</Heading>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section>
        <Card variant="classic" className="mx-auto max-w-6xl">
          <Heading size="5">最近の活動</Heading>
          <Flex direction="column" gap="3" mt="4">
            {activities.map((activity) => (
              <Card key={activity.label} variant="surface">
                <Flex justify="between" align="center">
                  <div>
                    <Text weight="medium">{activity.label}</Text>
                    <Text color="gray">{activity.detail}</Text>
                  </div>
                  <Text size="2" color="gray">
                    {activity.time}
                  </Text>
                </Flex>
              </Card>
            ))}
          </Flex>
        </Card>
      </Section>
    </Box>
  );
}
