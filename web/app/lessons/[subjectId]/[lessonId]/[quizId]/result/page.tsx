"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Section,
  Text,
} from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";
import { MarkdownContent } from "@/components/ui/MarkdownContent";

type QuizContent = {
  id: string;
  title: string;
  description?: string;
  publishStatus?: string;
  metadata?: Record<string, unknown>;
};

type QuizQuestion = {
  id: string;
  questionType?: string;
  prompt?: string;
  choices?: unknown;
  correctAnswer?: unknown;
  explanation?: string;
};

type AttemptData = {
  selectedQuestionIds?: string[];
  answers?: Record<string, string | string[]>;
  startedAt?: number;
  finishedAt?: number;
};

type EvaluatedQuestion = {
  id: string;
  questionType: string;
  prompt: string;
  explanation?: string;
  choices?: string[];
  correctAnswer?: string | string[];
  userAnswer?: string | string[];
  isCorrect: boolean;
};

type Summary = {
  total: number;
  correct: number;
  accuracy: number;
  timeMs?: number;
};

function loadAttemptFromStorage(quizId: string): AttemptData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`quizAttempt:${quizId}`);
    if (!raw) return null;
    return JSON.parse(raw) as AttemptData;
  } catch (error) {
    console.warn("Failed to load attempt from storage", error);
    return null;
  }
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim())
    : [];
}

function isSetEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size !== setB.size) return false;
  return Array.from(setA).every((item) => setB.has(item));
}

function isArrayEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

function evaluateQuestion(question: QuizQuestion, answer: unknown): EvaluatedQuestion {
  const questionType = question.questionType ?? "";
  const userAnswerRaw =
    typeof answer === "string" || Array.isArray(answer) ? answer : undefined;

  const correctAnswer =
    typeof question.correctAnswer === "string" || Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : undefined;

  let isCorrect = false;

  if (questionType === "multipleChoice") {
    const expected = normalizeArray(correctAnswer);
    const user = normalizeArray(userAnswerRaw);
    if (expected.length > 1) {
      isCorrect = isSetEqual(expected, user);
    } else {
      isCorrect = expected[0] === normalizeString(userAnswerRaw);
    }
  } else if (questionType === "ordering") {
    const expected = normalizeArray(correctAnswer);
    const user = normalizeArray(userAnswerRaw);
    isCorrect = isArrayEqual(expected, user);
  } else if (questionType === "shortAnswer") {
    const expected =
      typeof correctAnswer === "string" ? normalizeString(correctAnswer).toLowerCase() : "";
    const user =
      typeof userAnswerRaw === "string" ? normalizeString(userAnswerRaw).toLowerCase() : "";
    isCorrect = expected.length > 0 && expected === user;
  }

  return {
    id: question.id,
    questionType,
    prompt: question.prompt ?? "",
    explanation: question.explanation,
    choices: normalizeArray(question.choices),
    correctAnswer,
    userAnswer: userAnswerRaw as string | string[] | undefined,
    isCorrect,
  };
}

