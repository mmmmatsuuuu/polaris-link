"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { AnswerArea } from "./components/AnswerArea";
import { Timer } from "./components/Timer";

type QuizContent = {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
  publishStatus?: string;
};

type QuizQuestion = {
  id: string;
  questionType?: string;
  prompt?: string;
  choices?: { key: string; label: string }[];
  correctAnswer?: unknown;
};

type AttemptData = {
  selectedQuestionIds: string[];
  answers: Record<string, string | string[]>;
  startedAt: number;
  finishedAt?: number;
};

function shuffleArray<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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

function normalizeCorrectAnswer(value: unknown): string | string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") return value.trim();
  return "";
}

function mapAnswersToChoiceKeys(
  value: string | string[],
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

async function fetchQuizData(lessonId: string, quizId: string) {
  const contentRes = await fetch(`/api/contents/${quizId}`);
  if (!contentRes.ok) {
    throw new Error("failed to fetch content");
  }
  const contentData = await contentRes.json();

  if (contentData.type !== "quiz") {
    throw new Error("content is not quiz");
  }
  if (contentData.lessonId && contentData.lessonId !== lessonId) {
    throw new Error("content lesson mismatch");
  }

  const metadata = (contentData.metadata ?? {}) as {
    questionIds?: unknown;
    questionsPerAttempt?: unknown;
  };
  const questionIds = Array.isArray(metadata.questionIds)
    ? metadata.questionIds.filter((value): value is string => typeof value === "string")
    : [];

  const questionsPerAttempt =
    typeof metadata.questionsPerAttempt === "number" && metadata.questionsPerAttempt > 0
      ? metadata.questionsPerAttempt
      : questionIds.length;

  const pickedIds = shuffleArray(questionIds).slice(0, questionsPerAttempt);

  if (pickedIds.length === 0) {
    const content: QuizContent = {
      id: contentData.id,
      title: (contentData.title as string) ?? "",
      description: (contentData.description as string) ?? "",
      tags: contentData.tags ?? [],
      metadata: contentData.metadata as Record<string, unknown>,
      publishStatus: (contentData.publishStatus as string) ?? "",
    };

    return { content, questions: [], selectedQuestionIds: [] };
  }

  const params = new URLSearchParams();
  pickedIds.forEach((id) => params.append("ids", id));
  const questionsRes = await fetch(`/api/questions?${params.toString()}`);
  if (!questionsRes.ok) {
    throw new Error("failed to fetch questions");
  }
  const payload = await questionsRes.json();

  const questions: QuizQuestion[] = Array.isArray(payload.questions)
    ? payload.questions.map((doc: any) => {
        const questionType = (doc.questionType as string) ?? "";
        const normalizedChoices = normalizeChoices(doc.choices);
        const shuffledChoices =
          questionType === "multipleChoice" || questionType === "ordering"
            ? shuffleArray(normalizedChoices)
            : normalizedChoices;
        const normalizedCorrectAnswer =
          questionType === "shortAnswer"
            ? normalizeCorrectAnswer(doc.correctAnswer)
            : mapAnswersToChoiceKeys(normalizeCorrectAnswer(doc.correctAnswer), normalizedChoices);

        return {
          id: doc.id as string,
          questionType,
          prompt: (doc.prompt as string) ?? "",
          choices: shuffledChoices,
          correctAnswer: normalizedCorrectAnswer,
        };
      })
    : [];

  const content: QuizContent = {
    id: contentData.id,
    title: (contentData.title as string) ?? "",
    description: (contentData.description as string) ?? "",
    tags: contentData.tags ?? [],
    metadata: contentData.metadata as Record<string, unknown>,
    publishStatus: (contentData.publishStatus as string) ?? "",
  };

  return { content, questions, selectedQuestionIds: pickedIds };
}

function loadAttempt(quizId: string): AttemptData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`quizAttempt:${quizId}`);
    if (!raw) return null;
    return JSON.parse(raw) as AttemptData;
  } catch (error) {
    console.warn("Failed to load attempt", error);
    return null;
  }
}

function clearAttemptFromStorage(quizId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`quizAttempt:${quizId}`);
  } catch (error) {
    console.warn("Failed to clear attempt from storage", error);
  }
}

function saveAttempt(quizId: string, data: Partial<AttemptData>) {
  if (typeof window === "undefined") return;
  try {
    const key = `quizAttempt:${quizId}`;
    const prev = window.localStorage.getItem(key);
    const prevData: AttemptData = prev
      ? JSON.parse(prev)
      : { selectedQuestionIds: [], answers: {}, startedAt: Date.now() };
    const merged: AttemptData = {
      ...prevData,
      ...data,
    };
    console.log("Saving attempt", key, JSON.stringify(merged));
    window.localStorage.setItem(key, JSON.stringify(merged));
  } catch (error) {
    console.warn("Failed to save attempt", error);
  }
}

