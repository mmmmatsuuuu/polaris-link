"use client";

import { Button, Checkbox, Flex, Text } from "@radix-ui/themes";
import { TipTapEditor } from "@/components/ui/tiptap";
import type { RichTextDoc } from "@/types/catalog";

type ChoiceItem = {
  key: string;
  label: RichTextDoc;
};

type MultipleChoiceFieldProps = {
  choices: ChoiceItem[];
  correctKeys?: string[];
  onChange: (choices: ChoiceItem[], correctKeys: string[]) => void;
};

const createEmptyDoc = (): RichTextDoc => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});

const nextKey = (choices: ChoiceItem[]) => {
  const indices = choices
    .map((c) => c.key.match(/choice-(\d+)/))
    .filter((m): m is RegExpMatchArray => Boolean(m))
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n));
  const maxIndex = indices.length > 0 ? Math.max(...indices) : choices.length;
  return `choice-${maxIndex + 1}`;
};

export function MultipleChoiceField({ choices, correctKeys, onChange }: MultipleChoiceFieldProps) {
  const currentCorrect = Array.isArray(correctKeys)
    ? correctKeys
    : typeof correctKeys === "string" && correctKeys
      ? [correctKeys]
      : [];

  const handleAdd = (afterIndex?: number) => {
    const insertAt = typeof afterIndex === "number" ? afterIndex : choices.length;
    const newChoice: ChoiceItem = { key: nextKey(choices), label: createEmptyDoc() };
    const updated = [...choices.slice(0, insertAt), newChoice, ...choices.slice(insertAt)];
    onChange(updated, currentCorrect);
  };

  const handleLabelChange = (index: number, next: RichTextDoc) => {
    const updated = choices.map((c, i) => (i === index ? { ...c, label: next } : c));
    onChange(updated, currentCorrect);
  };

  const handleRemove = (index: number) => {
    const removed = choices[index];
    const updated = choices.filter((_, i) => i !== index);
    const nextCorrect = currentCorrect.filter((key) => key !== removed?.key);
    onChange(updated, nextCorrect);
  };

  const handleMarkCorrect = (key: string) => {
    const exists = currentCorrect.includes(key);
    const nextCorrect = exists ? currentCorrect.filter((k) => k !== key) : [...currentCorrect, key];
    onChange(choices, nextCorrect);
  };

  return (
    <div className="flex flex-col gap-3">
      {choices.map((choice, index) => (
        <div key={choice.key} className="rounded border border-slate-200 p-3">
          <Flex align="center" justify="between" gap="3">
            <Flex align="center" gap="2">
              <Text size="2" color="gray">
                {choice.key}
              </Text>
              <Flex align="center" gap="1">
                <Checkbox
                  checked={currentCorrect.includes(choice.key)}
                  onCheckedChange={() => handleMarkCorrect(choice.key)}
                  aria-label="正解"
                />
                <Text size="2">正解</Text>
              </Flex>
            </Flex>
            <Button
              size="1"
              variant="ghost"
              color="red"
              onClick={() => handleRemove(index)}
              disabled={choices.length <= 1}
            >
              削除
            </Button>
          </Flex>
          <div className="mt-2 rounded border border-slate-200">
            <TipTapEditor
              value={choice.label}
              onChange={(next) => handleLabelChange(index, next)}
              placeholder="選択肢を入力"
              showToolbar={true}
            />
          </div>
        </div>
      ))}
      <div>
        <Button variant="soft" onClick={() => handleAdd()}>
          選択肢を追加
        </Button>
      </div>
    </div>
  );
}
