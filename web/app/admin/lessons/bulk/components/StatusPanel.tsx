"use client";

import { Box, Button, Flex, Text } from "@radix-ui/themes";
import type { LessonBulkItem, ValidationError } from "./validation";

type PanelMode = "idle" | "error" | "confirm" | "processing" | "success";

type StatusPanelProps = {
  mode: PanelMode;
  errors: ValidationError[];
  previewItems: LessonBulkItem[];
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
                key={`${item.unitId}-${item.title}-${index}`}
                className="rounded-md border border-slate-200 bg-white px-3 py-2"
              >
                <Text size="2" weight="bold">
                  {item.title}
                </Text>
                <Flex gap="3" mt="1">
                  <Text size="1" color="gray">
                    unitId: {item.unitId}
                  </Text>
                  <Text size="1" color="gray">
                    publishStatus: {item.publishStatus ?? "private"}
                  </Text>
                  <Text size="1" color="gray">
                    order: {item.order ?? "-"}
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
