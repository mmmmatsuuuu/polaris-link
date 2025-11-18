import { Box, Card, Flex, Heading, Section, Text } from "@radix-ui/themes";

const students = [
  { name: "山田 花子", lastActive: "今日", progress: "65%", quizzes: "70%" },
  { name: "佐藤 太郎", lastActive: "昨日", progress: "40%", quizzes: "55%" },
];

const focusStudent = {
  name: "山田 花子",
  logs: [
    { label: "動画視聴", value: "12本" },
    { label: "小テスト", value: "4回" },
  ],
  weakPoints: ["SNSの危険性", "情報モラル"],
};

export default function TeacherStudentUsagePage() {
  return (
    <Box className="bg-slate-50">
      <Section className="border-b border-slate-100 bg-white">
        <Flex direction="column" gap="2" className="mx-auto max-w-6xl">
          <Text color="gray">生徒別</Text>
          <Heading size="7">個別利用状況</Heading>
          <Text color="gray">検索・並び替え（UIモック）: 氏名/最終ログイン/学習時間</Text>
        </Flex>
      </Section>

      <Section className="px-0">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
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

          <Card variant="classic">
            <Heading size="5">詳細ドロワー例</Heading>
            <Text size="2" color="gray">選択中: {focusStudent.name}</Text>
            <Flex direction="column" gap="3" mt="4">
              {focusStudent.logs.map((log) => (
                <Card key={log.label} variant="surface">
                  <Text size="1" color="gray">
                    {log.label}
                  </Text>
                  <Heading size="5">{log.value}</Heading>
                </Card>
              ))}
            </Flex>
            <Box mt="4">
              <Text weight="medium">誤答が多い問題</Text>
              <Flex direction="column" gap="1" mt="2">
                {focusStudent.weakPoints.map((point) => (
                  <Text key={point} size="2" color="gray">
                    ・{point}
                  </Text>
                ))}
              </Flex>
            </Box>
          </Card>
        </div>
      </Section>
    </Box>
  );
}
