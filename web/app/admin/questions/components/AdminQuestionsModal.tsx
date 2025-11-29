"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Dialog, Flex, Grid, Select, Spinner, Text, TextArea, TextField } from "@radix-ui/themes";
import { Modal } from "@/components/ui/Modal";

type QuestionForm = {
  prompt: string;
  questionType: "multipleChoice" | "ordering" | "shortAnswer";
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
  choicesText: string;
  correctAnswerText: string;
  order: number;
};

type AdminQuestionsModalProps = {
  mode: "create" | "edit";
  questionId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
};

const emptyForm: QuestionForm = {
  prompt: "",
  questionType: "multipleChoice",
  difficulty: "easy",
  explanation: "",
  choicesText: "",
  correctAnswerText: "",
  order: 0,
};

type Choice = { key: string; label: string };

function normalizeChoices(value: unknown): Choice[] {
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
    .filter((c): c is Choice => Boolean(c));
}

function formatChoicesText(choices: Choice[]): string {
  return choices.map((choice) => `${choice.key}: ${choice.label}`).join("\n");
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
        return key && label ? { key, label } : null;
      }
      return { key: `choice-${index + 1}`, label: line };
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
  const labelMatched = choices.find((c) => c.label === trimmed);
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
  const [form, setForm] = useState<QuestionForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isChoiceQuestion = useMemo(
    () => form.questionType === "multipleChoice" || form.questionType === "ordering",
    [form.questionType],
  );

  useEffect(() => {
    if (mode === "edit" && questionId && open) {
      setIsLoading(true);
      fetch(`/api/questions/${questionId}`)
        .then((res) => res.json())
        .then((data) => {
          const choices = normalizeChoices(data.choices);
          const normalizedAnswer = normalizeCorrectAnswer(data.correctAnswer);
          const choicesText = choices.length > 0 ? formatChoicesText(choices) : "";
          const correctAnswerText = Array.isArray(normalizedAnswer)
            ? normalizedAnswer
                .map((answer) => {
                  const found = choices.find((c) => c.key === answer);
                  return found ? `${answer}: ${found.label}` : answer;
                })
                .join("\n")
            : (normalizedAnswer as string) ?? "";
          setForm({
            prompt: data.prompt ?? "",
            questionType: (data.questionType as QuestionForm["questionType"]) ?? "multipleChoice",
            difficulty: (data.difficulty as QuestionForm["difficulty"]) ?? "easy",
            explanation: data.explanation ?? "",
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
  }, [mode, questionId, open]);

  const handleSave = async () => {
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
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <Modal
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
            <TextArea
              value={form.prompt}
              onChange={(e) => setForm((prev) => ({ ...prev, prompt: e.target.value }))}
              placeholder="問題文を入力"
            />
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
            <TextArea
              placeholder="解説を入力"
              value={form.explanation}
              onChange={(e) => setForm((prev) => ({ ...prev, explanation: e.target.value }))}
            />
          </div>
        </Grid>
      )}
    </Modal>
  );
}
