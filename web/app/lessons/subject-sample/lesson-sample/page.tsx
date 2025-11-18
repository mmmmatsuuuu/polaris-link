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

const videos = [
  { title: "動画01: SNSの危険性", duration: "12:34", status: "視聴済み" },
  { title: "動画02: 情報共有のマナー", duration: "08:20", status: "未視聴" },
];

const quizzes = [{ title: "小テストA", progress: 80, attempts: 2 }];

const extras = [{ title: "チェックリスト", type: "PDF", note: "投稿前の確認フロー" }];

export default function LessonSamplePage() {
  return (
    <Box className="bg-slate-50">
      <Section className="border-b border-slate-200 bg-white">
        <Flex direction="column" gap="3" className="mx-auto max-w-5xl">
          <Link href="/lessons/subject-sample" className="text-sm text-slate-500">
            ← 情報リテラシーに戻る
          </Link>
          <Badge color="blue" radius="full">
            授業
          </Badge>
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
            <Flex direction="column" gap="3" mt="3">
              {videos.map((video) => (
                <Card key={video.title} variant="surface">
                  <Flex justify="between" align={{ initial: "start", md: "center" }} direction={{ initial: "column", md: "row" }}>
                    <div>
                      <Text weight="medium">{video.title}</Text>
                      <Text size="2" color="gray">
                        {video.duration}
                      </Text>
                    </div>
                    <Badge variant="soft">{video.status}</Badge>
                  </Flex>
                </Card>
              ))}
            </Flex>
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
                  <Text weight="medium">{extra.title}</Text>
                  <Text size="2" color="gray">
                    {extra.type} / {extra.note}
                  </Text>
                </Card>
              ))}
            </Grid>
          </Card>
        </Flex>
      </Section>
    </Box>
  );
}