export default function QuizPage({
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
  const router = useRouter();
  const [content, setContent] = useState<QuizContent | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setStatus("loading");
      const { content: fetchedContent, questions: fetchedQuestions, selectedQuestionIds } =
        await fetchQuizData(lessonId, quizId);

      if (!mounted) return;
      setContent(fetchedContent);
      setQuestions(fetchedQuestions);
      setSelectedQuestionIds(selectedQuestionIds);
      clearAttemptFromStorage(quizId);

      const started = Date.now();

      setStartedAt(started);
      setAnswers({});
      // 保存: 出題された問題IDと開始時刻を記録
      saveAttempt(quizId, {
        selectedQuestionIds,
        answers: {},
        startedAt: started,
      });
      setStatus("ready");
    };
    load().catch((error) => {
      console.error(error);
      setStatus("error");
    });
    return () => {
      mounted = false;
    };
  }, [lessonId, quizId]);

  const breadcrumbs = useMemo(
    () => [
      { label: "トップ", href: "/" },
      { label: "授業一覧", href: "/lessons" },
      { label: "科目ページへ戻る", href: `/lessons/${subjectId}` },
      { label: "授業へ戻る", href: `/lessons/${subjectId}/${lessonId}` },
      { label: content?.title || "小テスト" },
    ],
    [content?.title, lessonId, subjectId],
  );

  const handleMultipleChoiceChange = (questionId: string, values: string[], allowMultiple: boolean) => {
    setAnswers((prev) => {
      const nextValue: string | string[] = allowMultiple ? values : values[0] ?? "";
      const next = { ...prev, [questionId]: nextValue };
      saveAttempt(quizId, {
        answers: next,
        selectedQuestionIds,
        startedAt,
      });
      return next;
    });
  };

  const handleOrderingChange = (questionId: string, values: string[]) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: values };
      saveAttempt(quizId, {
        answers: next,
        selectedQuestionIds,
        startedAt,
      });
      return next;
    });
  };

  const handleShortAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      saveAttempt(quizId, {
        answers: next,
        selectedQuestionIds,
        startedAt,
      });
      return next;
    });
  };

  const handleGoResult = () => {
    saveAttempt(quizId, {
      answers,
      selectedQuestionIds,
      startedAt,
      finishedAt: Date.now(),
    });
    router.push(`/lessons/${subjectId}/${lessonId}/${quizId}/result`);
  };

  if (status === "loading") {
    return (
      <Box className="bg-white">
        <Section>
          <Text>読み込み中...</Text>
        </Section>
      </Box>
    );
  }

  if (status === "error" || !content) {
    return (
      <Box className="bg-white">
        <Section>
          <Text>小テストを読み込めませんでした。</Text>
        </Section>
      </Box>
    );
  }

  return (
    <Box className="bg-white">
      <Timer className="right-8 top-16" />
      <Section className="border-b border-slate-200 bg-slate-50 px-4">
        <HeroSection
          title={content.title || "小テスト"}
          subtitle={content.description || "取得したデータを確認するためのページです。"}
          kicker={<Breadcrumb items={breadcrumbs} />}
          actions={
            <Flex gap="2" wrap="wrap">
              <Badge variant="soft" color={content.publishStatus === "public" ? "green" : "gray"}>
                {content.publishStatus || "unknown"}
              </Badge>
              {content.tags &&
                content.tags.map((tag) => (
                  <Badge key={tag} variant="soft" color="blue">
                    {tag}
                  </Badge>
                ))}
            </Flex>
          }
          maxWidthClassName="max-w-4xl"
        />
      </Section>

      <Section>
        <Flex direction="column" gap="4" className="mx-auto max-w-4xl">
          <Card variant="classic">
            <Heading size="4">問題</Heading>
            <Text color="gray" size="2">
              以下の問題に答えなさい。
            </Text>
            {questions.length === 0 ? (
              <Text mt="2" color="gray">
                取得できる問題がありません。
              </Text>
            ) : (
              <Flex direction="column" gap="3" mt="3">
                {questions.map((question, index) => (
                  <Card key={question.id} variant="surface" className="border border-slate-200">
                    <Flex justify="between" align="center" gap="3">
                      <Text size="1" color="gray" className="uppercase tracking-wide">
                        問題 {index + 1}
                      </Text>
                    </Flex>
                    <div className="mt-2">
                      <MarkdownContent
                        className="prose prose-slate max-w-none text-base"
                        content={question.prompt || "(no prompt)"}
                      />
                    </div>
                    <div className="mt-3">
                      {(() => {
                        const allowMultiple = Array.isArray(question.correctAnswer);
                        const answerForQuestion = answers[question.id];
                        const selectedChoiceKeys = Array.isArray(answerForQuestion)
                          ? (answerForQuestion as string[])
                          : typeof answerForQuestion === "string" && answerForQuestion
                            ? [answerForQuestion]
                            : [];
                        const shortAnswerValue =
                          typeof answerForQuestion === "string" &&
                          question.questionType === "shortAnswer"
                            ? answerForQuestion
                            : "";

                        return (
                          <AnswerArea
                            questionType={(question.questionType as any) ?? "multipleChoice"}
                            choices={question.choices ?? []}
                            allowMultiple={allowMultiple}
                            selectedChoiceKeys={selectedChoiceKeys}
                            shortAnswerValue={shortAnswerValue}
                            onMultipleChoiceChange={(next) =>
                              handleMultipleChoiceChange(question.id, next, allowMultiple)
                            }
                            onOrderingChange={(next) => handleOrderingChange(question.id, next)}
                            onShortAnswerChange={(value) => handleShortAnswerChange(question.id, value)}
                          />
                        );
                      })()}
                    </div>
                  </Card>
                ))}
              </Flex>
            )}
          </Card>

          <Card variant="surface">
            <Flex direction="column" gap="3">
              <Text color="gray" size="2">
                見直しをして問題なければ、下のボタンを押して結果ページへ進んでください。
              </Text>
              <Button radius="full" onClick={handleGoResult}>
                解答
              </Button>
            </Flex>
          </Card>
        </Flex>
      </Section>
    </Box>
  );
}
