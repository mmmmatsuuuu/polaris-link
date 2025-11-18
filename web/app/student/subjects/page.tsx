import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";

const tree = [
  {
    subject: "情報リテラシー",
    units: [
      {
        name: "デジタル基礎",
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
      <Section className="border-b border-slate-100 bg-slate-50">
        <Flex direction="column" gap="2" className="mx-auto max-w-5xl">
          <Text color="gray">自分の学習状況</Text>
          <Heading size="7">科目別利用状況</Heading>
          <Text color="gray">期間: 2024/04/01 - 2024/04/30（UIモックのため固定表示）</Text>
        </Flex>
      </Section>

      <Section>
        <Flex direction="column" gap="4" className="mx-auto max-w-5xl">
          {tree.map((subject) => (
            <Card key={subject.subject} variant="classic">
              <Heading size="5">{subject.subject}</Heading>
              <Flex direction="column" gap="3" mt="4">
                {subject.units.map((unit) => (
                  <Card key={unit.name} variant="surface">
                    <Text weight="medium">{unit.name}</Text>
                    <Flex direction="column" gap="3" mt="3">
                      {unit.lessons.map((lesson) => (
                        <Card key={lesson.title} variant="surface">
                          <Text weight="medium">{lesson.title}</Text>
                          <Flex
                            direction={{ initial: "column", md: "row" }}
                            gap="4"
                            mt="2"
                          >
                            <div>
                              <Text size="1" color="gray">
                                動画視聴率
                              </Text>
                              <Box className="mt-2 h-2 rounded-full bg-slate-100">
                                <Box className="h-2 rounded-full bg-sky-500" style={{ width: `${lesson.video}%` }} />
                              </Box>
                              <Text size="1" color="gray">
                                {lesson.video}%
                              </Text>
                            </div>
                            <div>
                              <Text size="1" color="gray">
                                小テスト正答率
                              </Text>
                              {lesson.quiz === null ? (
                                <Badge variant="soft" mt="2">
                                  未受験
                                </Badge>
                              ) : (
                                <>
                                  <Box className="mt-2 h-2 rounded-full bg-slate-100">
                                    <Box className="h-2 rounded-full bg-emerald-500" style={{ width: `${lesson.quiz}%` }} />
                                  </Box>
                                  <Text size="1" color="gray">
                                    {lesson.quiz}%
                                  </Text>
                                </>
                              )}
                            </div>
                          </Flex>
                        </Card>
                      ))}
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