export default function QuizResultPage({
  params,
}: {
  params: { subjectId: string; lessonId: string; quizId: string };
}) {
  const routeParams = useParams<{ subjectId: string; lessonId: string; quizId: string }>();
  const { subjectId, lessonId, quizId } = useMemo(
    () => ({
      subjectId: routeParams?.subjectId ?? "",
      lessonId: routeParams?.lessonId ?? "",
      quizId: routeParams?.quizId ?? "",
    }),
    [routeParams?.subjectId, routeParams?.lessonId, routeParams?.quizId],
  );

  const [content, setContent] = useState<QuizContent | null>(null);
  const [evaluated, setEvaluated] = useState<EvaluatedQuestion[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [status, setStatus] = useState<string>("loading");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setStatus("loading");
      const attempt = loadAttemptFromStorage(quizId) ?? {};

      const contentRes = await fetch(`/api/contents/${quizId}`);
      if (contentRes.status === 404) {
        setStatus("not-found");
        return;
      }
      if (!contentRes.ok) {
        throw new Error("failed to fetch content");
      }
      const contentData = await contentRes.json();
      const metadata = (contentData.metadata ?? {}) as {
        questionIds?: unknown;
        questionsPerAttempt?: unknown;
      };
      const questionIds = Array.isArray(metadata.questionIds)
        ? metadata.questionIds.filter((id): id is string => typeof id === "string")
        : [];

      const targetIds =
        (attempt.selectedQuestionIds?.length ? attempt.selectedQuestionIds : questionIds) ?? [];
      const questionsPerAttempt =
        typeof metadata.questionsPerAttempt === "number" && metadata.questionsPerAttempt > 0
          ? metadata.questionsPerAttempt
          : targetIds.length;
      const limitedIds = targetIds.slice(0, questionsPerAttempt);

      let questions: QuizQuestion[] = [];
      if (limitedIds.length > 0) {
        const params = new URLSearchParams();
        limitedIds.forEach((id) => params.append("ids", id));
        const questionsRes = await fetch(`/api/questions?${params.toString()}`);
        if (!questionsRes.ok) {
          throw new Error("failed to fetch questions");
        }
        const payload = await questionsRes.json();
        questions = Array.isArray(payload.questions)
          ? payload.questions.map((doc: any) => ({
              id: doc.id as string,
              questionType: (doc.questionType as string) ?? "",
              prompt: (doc.prompt as string) ?? "",
              choices: doc.choices,
              correctAnswer: doc.correctAnswer,
              explanation: (doc.explanation as string) ?? "",
            }))
          : [];
      }

      const evaluatedQuestions = questions.map((q) =>
        evaluateQuestion(q, attempt.answers?.[q.id]),
      );

      const correct = evaluatedQuestions.filter((q) => q.isCorrect).length;
      const total = evaluatedQuestions.length;
      const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

      if (!mounted) return;
      setEvaluated(evaluatedQuestions);
      setSummary({
        total,
        correct,
        accuracy,
        timeMs:
          typeof attempt.startedAt === "number" && typeof attempt.finishedAt === "number"
            ? attempt.finishedAt - attempt.startedAt
            : undefined,
      });
      setContent({
        id: contentData.id,
        title: (contentData.title as string) ?? "",
        description: (contentData.description as string) ?? "",
        publishStatus: (contentData.publishStatus as string) ?? "",
        metadata: contentData.metadata as Record<string, unknown>,
      });
      setStatus("done");
    };

    load().catch((error) => {
      console.error(error);
      setStatus("error");
    });
    return () => {
      mounted = false;
    };
  }, [quizId]);

  const timeText = useMemo(() => {
    if (!summary?.timeMs) return "-";
    const totalSeconds = Math.max(0, Math.floor(summary.timeMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}分${seconds.toString().padStart(2, "0")}秒`;
  }, [summary?.timeMs]);

  if (status === "loading") {
    return (
      <Box className="bg-slate-50">
        <Section>
          <Text>採点中...</Text>
        </Section>
      </Box>
    );
  }

  if (status === "not-found") {
    return (
      <Box className="bg-slate-50">
        <Section>
          <Text>小テストが見つかりませんでした。</Text>
        </Section>
      </Box>
    );
  }

  return (
    <Box className="bg-slate-50">
      <Section className="border-b border-slate-200 bg-white">
        <HeroSection
          kicker="採点結果"
          title={content?.title || "小テスト"}
          subtitle={`受験: ${new Date().toLocaleString()}`}
          actions={
            <Flex direction="column" gap="2" align="start">
              <Text color="gray">
                正答率 {summary?.accuracy ?? 0}% ({summary?.correct ?? 0}/{summary?.total ?? 0})
              </Text>
              <Text color="gray">所要時間 {timeText}</Text>
              <Flex gap="6" pt="4">
                <Button asChild variant="ghost">
                  <Link href={`/lessons/${subjectId}/${lessonId}/${quizId}`}>再受験する</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href={`/lessons/${subjectId}/${lessonId}`}>授業に戻る</Link>
                </Button>
              </Flex>
            </Flex>
          }
          maxWidthClassName="max-w-4xl"
        />
      </Section>

      <Section>
        <Flex direction="column" gap="4" className="mx-auto max-w-4xl">
          {evaluated.length === 0 && (
            <Card variant="surface">
              <Text color="gray">採点対象の回答がありませんでした。</Text>
            </Card>
          )}
          {evaluated.map((question, index) => (
            <Card key={question.id} variant="classic">
              <Flex justify="between" align="center">
                <Text size="1" color="gray" className="uppercase tracking-wide">
                  問題 {index + 1}
                </Text>
                <Badge
                  color={question.isCorrect ? "green" : "red"}
                  variant="soft"
                  radius="full"
                >
                  {question.isCorrect ? "正解" : "不正解"}
                </Badge>
              </Flex>
              <div className="mt-2">
                <MarkdownContent
                  className="prose prose-slate max-w-none text-base"
                  content={question.prompt || "(no prompt)"}
                />
              </div>
              <Text mt="3" size="2" color="gray">
                あなたの回答:
              </Text>
              <Card variant="surface" mt="2">
                <MarkdownContent
                  className="prose prose-slate max-w-none text-sm"
                  content={
                    question.userAnswer
                      ? Array.isArray(question.userAnswer)
                        ? question.userAnswer.join("\n")
                        : String(question.userAnswer)
                      : "未回答"
                  }
                />
              </Card>
              <Text mt="3" size="2" color="gray">
                正答:
              </Text>
              <Card variant="surface" mt="2">
                <MarkdownContent
                  className="prose prose-slate max-w-none text-sm"
                  content={
                    question.correctAnswer
                      ? Array.isArray(question.correctAnswer)
                        ? question.correctAnswer.join("\n")
                        : String(question.correctAnswer)
                      : "未設定"
                  }
                />
              </Card>
              {question.explanation && (
                <Card variant="surface" mt="3">
                  <MarkdownContent
                    className="prose prose-slate max-w-none text-sm"
                    content={question.explanation}
                  />
                </Card>
              )}
            </Card>
          ))}
        </Flex>
      </Section>
    </Box>
  );
}
