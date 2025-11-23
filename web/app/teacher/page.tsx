import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";
import { CardList } from "@/components/ui/CardList";

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
        <div className="mx-auto max-w-6xl">
          <CardList
            columns={{ initial: "1", md: "3" }}
            items={stats.map((stat) => ({
              title: <Text color="gray">{stat.label}</Text>,
              description: <Heading size="6">{stat.value}</Heading>,
            }))}
          />
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-6xl">
          <Heading size="5" mb="3">最近の活動</Heading>
          <CardList
            items={activities.map((activity) => ({
              title: <Text weight="medium">{activity.label}</Text>,
              description: <Text color="gray">{activity.detail}</Text>,
              meta: (
                <Text size="2" color="gray">
                  {activity.time}
                </Text>
              ),
            }))}
          />
        </div>
      </Section>
    </Box>
  );
}
