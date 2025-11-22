import Link from "next/link";
import { Box, Card, Flex, Grid, Heading, Section, Text } from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";

const students = Array.from({ length: 40 }).map((_, index) => {
  const progressValue = (index * 7) % 100;
  const quizValue = (index * 11) % 100;
  return {
    name: `学生 ${index + 1}`,
    lastActive: index % 2 === 0 ? "今日" : "昨日",
    progress: `${progressValue}%`,
    quizzes: `${quizValue}%`,
  };
});

const focusStudent = {
  name: "山田 花子",
  subjects: [
    {
      name: "情報リテラシー",
      units: [
        { unit: "デジタル基礎", progress: "80%" },
        { unit: "情報モラル1", progress: "60%" },
        { unit: "情報モラル2", progress: "60%" },
        { unit: "情報モラル3", progress: "60%" },
        { unit: "情報モラル4", progress: "60%" },
      ],
      quizAccuracy: "75%",
    },
    {
      name: "理科探究",
      units: [{ unit: "化学反応", progress: "40%" }],
      quizAccuracy: "55%",
    },
  ],
};

export default function TeacherStudentUsagePage() {
  return (
    <Box className="bg-slate-50">
      <Section className="border-b border-slate-100 bg-white px-4">
        <HeroSection
          kicker="生徒別"
          title="個別利用状況"
          subtitle="検索・並び替え（UIモック）: 氏名/最終ログイン/学習時間"
          actions={<Link href="/teacher">教師ダッシュボードに戻る</Link>}
        />
      </Section>

      <Section className="px-0">
        <Grid className="mx-auto max-w-6xl" gap="4" columns={{ initial: "1", md: "2" }}>
          <div>
            <div className="sticky top-24">
              <Card variant="classic">
                <Heading size="5">詳細ドロワー</Heading>
                <Flex direction="column" gap="3" mt="4">
                  <Card variant="surface">
                    <Heading size="5">{focusStudent.name}</Heading>
                    {focusStudent.subjects.map((subject) => (
                      <Box key={subject.name} className="mt-4">
                        <Text weight="medium">{subject.name}</Text>
                        <Flex gap="3" mt="3" wrap="nowrap" className="overflow-x-auto">
                          {subject.units.map((unit) => {
                            const progressValue = parseInt(unit.progress.replace("%", ""), 10) || 0;
                            const quizValue = parseInt(subject.quizAccuracy.replace("%", ""), 10) || 0;
                            return (
                              <Card key={unit.unit} variant="surface" className="flex min-w-[180px] p-4">
                                <Text size="2" color="gray">{unit.unit}</Text>
                                <Flex gap="4" mt="3" align="center" wrap="wrap">
                                  <CircularProgress value={progressValue} label="進捗" color="#0ea5e9" />
                                  <CircularProgress value={quizValue} label="小テスト" color="#10b981" />
                                </Flex>
                              </Card>
                            );
                          })}
                        </Flex>
                      </Box>
                    ))}
                  </Card>
                </Flex>
              </Card>
            </div>
          </div>

          <Card variant="classic">
            <Heading size="5">生徒一覧</Heading>
            <Flex direction="column" gap="3" mt="4">
              {students.map((student) => (
                <Card key={student.name} variant="surface">
                  <Flex justify="between" align="center">
                    <div>
                      <Text weight="medium">{student.name}</Text>
                      <Text size="2" color="gray">最終 {student.lastActive}</Text>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <Text size="1" color="gray">進捗 {student.progress}</Text>
                      <Text size="1" color="gray">正答率 {student.quizzes}</Text>
                    </div>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </Card>
        </Grid>
      </Section>
    </Box>
  );
}

type CircularProgressProps = {
  value: number;
  label: string;
  color: string;
};

function CircularProgress({ value, label, color }: CircularProgressProps) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <Flex direction="column" align="center" gap="1">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full bg-slate-100" />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${color} ${normalized}%, #e2e8f0 ${normalized}% 100%)`,
          }}
        />
        <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700">
          {normalized}%
        </div>
      </div>
      <Text size="1" color="gray">
        {label}
      </Text>
    </Flex>
  );
}
