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
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { HeroSection } from "@/components/ui/HeroSection";

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

export default async function QuizPage({ params }: { params: { subjectId: string; lessonId: string } }) {
  const { subjectId, lessonId } = await params;
  const breadcrumbs = [
    { label: "トップ", href: "/" },
    { label: "授業一覧", href: "/lessons" },
    { label: "科目ページへ戻る", href: `/lessons/${subjectId}` },
    { label: "授業へ戻る", href: `/lessons/${subjectId}/${lessonId}` },
    { label: "小テスト" },
  ];
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-200 bg-slate-50 px-4">
        <HeroSection
          title="小テスト: SNSセキュリティチェック"
          kicker={ <Breadcrumb items={breadcrumbs} /> }
          subtitle="全5問 / 制限時間 5 分 / 再受験可。下記の「テストを開始」ボタンを押すと、各問題が一覧表示されます。"
          actions={
            <Flex gap="2">
              <Badge variant="soft">前回正答率 80%</Badge>
              <Badge variant="soft">受験 2 回</Badge>
            </Flex>
          }
          maxWidthClassName="max-w-4xl"
        />
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
                <Heading size="5">問題一覧</Heading>
                <Text size="2" color="gray">
                  以下の問題に回答してください。
                </Text>
                <Text size="2" color="gray">
                  このモックでは回答操作は行いません。
                </Text>
              </div>
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
          
          <Card>
            <Flex direction="column" gap="4">
              <Text>
                解答に問題がなければ、下記のボタンを押してテストを提出してください。
              </Text>
              <Button asChild radius="full">
                <Link href={`/lessons/${subjectId}/${lessonId}/quiz/result`}>
                  解答
                </Link>
              </Button>
            </Flex>
          </Card>
        </Flex>
      </Section>
    </Box>
  );
}
