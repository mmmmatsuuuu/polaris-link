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

const progressCards = [
  { subject: "情報リテラシー", completed: 6, total: 10 },
  { subject: "理科探究", completed: 4, total: 8 },
];

const timeline = [
  { time: "09:00", label: "SNSセキュリティ動画を視聴", type: "動画" },
  { time: "09:20", label: "小テストA 80%", type: "小テスト" },
  { time: "10:00", label: "理科: 化学反応授業を開始", type: "動画" },
];

export default function StudentDashboardPage() {
  return (
    <Box className="bg-slate-50">
      <Section className="border-b border-slate-100 bg-white">
        <Flex
          direction={{ initial: "column", md: "row" }}
          justify="between"
          align={{ initial: "start", md: "center" }}
          className="mx-auto max-w-6xl"
          gap="4"
        >
          <div>
            <Text color="gray">こんにちは、山田さん</Text>
            <Heading size="7">今期の学習時間 12h 30m</Heading>
            <Text color="gray">最近の学習ログと未完了コンテンツを確認できます。</Text>
          </div>
          <Button asChild radius="full">
            <Link href="/student/subjects">科目利用状況ページへ</Link>
          </Button>
        </Flex>
      </Section>

      <Section>
        <Grid className="mx-auto max-w-6xl" gap="4" columns={{ initial: "1", md: "2" }}>
          <Card variant="classic">
            <Heading size="5">教師からのお知らせ</Heading>
            <Text mt="2" color="gray">
              5月の小テストは5/20(月)までに受験してください。疑問点は教師ページのメッセージフォームから連絡してください。
            </Text>
          </Card>
          <Card variant="classic">
            <Heading size="5">最近の学習履歴</Heading>
            <Flex direction="column" gap="3" mt="4">
              {timeline.map((entry) => (
                <Card key={entry.time} variant="surface">
                  <Flex justify="between" align="center">
                    <div>
                      <Text weight="medium">{entry.label}</Text>
                      <Text color="gray">{entry.time}</Text>
                    </div>
                    <Badge variant="soft">{entry.type}</Badge>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </Card>
        </Grid>
      </Section>

      <Section>
        <Heading size="5" className="pb-6 text-center">科目別進捗状況</Heading>
        <Grid className="mx-auto max-w-6xl" gap="4" columns={{ initial: "1" }}>
          {progressCards.map((card) => (
            <Card key={card.subject} variant="classic">
              <Text color="gray">科目</Text>
              <Heading size="5">{card.subject}</Heading>
              <Box className="mt-4 h-2 rounded-full bg-slate-100">
                <Box
                  className="h-2 rounded-full bg-sky-500"
                  style={{ width: `${Math.round((card.completed / card.total) * 100)}%` }}
                />
              </Box>
              <Text mt="2" color="gray">
                完了 {card.completed} / {card.total}
              </Text>
            </Card>
          ))}
        </Grid>
      </Section>
    </Box>
  );
}
