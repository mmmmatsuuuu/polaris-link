"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { useAuth } from "@/context/AuthProvider";

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
  choices?: { key: string; label: string }[];
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
  choices?: { key: string; label: string }[];
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

function normalizeChoices(value: unknown): { key: string; label: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((choice, index) => {
      if (typeof choice === "object" && choice !== null && "key" in choice && "label" in choice) {
        const key = typeof (choice as any).key === "string" ? (choice as any).key.trim() : "";
        const label = typeof (choice as any).label === "string" ? (choice as any).label.trim() : "";
        if (!key || !label) return null;
        return { key, label };
      }
      if (typeof choice === "string") {
        const label = choice.trim();
        if (!label) return null;
        return { key: `choice-${index + 1}`, label };
      }
      return null;
    })
    .filter((c): c is { key: string; label: string } => Boolean(c));
}

function normalizeAnswerArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  const single = normalizeString(value);
  return single ? [single] : [];
}

function mapAnswersToChoiceKeys(
  value: string | string[] | undefined,
  choices: { key: string; label: string }[],
): string | string[] {
  const toKey = (raw: string, index: number) => {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    const byKey = choices.find((choice) => choice.key === trimmed);
    if (byKey) return byKey.key;
    const byLabel = choices.find((choice) => choice.label === trimmed);
    if (byLabel) return byLabel.key;
    return trimmed || `answer-${index + 1}`;
  };

  if (Array.isArray(value)) {
    return value
      .map((raw, index) => (typeof raw === "string" ? toKey(raw, index) : ""))
      .filter((v): v is string => Boolean(v));
  }

  if (typeof value === "string") {
    return toKey(value, 0);
  }

  return "";
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

function mapKeysToLabels(keys: string[], choices: { key: string; label: string }[]): string[] {
  return keys.map((key) => choices.find((c) => c.key === key)?.label ?? key);
}

function evaluateQuestion(question: QuizQuestion, answer: unknown): EvaluatedQuestion {
  const questionType = question.questionType ?? "";
  const choices = normalizeChoices(question.choices);
  const userAnswerRaw = typeof answer === "string" || Array.isArray(answer) ? answer : undefined;
  const correctAnswerRaw =
    typeof question.correctAnswer === "string" || Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : undefined;

  let isCorrect = false;
  let userAnswerDisplay: string | string[] | undefined;
  let correctAnswerDisplay: string | string[] | undefined;

  if (questionType === "multipleChoice") {
    const expectedKeys = normalizeAnswerArray(correctAnswerRaw);
    const userKeys = normalizeAnswerArray(userAnswerRaw);
    if (expectedKeys.length > 1) {
      isCorrect = isSetEqual(expectedKeys, userKeys);
    } else {
      isCorrect = expectedKeys[0] ? userKeys[0] === expectedKeys[0] : false;
    }
    correctAnswerDisplay = expectedKeys.length ? mapKeysToLabels(expectedKeys, choices) : undefined;
    userAnswerDisplay = userKeys.length ? mapKeysToLabels(userKeys, choices) : undefined;
  } else if (questionType === "ordering") {
    const expectedKeys = normalizeAnswerArray(correctAnswerRaw);
    const userKeys = normalizeAnswerArray(userAnswerRaw);
    isCorrect = isArrayEqual(expectedKeys, userKeys);
    correctAnswerDisplay = expectedKeys.length ? mapKeysToLabels(expectedKeys, choices) : undefined;
    userAnswerDisplay = userKeys.length ? mapKeysToLabels(userKeys, choices) : undefined;
  } else if (questionType === "shortAnswer") {
    const expected = typeof correctAnswerRaw === "string" ? normalizeString(correctAnswerRaw) : "";
    const user = typeof userAnswerRaw === "string" ? normalizeString(userAnswerRaw) : "";
    isCorrect = expected.length > 0 && expected.toLowerCase() === user.toLowerCase();
    correctAnswerDisplay = expected || undefined;
    userAnswerDisplay = user || undefined;
  }

  return {
    id: question.id,
    questionType,
    prompt: question.prompt ?? "",
    explanation: question.explanation,
    choices,
    correctAnswer: correctAnswerDisplay ?? correctAnswerRaw,
    userAnswer: userAnswerDisplay ?? userAnswerRaw,
    isCorrect,
  };
}

export default function QuizResultPage({
  params,
}: {
  params: { subjectId: string; lessonId: string; quizId: string };
}) {
  const { user, loading } = useAuth();
  const { subjectId, lessonId, quizId } = params;

  const [content, setContent] = useState<QuizContent | null>(null);
  const [evaluated, setEvaluated] = useState<EvaluatedQuestion[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [status, setStatus] = useState<string>("loading");

  useEffect(() => {
    if (loading) return;
    if (!user?.uid) {
      setStatus("error");
      return;
    }
    let mounted = true;
    const load = async () => {
      setStatus("loading");
      const attempt = loadAttemptFromStorage(quizId) ?? {};

      const contentRes = await fetch(`/api/contents/${quizId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
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
        const payloads = await Promise.all(
          limitedIds.map(async (id) => {
            const res = await fetch(`/api/questions/${id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: user.uid }),
            });
            if (!res.ok) {
              throw new Error("failed to fetch questions");
            }
            return res.json();
          }),
        );
        questions = payloads.map((doc: any) => {
          const questionType = (doc.questionType as string) ?? "";
          const normalizedChoices = normalizeChoices(doc.choices);
          const rawCorrectAnswer = doc.correctAnswer as string | string[] | undefined;
          const normalizedCorrectAnswer =
            questionType === "shortAnswer"
              ? normalizeString(rawCorrectAnswer)
              : mapAnswersToChoiceKeys(rawCorrectAnswer, normalizedChoices);
          return {
            id: doc.id as string,
            questionType,
            prompt: (doc.prompt as string) ?? "",
            choices: normalizedChoices,
            correctAnswer: normalizedCorrectAnswer,
            explanation: (doc.explanation as string) ?? "",
          };
        });
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
  }, [quizId, user?.uid, loading]);

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
