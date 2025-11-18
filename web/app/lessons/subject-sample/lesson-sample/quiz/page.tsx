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
  {
    prompt: "SNSに投稿する前に確認すべきことは?",
    choices: ["個人情報が含まれていないか", "写真の色味", "投稿時間"],
  },
  {
    prompt: "パスワードを共有してよい相手は?",
    choices: ["親しい友人", "システム管理者", "誰にも共有しない"],
  },
];

export default function QuizPage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-200 bg-slate-50">
        <Flex direction="column" gap="3" className="mx-auto max-w-4xl">
          <Link href="/lessons/subject-sample/lesson-sample" className="text-sm text-slate-500">
            ← 授業ページに戻る
          </Link>
          <Heading size="7">小テスト: SNSセキュリティチェック</Heading>
          <Text color="gray">
            全5問 / 制限時間 5 分 / 再受験可。下記の「テストを開始」ボタンを押すと、各問題が一覧表示されます。
          </Text>
          <Flex gap="2">
            <Badge variant="soft">前回正答率 80%</Badge>
            <Badge variant="soft">受験 2 回</Badge>
          </Flex>
        </Flex>
      </Section>

      <Section>
        <Flex direction="column" gap="5" className="mx-auto max-w-4xl">
          <Card variant="classic">
            <Flex
              direction={{ initial: "column", md: "row" }}
              justify="between"
              align={{ initial: "start", md: "center" }}
              gap="3"
            >
              <div>
                <Text color="gray">テスト開始</Text>
                <Heading size="5">問題一覧</Heading>
                <Text size="2" color="gray">
                  このモックでは回答操作は行いません。
                </Text>
              </div>
              <Button asChild radius="full">
                <Link href="/lessons/subject-sample/lesson-sample/quiz/result">
                  テストを開始（結果ページ例へ）
                </Link>
              </Button>
            </Flex>
          </Card>

          <Flex direction="column" gap="4">
            {questions.map((question, index) => (
              <Card key={question.prompt} variant="classic">
                <Text size="1" color="gray" className="uppercase tracking-wide">
                  問題 {index + 1}
                </Text>
                <Heading size="4" mt="2">
                  {question.prompt}
                </Heading>
                <Flex direction="column" gap="2" mt="3">
                  {question.choices.map((choice) => (
                    <Card key={choice} variant="surface">
                      <Text>{choice}</Text>
                    </Card>
                  ))}
                </Flex>
              </Card>
            ))}
          </Flex>
        </Flex>
      </Section>
    </Box>
  );
}
