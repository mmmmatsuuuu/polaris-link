import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";
import { CircularProgress } from "@/components/ui/CircularProgress";

const subjects = [
  {
    name: "情報リテラシー",
    completion: 72,
    quizAccuracy: 68,
    units: [
      { name: "デジタル基礎", completion: 80, quizAccuracy: 70 },
      { name: "デジタル基礎1", completion: 80, quizAccuracy: 70 },
      { name: "デジタル基礎2", completion: 80, quizAccuracy: 70 },
      { name: "デジタル基礎3", completion: 80, quizAccuracy: 70 },
      { name: "デジタル基礎4", completion: 80, quizAccuracy: 70 },
      { name: "デジタル基礎5", completion: 80, quizAccuracy: 70 },
      { name: "デジタル基礎6", completion: 80, quizAccuracy: 70 },
      { name: "デジタル基礎7", completion: 80, quizAccuracy: 70 },
      { name: "デジタル基礎8", completion: 80, quizAccuracy: 70 },
      { name: "デジタル基礎9", completion: 80, quizAccuracy: 70 },
      { name: "デジタル基礎10", completion: 80, quizAccuracy: 70 },
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
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker="集計"
          title="科目別利用状況"
          subtitle="フィルターで科目や期間を絞り込めます。"
        />
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
              <Flex direction="row" gap="2" mt="4" className="overflow-x-auto">
                {subject.units.map((unit) => (
                  <Card key={unit.name} variant="surface" className="min-w-[220px]">
                    <Text weight="medium">{unit.name}</Text>
                    <Flex gap="3" mt="3" wrap="wrap">
                      <CircularProgress
                        value={unit.completion}
                        label="完了率"
                        color="#0ea5e9"
                      />
                      <CircularProgress
                        value={unit.quizAccuracy}
                        label="正答率"
                        color="#10b981"
                      />
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
