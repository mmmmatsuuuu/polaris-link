import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";

const subjects = [
  {
    name: "情報リテラシー",
    completion: 72,
    quizAccuracy: 68,
    units: [
      { name: "デジタル基礎", completion: 80, quizAccuracy: 70 },
      { name: "情報モラル", completion: 60, quizAccuracy: 65 },
    ],
  },
  {
    name: "理科探究",
    completion: 54,
    quizAccuracy: 62,
    units: [{ name: "化学反応", completion: 50, quizAccuracy: 58 }],
  },
];

export default function TeacherSubjectUsagePage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50">
        <Flex direction="column" gap="2" className="mx-auto max-w-6xl">
          <Text color="gray">集計</Text>
          <Heading size="7">科目別利用状況</Heading>
          <Text color="gray">フィルター: 科目=すべて / 期間=今月（UIモック）</Text>
        </Flex>
      </Section>

      <Section>
        <Flex direction="column" gap="4" className="mx-auto max-w-6xl">
          {subjects.map((subject) => (
            <Card key={subject.name} variant="classic">
              <Flex justify="between" align={{ initial: "start", md: "center" }} direction={{ initial: "column", md: "row" }} gap="3">
                <div>
                  <Heading size="5">{subject.name}</Heading>
                  <Text color="gray">
                    完了率 {subject.completion}% / 小テスト正答率 {subject.quizAccuracy}%
                  </Text>
                </div>
                <Flex gap="2" wrap="wrap">
                  <Badge variant="soft">公開中</Badge>
                  <Badge variant="soft">閲覧 230 件</Badge>
                </Flex>
              </Flex>
              <Flex direction="column" gap="2" mt="4">
                {subject.units.map((unit) => (
                  <Card key={unit.name} variant="surface">
                    <Text weight="medium">{unit.name}</Text>
                    <Text size="2" color="gray">
                      完了率 {unit.completion}% / 正答率 {unit.quizAccuracy}%
                    </Text>
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
