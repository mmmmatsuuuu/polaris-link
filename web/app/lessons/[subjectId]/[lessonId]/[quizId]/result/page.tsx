"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { Badge, Box, Button, Card, Flex, Section, Text } from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";
import { TipTapViewer } from "@/components/ui/tiptap";
import type { GradeResult } from "../actions";

function decodeResult(param: string | null): GradeResult | null {
  if (!param) return null;
  try {
    const json = decodeURIComponent(atob(param));
    return JSON.parse(json) as GradeResult;
  } catch (error) {
    console.error("Failed to decode result", error);
    return null;
  }
}

export default function QuizResultPage() {
  const searchParams = useSearchParams();
  const params = useParams<{subjectId: string; lessonId: string; quizId: string; }>();
  const dataParam = searchParams.get("data");
  const result = useMemo(() => decodeResult(dataParam), [dataParam]);

  const { subjectId, lessonId, quizId } = params;

  if (!result) {
    return (
      <Box className="bg-white">
        <Section>
          <Flex direction="column" align="center" gap="3" style={{ minHeight: 240 }}>
            <Text color="gray">結果データがありません。もう一度受験してください。</Text>
            <Button asChild>
              <Link href={`/lessons/${subjectId}/${lessonId}/${quizId}`}>クイズに戻る</Link>
            </Button>
          </Flex>
        </Section>
      </Box>
    );
  }

  const { summary, questions } = result;
  const breadcrumbs = [
    { label: "トップ", href: "/" },
    { label: "授業一覧", href: "/lessons" },
    { label: "授業", href: `/lessons/${subjectId}/${lessonId}` },
    { label: "小テスト結果" },
  ];

  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-200 bg-slate-50 px-4">
        <HeroSection
          title="小テスト結果"
          subtitle={
            <Text color="gray">
              正答率: {summary.accuracy}% / 正解 {summary.correct} / 出題 {summary.total}
            </Text>
          }
          kicker={<div>{breadcrumbs.map((b, i) => (b.href ? <Link key={i} href={b.href} className="text-sm text-slate-500 hover:underline mr-2">{b.label}</Link> : <span key={i} className="text-sm text-slate-600">{b.label}</span>))}</div>}
          maxWidthClassName="max-w-4xl"
        />
      </Section>

      <Section>
        <Flex direction="column" gap="4" className="mx-auto max-w-4xl">
          {questions.length === 0 && (
            <Card variant="surface">
              <Text color="gray">採点対象の回答がありませんでした。</Text>
            </Card>
          )}
          {questions.map((question, index) => (
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
                {question.prompt ? (
                  <TipTapViewer value={question.prompt} className="tiptap-prose max-w-none text-base" />
                ) : (
                  <Text color="gray">(no prompt)</Text>
                )}
              </div>
              <Text mt="3" size="2" color="gray">
                あなたの回答:
              </Text>
              <Card variant="surface" mt="2">
                <Text size="2" color="gray">
                  {question.userAnswer
                    ? Array.isArray(question.userAnswer)
                      ? question.userAnswer.join(", ")
                      : String(question.userAnswer)
                    : "未回答"}
                </Text>
              </Card>
              <Text mt="3" size="2" color="gray">
                正答:
              </Text>
              <Card variant="surface" mt="2">
                <Text size="2" color="gray">
                  {question.correctAnswer
                    ? Array.isArray(question.correctAnswer)
                      ? question.correctAnswer.join(", ")
                      : String(question.correctAnswer)
                    : "未設定"}
                </Text>
              </Card>
              {question.explanation && (
                <Card variant="surface" mt="3">
                  <TipTapViewer value={question.explanation} className="tiptap-prose max-w-none text-sm" />
                </Card>
              )}
            </Card>
          ))}
          <Flex gap="2" justify="end">
            <Button asChild variant="soft" color="gray">
              <Link href={`/lessons/${subjectId}/${lessonId}/${quizId}`}>回答に戻る</Link>
            </Button>
            <Button asChild>
              <Link href={`/lessons/${subjectId}/${lessonId}`}>授業に戻る</Link>
            </Button>
          </Flex>
        </Flex>
      </Section>
    </Box>
  );
}
