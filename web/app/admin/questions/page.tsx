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

const questions = [
  { prompt: "SNS投稿前に確認する項目は?", type: "選択", difficulty: "★☆☆", status: "公開" },
  { prompt: "危険な投稿例を挙げよ", type: "記述", difficulty: "★★☆", status: "公開" },
];

export default function QuestionAdminPage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Text color="gray">管理</Text>
            <Heading size="7">問題管理</Heading>
            <Text color="gray">小テスト問題の編集やプレビューのUI例です。</Text>
          </div>
          <div className="flex gap-2">
            <Button radius="full">問題を追加</Button>
            <Button asChild radius="full" variant="soft">
              <Link href="/admin/questions/bulk">一括登録</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <Flex direction="column" gap="3" className="mx-auto max-w-6xl">
          {questions.map((question) => (
            <Card key={question.prompt} variant="classic">
              <Flex justify="between" align={{ initial: "start", md: "center" }} direction={{ initial: "column", md: "row" }}>
                <div>
                  <Text size="2" color="gray">
                    {question.type} / 難易度 {question.difficulty}
                  </Text>
                  <Heading size="4">{question.prompt}</Heading>
                </div>
                <Badge variant="soft" color="green">
                  {question.status}
                </Badge>
              </Flex>
            </Card>
          ))}
        </Flex>
      </Section>
    </Box>
  );
}
