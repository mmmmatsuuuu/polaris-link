import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";
import { CircularProgress } from "@/components/ui/CircularProgress";

const tree = [
  {
    subject: "情報リテラシー",
    units: [
      {
        name: "デジタル基礎",
        lessons: [
          { title: "授業01", video: 100, quiz: 80 },
          { title: "授業02", video: 100, quiz: 80 },
          { title: "授業03", video: 100, quiz: 80 },
          { title: "授業04", video: 100, quiz: 80 },
          { title: "授業05", video: 100, quiz: 80 },
          { title: "授業06", video: 40, quiz: null },
        ],
      },
      {
        name: "デジタル化",
        lessons: [
          { title: "授業01", video: 100, quiz: 80 },
          { title: "授業02", video: 40, quiz: null },
        ],
      },
    ],
  },
  {
    subject: "理科探究",
    units: [
      {
        name: "化学反応",
        lessons: [{ title: "授業05", video: 20, quiz: 0 }],
      },
    ],
  },
];

export default function StudentSubjectUsagePage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker={<Link href="/student" className="text-sm text-sky-600 hover:underline">&lt; ダッシュボードに戻る</Link>}
          title="科目別利用状況"
          subtitle="期間: 2024/04/01 - 2024/04/30（UIモックのため固定表示）"
        />
      </Section>

      <Section>
        <Flex direction="column" gap="4" className="mx-auto max-w-6xl">
          {tree.map((subject) => (
            <Card key={subject.subject} variant="classic">
              <Heading size="5">{subject.subject}</Heading>
              <Flex direction="column" gap="3" mt="4">
                {subject.units.map((unit) => (
                  <Card key={unit.name} variant="surface">
                    <Text weight="medium">{unit.name}</Text>
                    <Flex gap="3" mt="3" wrap="nowrap" className="overflow-x-auto">
                      {unit.lessons.map((lesson) => {
                        const videoValue = lesson.video ?? 0;
                        const quizValue = lesson.quiz ?? 0;
                        return (
                          <Card key={lesson.title} variant="surface" className="flex min-w-[220px] p-4">
                            <Text weight="medium">{lesson.title}</Text>
                            <Flex gap="4" mt="3" align="center" wrap="wrap">
                              <CircularProgress value={videoValue} label="動画視聴率" color="#0ea5e9" />
                              {lesson.quiz === null ? (
                                <Badge variant="soft">未受験</Badge>
                              ) : (
                                <CircularProgress value={quizValue} label="テスト正答率" color="#10b981" />
                              )}
                            </Flex>
                            <Button mt="4" asChild radius="full">
                              <Link href="/lessons/subject-sample/lesson-sample">授業ページへ</Link>
                            </Button>
                          </Card>
                        );
                      })}
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </Card>
          ))}
        </Flex>
      </Section>
    </Box>
  );
}
