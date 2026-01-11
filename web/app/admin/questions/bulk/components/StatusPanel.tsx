"use client";

import { Box, Button, Flex, Text } from "@radix-ui/themes";
import type { QuestionBulkItem, ValidationError } from "./validation";

type PanelMode = "idle" | "error" | "confirm" | "processing" | "success";

type StatusPanelProps = {
  mode: PanelMode;
  errors: ValidationError[];
  previewItems: QuestionBulkItem[];
  onRegister: () => void;
  successCount?: number;
};

const modeStyle: Record<PanelMode, string> = {
  idle: "bg-white border-slate-200",
  error: "bg-red-50 border-red-200",
  confirm: "bg-blue-50 border-blue-200",
  processing: "bg-blue-50 border-blue-200",
  success: "bg-emerald-50 border-emerald-200",
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

export function StatusPanel({
  mode,
  errors,
  previewItems,
  onRegister,
  successCount,
}: StatusPanelProps) {
  if (mode === "idle") return null;
  return (
    <Box className={`rounded-md border px-4 py-3 ${modeStyle[mode]}`}>
      <Text weight="bold">進捗・エラー表示</Text>

      {mode === "error" ? (
        <Box mt="2">
          <Text size="2" color="gray">
            入力内容に問題があります。修正して再度アップロードしてください。
          </Text>
          <Box mt="2">
            {errors.map((error, index) => (
              <Text key={`${error.index}-${error.field}-${index}`} size="2" color="gray">
                {error.index + 1}行目 {error.field}: {error.message}
              </Text>
            ))}
          </Box>
        </Box>
      ) : null}

      {mode === "confirm" ? (
        <Box mt="2">
          <Text size="2" color="gray">
            これらのデータを登録していいですか？
          </Text>
          <Box mt="3">
            {previewItems.map((item, index) => (
              <Box
                key={`${item.questionType}-${index}`}
                className="rounded-md border border-slate-200 bg-white px-3 py-2"
              >
                <Text size="2" weight="bold">
                  {item.questionType}
                </Text>
                <Flex gap="3" mt="1">
                  <Text size="1" color="gray">
                    prompt: {docToPlain(item.prompt) || "-"}
                  </Text>
                  <Text size="1" color="gray">
                    difficulty: {item.difficulty ?? "easy"}
                  </Text>
                </Flex>
              </Box>
            ))}
          </Box>
          <Button radius="full" mt="3" onClick={onRegister}>
            登録する
          </Button>
        </Box>
      ) : null}

      {mode === "processing" ? (
        <Box mt="2">
          <Text size="2" color="gray">
            登録中です...
          </Text>
        </Box>
      ) : null}

      {mode === "success" ? (
        <Box mt="2">
          <Text size="2" color="gray">
            {successCount ?? 0}件の登録が完了しました。
          </Text>
        </Box>
      ) : null}
    </Box>
  );
}
