import Link from "next/link";
import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import {
  Badge,
  Box,
  Button,
  Card,
  Code,
  Flex,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { HeroSection } from "@/components/ui/HeroSection";
import { db } from "@/lib/firebase/server";

type QuizContent = {
  id: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  publishStatus?: string;
};

type QuizQuestion = {
  id: string;
  questionType?: string;
  prompt?: string;
  choices?: unknown;
};

async function fetchQuizData(lessonId: string, quizId: string) {
  const contentSnap = await getDoc(doc(db, "contents", quizId));
  if (!contentSnap.exists()) {
    notFound();
  }

  const contentData = contentSnap.data();
  if (contentData.type !== "quiz") {
    notFound();
  }
  if (contentData.lessonId && contentData.lessonId !== lessonId) {
    notFound();
  }

  const metadata = (contentData.metadata ?? {}) as {
    questionIds?: unknown;
  };
  const questionIds = Array.isArray(metadata.questionIds)
    ? metadata.questionIds.filter((value): value is string => typeof value === "string")
    : [];

  const questionSnaps = await Promise.all(
    questionIds.map((questionId) => getDoc(doc(db, "questions", questionId))),
  );

  const questions: QuizQuestion[] = questionSnaps
    .filter((snap) => snap.exists())
    .map((snap) => {
      const data = snap.data();
      return {
        id: snap.id,
        questionType: (data.questionType as string) ?? "",
        prompt: (data.prompt as string) ?? "",
        choices: data.choices,
      };
    });

  const content: QuizContent = {
    id: contentSnap.id,
    title: (contentData.title as string) ?? "",
    description: (contentData.description as string) ?? "",
    metadata: contentData.metadata as Record<string, unknown>,
    publishStatus: (contentData.publishStatus as string) ?? "",
  };

  return { content, questions };
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="mt-3 overflow-auto rounded border border-slate-200 bg-slate-50 p-3 text-xs">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default async function QuizPage({
  params,
}: {
  params: { subjectId: string; lessonId: string; quizId: string };
}) {
  const { subjectId, lessonId, quizId } = await params;
  const { content, questions } = await fetchQuizData(lessonId, quizId);

  const breadcrumbs = [
    { label: "トップ", href: "/" },
    { label: "授業一覧", href: "/lessons" },
    { label: "科目ページへ戻る", href: `/lessons/${subjectId}` },
    { label: "授業へ戻る", href: `/lessons/${subjectId}/${lessonId}` },
    { label: content.title || "小テスト" },
  ];

  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-200 bg-slate-50 px-4">
        <HeroSection
          title={content.title || "小テスト"}
          subtitle={content.description || "取得したデータを確認するためのページです。"}
          kicker={<Breadcrumb items={breadcrumbs} />}
          actions={
            <Flex gap="2" wrap="wrap">
              <Badge variant="soft">quizId: {quizId}</Badge>
              <Badge variant="soft" color={content.publishStatus === "public" ? "green" : "gray"}>
                {content.publishStatus || "unknown"}
              </Badge>
            </Flex>
          }
          maxWidthClassName="max-w-4xl"
        />
      </Section>

      <Section>
        <Flex direction="column" gap="4" className="mx-auto max-w-4xl">
          <Card variant="classic">
            <Heading size="4">contentドキュメント</Heading>
            <Text color="gray" size="2">
              Firestoreから取得した内容です。
            </Text>
            <JsonBlock value={content} />
          </Card>

          <Card variant="classic">
            <Heading size="4">questionsコレクション</Heading>
            <Text color="gray" size="2">
              metadata.questionIds で取得した問題一覧（先頭数件のみ表示）。
            </Text>
            {questions.length === 0 ? (
              <Text mt="2" color="gray">
                取得できる問題がありません。
              </Text>
            ) : (
              <Flex direction="column" gap="3" mt="3">
                {questions.map((question) => (
                  <Card key={question.id} variant="surface">
                    <Flex gap="2" align="center" justify="between">
                      <Text size="2" weight="medium">
                        {question.prompt || "(no prompt)"}
                      </Text>
                      <Code>{question.questionType}</Code>
                    </Flex>
                    {question.choices && <JsonBlock value={question.choices} />}
                  </Card>
                ))}
              </Flex>
            )}
          </Card>

          <Card variant="surface">
            <Flex direction="column" gap="3">
              <Text color="gray" size="2">
                この時点では動作確認用の表示のみです。
              </Text>
              <Button asChild radius="full">
                <Link href={`/lessons/${subjectId}/${lessonId}/${quizId}/result`}>結果ページ（モック）へ</Link>
              </Button>
            </Flex>
          </Card>
        </Flex>
      </Section>
    </Box>
  );
}
