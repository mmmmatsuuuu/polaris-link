"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Flex, Text } from "@radix-ui/themes";
import { collection, getDocs } from "firebase/firestore";
import { Drawer } from "@/components/ui/Drawer";
import { CopyButton } from "@/components/ui/CopyButton";
import { db } from "@/lib/firebase/client";

type QuestionItem = {
  id: string;
  questionType: string;
  prompt: unknown;
  tags: string[];
};

function docToPlain(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    const content = (value as { content?: unknown[] })?.content;
    if (Array.isArray(content)) {
      const texts: string[] = [];
      const walk = (nodes: unknown[]) => {
        nodes.forEach((node) => {
          const typed = node as { type?: string; text?: string; content?: unknown[] };
          if (typed?.type === "text" && typeof typed.text === "string") texts.push(typed.text);
          if (Array.isArray(typed?.content)) walk(typed.content);
        });
      };
      walk(content);
      if (texts.length) return texts.join(" ");
    }
  } catch {
    /* noop */
  }
  return "";
}

function truncate(value: string, max = 32) {
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

export function QuestionListDrawer() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchQuestions = async () => {
      try {
        const snapshot = await getDocs(collection(db, "questions"));
        if (!mounted) return;
        const items = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            questionType: (data.questionType as string) ?? "-",
            prompt: data.prompt,
            tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
          };
        });
        setQuestions(items);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchQuestions();
    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo(
    () =>
      questions.map((question) => ({
        ...question,
        promptText: truncate(docToPlain(question.prompt) || "-"),
      })),
    [questions],
  );

  return (
    <Drawer
      triggerLabel="小テスト一覧を見る"
      title="既存の小テスト一覧"
      description="登録済みの小テスト一覧を表示します。"
    >
      {loading ? (
        <Text size="2" color="gray">
          読み込み中...
        </Text>
      ) : (
        <Flex direction="column" gap="2">
          {rows.map((question) => (
            <Flex
              key={question.id}
              justify="between"
              className="rounded-md border border-slate-200 bg-white px-3 py-2"
            >
              <Box>
                <Flex align="center" gap="2">
                  <Badge color="gray">{question.questionType}</Badge>
                  <Text size="2">{question.promptText}</Text>
                </Flex>
                {question.tags.length ? (
                  <Text size="1" color="gray" mr="2">
                    tags: {question.tags.join(", ")}
                  </Text>
                ) : null}
                <Text size="1" color="gray">
                  {question.id}
                </Text>
              </Box>
              <CopyButton value={question.id} />
            </Flex>
          ))}
          {rows.length === 0 ? (
            <Text size="2" color="gray">
              登録済みの小テストがありません。
            </Text>
          ) : null}
        </Flex>
      )}
      <Box mt="4">
        <Text size="2" color="gray">
          questionIdsに指定するIDは管理画面のIDコピーから取得してください。
        </Text>
      </Box>
    </Drawer>
  );
}
