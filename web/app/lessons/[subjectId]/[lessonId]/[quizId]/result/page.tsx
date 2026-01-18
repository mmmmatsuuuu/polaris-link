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
  const renderAnswerList = (value: unknown, emptyLabel: string) => {
    if (!value) {
      return <Text size="2">{emptyLabel}</Text>;
    }
    const items = Array.isArray(value) ? value : [value];
    return (
      <ol className="list-decimal pl-5 text-sm text-slate-700">
        {items.map((item, idx) => (
          <li key={`${String(item)}-${idx}`}>{String(item)}</li>
        ))}
      </ol>
    );
  };

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
          actions={
            <>
              <Button asChild variant="soft" color="gray">
                <Link href={`/lessons/${subjectId}/${lessonId}/${quizId}`}>回答に戻る</Link>
              </Button>
              <Button asChild>
                <Link href={`/lessons/${subjectId}/${lessonId}`}>授業に戻る</Link>
              </Button>
            </>
          }
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
            <Card
              key={question.id}
              variant="classic"
              className={
                question.isCorrect
                  ? "border-l-4 border-l-green-500 bg-green-50/40"
                  : "border-l-4 border-l-red-500 bg-red-50/40"
              }
            >
              <Flex justify="between" align="center" gap="2" wrap="wrap">
                <Text size="3" color="gray" className="uppercase tracking-wide">
                  問題 {index + 1}
                </Text>
                <Badge color={question.isCorrect ? "green" : "red"} variant="solid" radius="full" size="3">
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
              <Flex mt="3" gap="3" direction={{ initial: "column", sm: "row" }}>
                <Box className="flex-1">
                  <Text size="2" weight="bold" className="text-slate-700">
                    ユーザーの回答
                  </Text>
                  <Card variant="surface" mt="2" className="border border-slate-200">
                    {renderAnswerList(question.userAnswer, "未回答")}
                  </Card>
                </Box>
                <Box className="flex-1">
                  <Text size="2" weight="bold" className="text-slate-700">
                    正答
                  </Text>
                  <Card variant="surface" mt="2" className="border border-slate-200">
                    {renderAnswerList(question.correctAnswer, "未設定")}
                  </Card>
                </Box>
              </Flex>
              {question.explanation && (
                <Box mt="3">
                  <Text size="2" weight="bold" className="text-slate-700">
                    解説
                  </Text>
                  <Card variant="surface" mt="2" className="border border-slate-200 bg-white">
                    <TipTapViewer value={question.explanation} className="tiptap-prose max-w-none text-sm" />
                  </Card>
                </Box>
              )}
            </Card>
          ))}
        </Flex>
      </Section>
    </Box>
  );
}
