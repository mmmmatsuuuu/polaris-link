"use client";

import { useEffect, useState } from "react";
import { Button, Dialog, Flex, Grid, Select, Spinner, Text, TextField } from "@radix-ui/themes";
import { FullScreenModal } from "@/components/ui/FullScreenModal";
import { useAuth } from "@/context/AuthProvider";
import { TipTapEditor } from "@/components/ui/tiptap";
import type { QuizQuestion, QuizQuestionType, RichTextDoc } from "@/types/catalog";
import { TagInput } from "@/components/ui/TagInput";
import { MultipleChoiceField } from "./MultipleChoiceField";
import { OrderingField } from "./OrderingField";
import { ShortAnswerField } from "./ShortAnswerField";

type Choice = { key: string; label: RichTextDoc };

type QuestionForm = Pick<QuizQuestion, "questionType" | "difficulty" | "order"> & {
  prompt: RichTextDoc;
  explanation: RichTextDoc;
  choices: Choice[];
  correctAnswer: string | string[];
  tags: string[];
};

type AdminQuestionsModalProps = {
  mode: "create" | "edit";
  questionId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
};

const createEmptyDoc = (): RichTextDoc => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});

const defaultChoices = (type: QuizQuestionType): Choice[] => {
  if (type === "multipleChoice") {
    return [
      { key: "choice-1", label: createEmptyDoc() },
      { key: "choice-2", label: createEmptyDoc() },
    ];
  }
  if (type === "ordering") {
    return [
      { key: "step-1", label: createEmptyDoc() },
      { key: "step-2", label: createEmptyDoc() },
    ];
  }
  return [];
};

const emptyForm: QuestionForm = {
  prompt: createEmptyDoc(),
  questionType: "multipleChoice",
  difficulty: "easy",
  explanation: createEmptyDoc(),
  choices: defaultChoices("multipleChoice"),
  correctAnswer: [],
  order: 0,
  tags: [],
};

const toDoc = (value: unknown): RichTextDoc => {
  if (value && typeof value === "object" && "type" in (value as any)) {
    return value as RichTextDoc;
  }
  return createEmptyDoc();
};

