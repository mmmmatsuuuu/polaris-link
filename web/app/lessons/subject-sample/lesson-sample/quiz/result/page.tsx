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

const summary = {
  score: 4,
  total: 5,
  accuracy: 80,
  time: "4分12秒",
};

const questions = [
  {
    prompt: "SNSに投稿する前に確認すべきことは?",
    answer: "個人情報が含まれていないか",
    explanation: "個人情報の公開可否を第三者視点でチェックする。",
    correct: true,
  },
  {
    prompt: "パスワードを共有してよい相手は?",
    answer: "誰にも共有しない",
    explanation: "ID/パスワードは家族間でも共有しない。",
    correct: true,
  },
  {
    prompt: "公開範囲が限定されている投稿は安全か?",
    answer: "キャプチャで拡散されるため油断は禁物",
    explanation: "限定公開でもスクリーンショットで広がることを説明。",
    correct: false,
  },
];

export default function QuizResultPage() {
  return (
    <Box className="bg-slate-50">
      <Section className="border-b border-slate-200 bg-white">
        <Flex
          className="mx-auto max-w-4xl"
          direction={{ initial: "column", md: "row" }}
          justify="between"
          align={{ initial: "start", md: "center" }}
          gap="4"
        >
          <div>
            <Text color="gray">採点結果</Text>
            <Heading size="7">SNSセキュリティチェック</Heading>
            <Text color="gray">受験日時: 2024/04/12 10:00</Text>
          </div>
          <Flex direction="column" gap="2" align={{ initial: "start", md: "end" }}>
            <Text color="gray">
              正答率 {summary.accuracy}% ({summary.score}/{summary.total})
            </Text>
            <Text color="gray">所要時間 {summary.time}</Text>
            <Button asChild variant="ghost">
              <Link href="/lessons/subject-sample/lesson-sample/quiz">再受験する</Link>
            </Button>
          </Flex>
        </Flex>
      </Section>

      <Section>
        <Flex direction="column" gap="4" className="mx-auto max-w-4xl">
          {questions.map((question, index) => (
            <Card key={question.prompt} variant="classic">
              <Flex justify="between" align="center">
                <Text size="1" color="gray" className="uppercase tracking-wide">
                  問題 {index + 1}
                </Text>
                <Badge
                  color={question.correct ? "green" : "red"}
                  variant="soft"
                  radius="full"
                >
                  {question.correct ? "正解" : "不正解"}
                </Badge>
              </Flex>
              <Heading size="4" mt="2">
                {question.prompt}
              </Heading>
              <Text mt="2" color="gray">
                あなたの回答: {question.answer}
              </Text>
              <Card variant="surface" mt="3">
                <Text size="2" color="gray">
                  {question.explanation}
                </Text>
              </Card>
            </Card>
          ))}
        </Flex>
      </Section>
    </Box>
  );
}
