"use client";

import { Button, Flex, Text } from "@radix-ui/themes";
import { TipTapEditor } from "@/components/ui/tiptap";
import type { RichTextDoc } from "@/types/catalog";

type OrderingItem = {
  key: string;
  label: RichTextDoc;
};

type OrderingFieldProps = {
  items: OrderingItem[];
  onChange: (items: OrderingItem[]) => void;
};

const createEmptyDoc = (): RichTextDoc => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});

const nextKey = (items: OrderingItem[]) => {
  const indices = items
    .map((c) => c.key.match(/step-(\d+)/))
    .filter((m): m is RegExpMatchArray => Boolean(m))
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n));
  const maxIndex = indices.length > 0 ? Math.max(...indices) : items.length;
  return `step-${maxIndex + 1}`;
};

export function OrderingField({ items, onChange }: OrderingFieldProps) {
  const handleAdd = (afterIndex?: number) => {
    const insertAt = typeof afterIndex === "number" ? afterIndex : items.length;
    const newItem: OrderingItem = { key: nextKey(items), label: createEmptyDoc() };
    const updated = [...items.slice(0, insertAt), newItem, ...items.slice(insertAt)];
    onChange(updated);
  };

  const handleLabelChange = (index: number, next: RichTextDoc) => {
    const updated = items.map((c, i) => (i === index ? { ...c, label: next } : c));
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div key={item.key} className="rounded border border-slate-200 p-3">
          <Flex align="center" justify="between" gap="3">
            <Text size="2" color="gray">
              {item.key}
            </Text>
            <Button
              size="1"
              variant="ghost"
              color="red"
              onClick={() => handleRemove(index)}
              disabled={items.length <= 1}
            >
              削除
            </Button>
          </Flex>
          <div className="mt-2 rounded border border-slate-200">
            <TipTapEditor
              value={item.label}
              onChange={(next) => handleLabelChange(index, next)}
              placeholder="選択肢を入力"
              showToolbar={true}
            />
          </div>
        </div>
      ))}
      <div>
        <Button variant="soft" onClick={() => handleAdd()}>
          選択肢を追加（Enterでも追加）
        </Button>
      </div>
    </div>
  );
}
