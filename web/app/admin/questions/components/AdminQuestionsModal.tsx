"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Dialog, Flex, Grid, Select, Spinner, Text, TextArea, TextField } from "@radix-ui/themes";
import { FullScreenModal } from "@/components/ui/FullScreenModal";
import { useAuth } from "@/context/AuthProvider";
import { TipTapEditor } from "@/components/ui/tiptap";
import type { PublishStatus, QuizQuestion, QuizQuestionType, RichTextDoc } from "@/types/catalog";

type QuestionForm = Pick<QuizQuestion, "questionType" | "difficulty" | "order"> & {
  prompt: RichTextDoc;
  explanation: RichTextDoc;
  choicesText: string;
  correctAnswerText: string;
  publishStatus?: PublishStatus;
};

type AdminQuestionsModalProps = {
  mode: "create" | "edit";
  questionId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
};

type Choice = { key: string; label: RichTextDoc };

const emptyForm: QuestionForm = {
  prompt: { type: "doc", content: [{ type: "paragraph" }] },
  questionType: "multipleChoice",
  difficulty: "easy",
  explanation: { type: "doc", content: [{ type: "paragraph" }] },
  choicesText: "",
  correctAnswerText: "",
  order: 0,
};

function normalizeDoc(value: unknown, fallback: RichTextDoc): RichTextDoc {
  if (value && typeof value === "object" && "type" in value) {
    return value as RichTextDoc;
  }
  if (typeof value === "string") {
    return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: value }] }] };
  }
  return fallback;
}

function normalizeChoices(value: unknown): Choice[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((choice, index) => {
      if (typeof choice === "object" && choice !== null && "key" in choice && "label" in choice) {
        const key = typeof (choice as any).key === "string" ? (choice as any).key.trim() : "";
        if (!key) return null;
        return { key, label: normalizeDoc((choice as any).label, { type: "doc", content: [] }) };
      }
      if (typeof choice === "string") {
        const label = choice.trim();
        if (!label) return null;
        return { key: `choice-${index + 1}`, label: normalizeDoc(label, { type: "doc", content: [] }) };
      }
      return null;
    })
    .filter((c): c is Choice => Boolean(c));
}

function formatChoicesText(choices: Choice[]): string {
  // Docを平文化してキー: ラベル 形式で表示
  const toPlain = (doc: RichTextDoc) => {
    const texts: string[] = [];
    const walk = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node?.type === "text" && typeof node.text === "string") texts.push(node.text);
        if (Array.isArray(node?.content)) walk(node.content);
      });
    };
    const content = (doc as any)?.content;
    if (Array.isArray(content)) walk(content);
    return texts.join(" ");
  };
  return choices.map((choice) => `${choice.key}: ${toPlain(choice.label)}`).join("\n");
}

function parseChoicesText(text: string): Choice[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const match = line.match(/^\s*([^:：|]+)\s*[:：|]\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        const label = match[2].trim();
        return key ? { key, label: normalizeDoc(label, { type: "doc", content: [] }) } : null;
      }
      return { key: `choice-${index + 1}`, label: normalizeDoc(line, { type: "doc", content: [] }) };
    })
    .filter((c): c is Choice => Boolean(c));
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

function resolveAnswerKey(raw: string, choices: Choice[], fallbackIndex: number): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const keyMatched = choices.find((c) => c.key === trimmed);
  if (keyMatched) return keyMatched.key;
  const labelMatched = choices.find((c) => normalizeDoc(trimmed, c.label).content?.length);
  if (labelMatched) return labelMatched.key;
  return trimmed || `answer-${fallbackIndex + 1}`;
}

