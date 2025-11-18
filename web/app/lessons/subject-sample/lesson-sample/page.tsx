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
  Tabs,
  Text,
} from "@radix-ui/themes";
import { Breadcrumb } from "@/components/common/Breadcrumb";

const videos = [
  { title: "動画01: SNSの危険性", duration: "12:34", status: "視聴済み" },
  { title: "動画02: 情報共有のマナー", duration: "08:20", status: "未視聴" },
];

const quizzes = [{ title: "小テストA", progress: 80, attempts: 2 }];

const extras = [{ title: "チェックリスト", type: "PDF", note: "投稿前の確認フロー" }];

export default function LessonSamplePage() {
  const breadcrumbs = [
    { label: "トップ", href: "/" },
    { label: "授業一覧", href: "/lessons" },
    { label: "情報リテラシー", href: "/lessons/subject-sample" },
    { label: "SNSと個人情報の守り方" },
  ];
  return (
    <Box className="bg-slate-50">
      <Section className="border-b border-slate-200 bg-white">
        <Flex direction="column" gap="3" className="mx-auto max-w-5xl">
          <Breadcrumb items={breadcrumbs} />
          <Heading size="8">SNSと個人情報の守り方</Heading>
          <Text color="gray">
            SNSで起こりがちな個人情報の拡散事故を事例ベースで学び、安全な投稿方法を考える授業です。
          </Text>
          <Flex gap="2">
            <Badge variant="soft">タグ: 情報モラル</Badge>
            <Badge variant="soft">公開中</Badge>
          </Flex>
        </Flex>
      </Section>

      <Section>
        <Flex direction="column" gap="5" className="mx-auto max-w-5xl">
          <Card variant="classic">
            <Flex justify="between" align="center">
              <Heading size="5">動画</Heading>
              <Text color="gray">{videos.length} 本</Text>
            </Flex>
            <Tabs.Root defaultValue={videos[0]?.title ?? ""} className="mt-4">
              <Tabs.List>
                {videos.map((video) => (
                  <Tabs.Trigger key={video.title} value={video.title}>
                    {video.title}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              {videos.map((video) => (
                <Tabs.Content key={video.title} value={video.title} className="mt-4">
                  <Card variant="ghost">
                    <Flex direction={{ initial: "column", md: "row" }} justify="between" align={{ initial: "start", md: "center" }}>
                      <div>
                        <Text weight="medium">{video.title}</Text>
                        <Text size="2" color="gray">
                          {video.duration}
                        </Text>
                      </div>
                      <Badge variant="soft">{video.status}</Badge>
                    </Flex>
                    <Box className="mt-4 h-64 rounded-xl bg-slate-200">
                      <Flex align="center" justify="center" className="h-full text-sm text-slate-600">
                        YouTubeプレイヤー（仮）
                      </Flex>
                    </Box>
                    <Text size="2" color="gray" className="mt-3">
                      動画をタブで切り替えて内容を確認できます。
                    </Text>
                  </Card>
                </Tabs.Content>
              ))}
            </Tabs.Root>
          </Card>

          <Card variant="classic">
            <Flex justify="between" align="center">
              <Heading size="5">小テスト</Heading>
              <Text color="gray">{quizzes.length} 件</Text>
            </Flex>
            <Flex direction="column" gap="3" mt="3">
              {quizzes.map((quiz) => (
                <Card key={quiz.title} variant="surface">
                  <Flex
                    justify="between"
                    direction={{ initial: "column", md: "row" }}
                    align={{ initial: "start", md: "center" }}
                    gap="3"
                  >
                    <div>
                      <Text weight="medium">{quiz.title}</Text>
                      <Text size="2" color="gray">
                        正答率 {quiz.progress}%
                      </Text>
                    </div>
                    <Flex direction="column" align={{ initial: "start", md: "end" }} gap="2">
                      <Text size="2" color="gray">
                        受験 {quiz.attempts} 回
                      </Text>
                      <Button asChild radius="full">
                        <Link href="/lessons/subject-sample/lesson-sample/quiz">小テストへ</Link>
                      </Button>
                    </Flex>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </Card>

          <Card variant="classic">
            <Heading size="5">その他教材</Heading>
            <Grid gap="3" mt="3">
              {extras.map((extra) => (
                <Card key={extra.title} variant="surface">
                  <Flex gap="4" justify="between" align="center">
                    <Flex gap="4" align="center">
                      <Text weight="medium">{extra.title}</Text>
                      <Text size="2" color="gray">
                        {extra.type} / {extra.note}
                      </Text>
                    </Flex>
                    <Button asChild radius="full">
                      <Link href="/lessons/subject-sample/lesson-sample/quiz">開く</Link>
                    </Button>
                  </Flex>
                </Card>
              ))}
            </Grid>
          </Card>
        </Flex>
      </Section>
    </Box>
  );
}