const toChoices = (value: unknown): Choice[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (item && typeof item === "object" && "key" in item && "label" in item) {
        const key = String((item as any).key);
        return key ? { key, label: toDoc((item as any).label) } : null;
      }
      return null;
    })
    .filter((c): c is Choice => Boolean(c));
};

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
      const questionType = (data.questionType as QuizQuestionType) ?? "multipleChoice";
      const choices = toChoices(data.choices);
      const filledChoices = choices.length > 0 ? choices : defaultChoices(questionType);
      const normalizedAnswer =
        typeof data.correctAnswer === "string" || Array.isArray(data.correctAnswer)
          ? data.correctAnswer
          : [];

          setForm({
            prompt: toDoc(data.prompt),
            questionType,
            difficulty: (data.difficulty as QuestionForm["difficulty"]) ?? "easy",
            explanation: toDoc(data.explanation),
            choices: filledChoices,
            correctAnswer:
              questionType === "ordering"
                ? filledChoices.map((c) => c.key)
                : questionType === "multipleChoice"
                  ? (Array.isArray(normalizedAnswer)
                      ? normalizedAnswer.filter((k) => typeof k === "string")
                      : typeof normalizedAnswer === "string" && normalizedAnswer
                        ? [normalizedAnswer]
                        : [])
                  : typeof normalizedAnswer === "string"
                    ? normalizedAnswer
                    : "",
            order: typeof data.order === "number" ? data.order : 0,
            tags: Array.isArray(data.tags)
              ? data.tags.filter((t: unknown): t is string => typeof t === "string").map((t: string) => t.trim())
              : [],
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

  const handleQuestionTypeChange = (nextType: QuizQuestionType) => {
    const baseChoices = defaultChoices(nextType);
    setForm((prev) => ({
      ...prev,
      questionType: nextType,
      choices: baseChoices,
      correctAnswer:
        nextType === "ordering"
          ? baseChoices.map((c) => c.key)
          : nextType === "multipleChoice"
            ? []
            : "",
    }));
    console.log("Changed question type to", nextType);
  };

  const handleSave = async () => {
    if (!user?.uid) {
      setStatus("ユーザー情報を取得できませんでした");
      return;
    }
    setStatus(null);
    setIsSubmitting(true);

    try {
      let correctAnswer: string | string[] = form.correctAnswer;
      if (form.questionType === "multipleChoice") {
        const selectedKeys = Array.isArray(form.correctAnswer)
          ? form.correctAnswer
          : typeof form.correctAnswer === "string" && form.correctAnswer
            ? [form.correctAnswer]
            : [];
        const validKeys = selectedKeys.filter((k) => form.choices.some((c) => c.key === k));
        if (validKeys.length === 0) {
          setStatus("正解となる選択肢を1つ以上選んでください");
          setIsSubmitting(false);
          return;
        }
        correctAnswer = Array.from(new Set(validKeys));
      }
      if (form.questionType === "ordering") {
        if (form.choices.length < 2) {
          setStatus("並び替えの選択肢を2つ以上追加してください");
          setIsSubmitting(false);
          return;
        }
        correctAnswer = form.choices.map((c) => c.key);
      }
      if (form.questionType === "shortAnswer") {
        const answerText =
          typeof form.correctAnswer === "string"
            ? form.correctAnswer.trim()
            : Array.isArray(form.correctAnswer)
              ? (form.correctAnswer[0] ?? "").trim()
              : "";
        if (!answerText) {
          setStatus("正解を入力してください");
          setIsSubmitting(false);
          return;
        }
        correctAnswer = answerText;
      }

      const endpoint = mode === "edit" && questionId ? `/api/questions/${questionId}` : "/api/questions";
      const method = mode === "edit" ? "PATCH" : "POST";
      const payload = {
        prompt: form.prompt,
        questionType: form.questionType,
        difficulty: form.difficulty,
        explanation: form.explanation,
        choices: form.choices,
        correctAnswer,
        order: mode === "edit" ? form.order : undefined,
        tags: form.tags,
      };
      console.log("Saving question with payload:", payload);
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
            <Select.Root value={form.questionType} onValueChange={(v) => handleQuestionTypeChange(v as QuizQuestionType)}>
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

          <div className="col-span-full flex flex-col gap-2">
            <Text size="2" color="gray">
              タグ
            </Text>
            <TagInput
              value={form.tags}
              onChange={(next) => setForm((prev) => ({ ...prev, tags: next }))}
              placeholder="タグを入力してEnterで追加"
            />
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

          {form.questionType === "multipleChoice" && (
            <div className="col-span-full flex flex-col gap-2">
              <Text size="2" color="gray">
                選択肢と正解（複数選択可）
              </Text>
              <MultipleChoiceField
                choices={form.choices}
                correctKeys={
                  Array.isArray(form.correctAnswer)
                    ? form.correctAnswer
                    : typeof form.correctAnswer === "string" && form.correctAnswer
                      ? [form.correctAnswer]
                      : []
                }
                onChange={(nextChoices, nextCorrect) =>
                  setForm((prev) => ({
                    ...prev,
                    choices: nextChoices,
                    correctAnswer: nextCorrect,
                  }))
                }
              />
            </div>
          )}

          {form.questionType === "ordering" && (
            <div className="col-span-full flex flex-col gap-2">
              <Text size="2" color="gray">
                並び替えの選択肢（追加順が正解順）
              </Text>
              <OrderingField
                items={form.choices}
                onChange={(nextItems) =>
                  setForm((prev) => ({
                    ...prev,
                    choices: nextItems,
                    correctAnswer: nextItems.map((c) => c.key),
                  }))
                }
              />
            </div>
          )}

          {form.questionType === "shortAnswer" && (
            <div className="col-span-full flex flex-col gap-2">
              <Text size="2" color="gray">
                正解
              </Text>
              <ShortAnswerField
                value={
                  typeof form.correctAnswer === "string"
                    ? form.correctAnswer
                    : Array.isArray(form.correctAnswer)
                      ? form.correctAnswer[0] ?? ""
                      : ""
                }
                onChange={(v) => setForm((prev) => ({ ...prev, correctAnswer: v }))}
              />
            </div>
          )}

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