export function AdminQuestionsModal({
  mode,
  questionId,
  open,
  onOpenChange,
  onCompleted,
}: AdminQuestionsModalProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<QuestionForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isChoiceQuestion = useMemo(
    () => form.questionType === "multipleChoice" || form.questionType === "ordering",
    [form.questionType],
  );

  useEffect(() => {
    if (!open) return;
    if (!user?.uid) {
      setStatus("ユーザー情報を取得できませんでした");
      return;
    }

    if (mode === "edit" && questionId) {
      setIsLoading(true);
      fetch(`/api/questions/${questionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const payload = await res.json().catch(() => null);
            throw new Error(payload?.error ?? res.statusText);
          }
          return res.json();
        })
        .then((data) => {
          const choices = normalizeChoices(data.choices);
          const normalizedAnswer = normalizeCorrectAnswer(data.correctAnswer);
          const choicesText = choices.length > 0 ? formatChoicesText(choices) : "";
          const correctAnswerText = Array.isArray(normalizedAnswer)
            ? normalizedAnswer.join("\n")
            : (normalizedAnswer as string) ?? "";
          setForm({
            prompt: normalizeDoc(data.prompt, emptyForm.prompt),
            questionType: (data.questionType as QuestionForm["questionType"]) ?? "multipleChoice",
            difficulty: (data.difficulty as QuestionForm["difficulty"]) ?? "easy",
            explanation: normalizeDoc(data.explanation, emptyForm.explanation),
            choicesText,
            correctAnswerText,
            order: typeof data.order === "number" ? data.order : 0,
          });
        })
        .catch((error) => {
          console.error(error);
          setStatus("問題の取得に失敗しました");
        })
        .finally(() => setIsLoading(false));
    }

    if (mode === "create" && open) {
      setForm(emptyForm);
      setStatus(null);
    }
  }, [mode, questionId, open, user?.uid]);

  const handleSave = async () => {
    if (!user?.uid) {
      setStatus("ユーザー情報を取得できませんでした");
      return;
    }
    setStatus(null);
    setIsSubmitting(true);

    try {
      const choices = isChoiceQuestion ? parseChoicesText(form.choicesText) : [];
      if (isChoiceQuestion && choices.length === 0) {
        setStatus("選択肢を入力してください");
        setIsSubmitting(false);
        return;
      }

      const answers = form.correctAnswerText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      let correctAnswer: string | string[] =
        form.questionType === "ordering"
          ? answers
              .map((answer, index) => resolveAnswerKey(answer, choices, index))
              .filter((v): v is string => Boolean(v))
          : form.questionType === "multipleChoice"
            ? (() => {
                const resolved = answers
                  .map((answer, index) => resolveAnswerKey(answer, choices, index))
                  .filter((v): v is string => Boolean(v));
                return resolved.length > 1 ? resolved : resolved[0] ?? "";
              })()
            : form.correctAnswerText.trim();

      const endpoint = mode === "edit" && questionId ? `/api/questions/${questionId}` : "/api/questions";
      const method = mode === "edit" ? "PATCH" : "POST";
      const payload = {
        prompt: form.prompt,
        questionType: form.questionType,
        difficulty: form.difficulty,
        explanation: form.explanation,
        choices,
        correctAnswer,
        order: mode === "edit" ? form.order : undefined,
        publishStatus: form.publishStatus,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, userId: user.uid }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? res.statusText);
      }

      onCompleted?.();
    } catch (error) {
      console.error(error);
      setStatus("保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FullScreenModal
      trigger={<span />}
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "問題を追加" : "問題を編集"}
      actions={
        <>
          <Dialog.Close>
            <Button variant="soft" color="gray">
              キャンセル
            </Button>
          </Dialog.Close>
          <Button onClick={handleSave} disabled={isSubmitting || isLoading}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </>
      }
    >
      {isLoading ? (
        <Flex direction="column" align="center" justify="center" gap="3" style={{ minHeight: 200 }}>
          <Spinner size="3" />
          <Text color="gray">読み込み中...</Text>
        </Flex>
      ) : (
        <Grid gap="3" columns={{ initial: "1", md: "2" }}>
          <div className="col-span-full flex flex-col gap-2">
            {status && (
              <Text size="2" color="red">
                {status}
              </Text>
            )}
            <Text size="2" color="gray">
              問題文
            </Text>
            <div className="rounded border border-slate-200">
              <TipTapEditor
                value={form.prompt}
                onChange={(next) => setForm((prev) => ({ ...prev, prompt: next }))}
                placeholder="問題文を入力"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Text size="2" color="gray">
              種別
            </Text>
            <Select.Root
              value={form.questionType}
              onValueChange={(v) =>
                setForm((prev) => ({ ...prev, questionType: v as QuestionForm["questionType"] }))
              }
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="multipleChoice">選択問題</Select.Item>
                <Select.Item value="ordering">並び替え</Select.Item>
                <Select.Item value="shortAnswer">記述</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>

          <div className="flex flex-col gap-2">
            <Text size="2" color="gray">
              難易度
            </Text>
            <Select.Root
              value={form.difficulty}
              onValueChange={(v) => setForm((prev) => ({ ...prev, difficulty: v as QuestionForm["difficulty"] }))}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="easy">★☆☆</Select.Item>
                <Select.Item value="medium">★★☆</Select.Item>
                <Select.Item value="hard">★★★</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>

          {mode === "edit" && (
            <div className="flex flex-col gap-2">
              <Text size="2" color="gray">
                表示順
              </Text>
              <TextField.Root
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    order: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>
          )}

          <div className="col-span-full flex flex-col gap-2">
            <Text size="2" color="gray">
              選択肢（1行1選択肢。`キー: 表示文` 形式、キー省略時は自動採番）
            </Text>
            <TextArea
              placeholder={"例\nA: 選択肢A\nB: 選択肢B\nC: 選択肢C"}
              value={form.choicesText}
              onChange={(e) => setForm((prev) => ({ ...prev, choicesText: e.target.value }))}
              disabled={!isChoiceQuestion}
            />
          </div>

          <div className="col-span-full flex flex-col gap-2">
            <Text size="2" color="gray">
              正解（1行1正解。キーまたはラベルで指定。並び替えは順番に並べる）
            </Text>
            <TextArea
              placeholder={"例\nA\nB"}
              value={form.correctAnswerText}
              onChange={(e) => setForm((prev) => ({ ...prev, correctAnswerText: e.target.value }))}
            />
          </div>

          <div className="col-span-full flex flex-col gap-2">
            <Text size="2" color="gray">
              解説
            </Text>
            <div className="rounded border border-slate-200">
              <TipTapEditor
                value={form.explanation}
                onChange={(next) => setForm((prev) => ({ ...prev, explanation: next }))}
                placeholder="解説を入力"
              />
            </div>
          </div>
        </Grid>
      )}
    </FullScreenModal>
  );
}
