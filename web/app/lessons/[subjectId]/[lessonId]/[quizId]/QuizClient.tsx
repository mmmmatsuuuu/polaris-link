"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { Badge, Box, Button, Card, Flex, Heading, Section, Text } from "@radix-ui/themes";
import { AnswerArea } from "./components/AnswerArea";
import { Timer } from "./components/Timer";
import { TipTapViewer } from "@/components/ui/tiptap";
import { gradeQuiz, type GradeResult, type QuizContentPayload, type QuizQuestionPayload } from "./actions";
import type { QuizQuestionType } from "@/types/catalog";
import { useEffect } from "react";

type Props = {
  content: QuizContentPayload;
  questions: QuizQuestionPayload[];
  selectedQuestionIds: string[];
};

function encodeResult(result: GradeResult): string {
  const json = JSON.stringify(result);
  return btoa(encodeURIComponent(json));
}

export function QuizClient({ content, questions, selectedQuestionIds }: Props) {
  const router = useRouter();
  const params = useParams<{ subjectId: string; lessonId: string; quizId: string }>();
  const { subjectId, lessonId, quizId } = params;

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!questions || questions.length === 0) return;
    setAnswers((prev) => {
      let changed = false;
      const next = { ...prev };
      questions.forEach((q) => {
        if (q.questionType === "ordering" && Array.isArray(q.choices)) {
          if (next[q.id] === undefined) {
            next[q.id] = q.choices.map((c) => c.key);
            changed = true;
          }
        }
      });
      return changed ? next : prev;
    });
  }, [questions]);

  const handleMultipleChoiceChange = (questionId: string, next: string[], allowMultiple: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: allowMultiple ? next : next[0] ?? "" }));
  };

  const handleOrderingChange = (questionId: string, next: string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: next }));
  };

  const handleShortAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await gradeQuiz({
        contentId: content.id,
        selectedQuestionIds,
        answers,
      });
      const encoded = encodeResult(result);
      router.push(`/lessons/${subjectId}/${lessonId}/${quizId}/result?data=${encodeURIComponent(encoded)}`);
    });
  };

  return (
    <Box className="bg-white">
      <Timer className="right-8 top-16" />
      <Section className="border-b border-slate-200 bg-slate-50 px-4">
        <Heading size="8">{content.title || "小テスト"}</Heading>
        <Text color="gray" size="3">
          {content.description ? (
            <TipTapViewer value={content.description} className="tiptap-prose" />
          ) : (
            "小テストを開始してください。"
          )}
        </Text>
        <Flex gap="2" wrap="wrap" mt="2">
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
                      {question.prompt ? (
                        <TipTapViewer value={question.prompt} className="tiptap-prose max-w-none text-base" />
                      ) : (
                        <Text color="gray">(no prompt)</Text>
                      )}
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
                            questionType={(question.questionType as QuizQuestionType) ?? "multipleChoice"}
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

          <Flex justify="end" gap="2">
            <Button onClick={handleSubmit} disabled={isPending || questions.length === 0}>
              {isPending ? "採点中..." : "採点結果を見る"}
            </Button>
          </Flex>
        </Flex>
      </Section>
    </Box>
  );
}
