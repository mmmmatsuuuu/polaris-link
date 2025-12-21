"use client";

import { useMemo } from "react";
import { Button, Flex, Spinner, Text, TextField } from "@radix-ui/themes";
import type { RichTextDoc } from "@/types/catalog";
import { ChipMultiSelect, type ChipOption } from "@/components/ui/ChipMultiSelect";

type QuizFieldProps = {
  disabled?: boolean;
  metadata: Record<string, unknown>;
  questions: { id: string; prompt: unknown; tags?: string[] }[];
  onChange: (next: Record<string, unknown>) => void;
};

const promptPreview = (prompt: unknown, limit = 40) => {
  if (typeof prompt === "string") return prompt.slice(0, limit);
  const doc = prompt as RichTextDoc;
  const texts: string[] = [];
  const walk = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (node?.type === "text" && typeof node.text === "string") {
        texts.push(node.text);
      }
      if (Array.isArray(node?.content)) walk(node.content);
    });
  };
  if (Array.isArray((doc as any)?.content)) {
    walk((doc as any).content as any[]);
  }
  const joined = texts.join(" ").trim();
  return joined ? joined.slice(0, limit) : "";
};

export function QuizField({ disabled, metadata, questions, onChange }: QuizFieldProps) {
  const isLoading = false;

  const selectedIds = useMemo(
    () =>
      Array.isArray((metadata as any)?.questionIds)
        ? ((metadata as any).questionIds as unknown[])
            .filter((id): id is string => typeof id === "string")
        : [],
    [metadata],
  );

  const options: ChipOption[] = useMemo(
    () =>
      questions.map((q) => ({
        id: q.id,
        label: promptPreview(q.prompt) || `(ID: ${q.id})`,
        description: q.tags?.length ? q.tags.join(", ") : undefined,
      })),
    [questions],
  );

  const handleSelect = (nextIds: string[]) => {
    onChange({ ...metadata, questionIds: nextIds });
  };

  return (
    <Flex direction="column" gap="3">
      <Flex gap="3" direction={{ initial: "column", md: "row" }}>
        <div className="flex-1">
          <Text size="2" color="gray">
            1回あたり出題数
          </Text>
          <TextField.Root
            type="number"
            disabled={disabled}
            value={(metadata as any)?.questionsPerAttempt ?? 0}
            onChange={(e) =>
              onChange({
                ...metadata,
                questionsPerAttempt: Number(e.target.value) || 0,
              })
            }
          />
        </div>
      </Flex>

      <div className="border border-slate-200 rounded p-3">
        <Flex justify="between" align="center" mb="2">
          <Text size="2" color="gray">
            出題する問題を選択（クリックで追加/削除）
          </Text>
          <Text size="1" color="gray">
            選択済み: {selectedIds.length}問
          </Text>
        </Flex>
        {isLoading ? (
          <Flex align="center" gap="2">
            <Spinner size="2" /> <Text size="2">読み込み中...</Text>
          </Flex>
        ) : (
          <ChipMultiSelect
            disabled={disabled}
            value={selectedIds}
            options={options}
            onChange={handleSelect}
            placeholder="問題文で検索"
            columns={2}
          />
        )}
      </div>
    </Flex>
  );
}
