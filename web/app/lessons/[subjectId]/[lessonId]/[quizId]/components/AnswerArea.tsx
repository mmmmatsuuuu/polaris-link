"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, Flex, Text, TextArea, Button, Badge } from "@radix-ui/themes";
import {
  CheckCircledIcon,
  CircleIcon,
  DragHandleDots2Icon,
} from "@radix-ui/react-icons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MarkdownContent } from "@/components/ui/MarkdownContent";

type MultipleChoiceProps = {
  choices: string[];
  selected: string[];
  multiple: boolean;
  onChange: (next: string[]) => void;
};

function MultipleChoiceAnswer({ choices, selected, multiple, onChange }: MultipleChoiceProps) {
  const toggle = (choice: string) => {
    if (multiple) {
      onChange(
        selected.includes(choice)
          ? selected.filter((c) => c !== choice)
          : [...selected, choice],
      );
    } else {
      onChange([choice]);
    }
  };

  return (
    <Flex direction="column" gap="2">
      {choices.map((choice, idx) => (
        <Card
          key={idx}
          variant="surface"
          className={`cursor-pointer border transition ${
            selected.includes(choice) ? "border-blue-500 bg-blue-50" : "border-slate-200"
          }`}
          onClick={() => toggle(choice)}
        >
          <Flex align="center" gap="2">
            {selected.includes(choice) ? (
              <CheckCircledIcon className="text-blue-600" />
            ) : (
              <CircleIcon className="text-slate-400" />
            )}
            <MarkdownContent className="prose prose-slate max-w-none text-sm" content={choice} />
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}

type SortableItemProps = {
  id: string;
  content: string;
};

function SortableItem({ id, content }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant="surface"
      className="border border-dashed border-slate-300 bg-slate-50"
      {...attributes}
      {...listeners}
    >
      <Flex align="center" gap="2">
        <DragHandleDots2Icon className="text-slate-500" />
        <MarkdownContent className="prose prose-slate max-w-none text-sm" content={content} />
      </Flex>
    </Card>
  );
}

type OrderingProps = {
  choices: string[];
  onChange?: (next: string[]) => void;
};

function OrderingAnswer({ choices, onChange }: OrderingProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [items, setItems] = useState<string[]>(choices);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(active.id as string);
    const newIndex = items.indexOf(over.id as string);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    onChange?.(next);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <Flex direction="column" gap="2">
          {items.map((choice) => (
            <SortableItem key={choice} id={choice} content={choice} />
          ))}
        </Flex>
      </SortableContext>
    </DndContext>
  );
}

type ShortAnswerProps = {
  value: string;
  onChange: (value: string) => void;
};

function ShortAnswer({ value, onChange }: ShortAnswerProps) {
  return (
    <Flex direction="column" gap="2">
      <Text size="2" color="gray">
        回答を入力してください
      </Text>
      <TextArea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="ここに回答を入力"
        rows={2}
      />
    </Flex>
  );
}

type AnswerAreaProps = {
  questionType: "multipleChoice" | "ordering" | "shortAnswer";
  choices?: string[];
  allowMultiple?: boolean;
  onOrderingChange?: (next: string[]) => void;
  onShortAnswerChange?: (value: string) => void;
  onMultipleChoiceChange?: (next: string[]) => void;
  selectedChoices?: string[];
  shortAnswerValue?: string;
};

/**
 * 出題タイプに応じて入力UIを切り替えるコンポーネント。
 */
export function AnswerArea({
  questionType,
  choices = [],
  allowMultiple = false,
  onOrderingChange,
  onShortAnswerChange,
  onMultipleChoiceChange,
  selectedChoices = undefined,
  shortAnswerValue = "",
}: AnswerAreaProps) {
  const normalizedSelectedChoices = useMemo(
    () => selectedChoices ?? [],
    [selectedChoices],
  );

  const [selected, setSelected] = useState<string[]>(normalizedSelectedChoices);
  const [shortValue, setShortValue] = useState<string>(shortAnswerValue);

  useEffect(() => {
    setSelected(normalizedSelectedChoices);
  }, [normalizedSelectedChoices]);

  useEffect(() => {
    setShortValue(shortAnswerValue);
  }, [shortAnswerValue]);

  const isMultipleChoice = questionType === "multipleChoice";
  const isOrdering = questionType === "ordering";
  const isShort = questionType === "shortAnswer";

  const normalizedChoices = useMemo(
    () => choices.filter((c): c is string => typeof c === "string"),
    [choices],
  );

  if (isMultipleChoice) {
    return (
      <Card variant="surface" className="border border-slate-200">
        <Flex justify="between" align="center" mb="2">
          <Text weight="medium">解答欄</Text>
          <Badge variant="soft">{allowMultiple ? "複数選択可" : "単一選択"}</Badge>
        </Flex>
        <MultipleChoiceAnswer
          choices={normalizedChoices}
          selected={selected}
          multiple={allowMultiple}
          onChange={(next) => {
            setSelected(next);
            onMultipleChoiceChange?.(next);
          }}
        />
      </Card>
    );
  }

  if (isOrdering) {
    return (
      <Card variant="surface" className="border border-slate-200">
        <Flex justify="between" align="center" mb="2">
          <Text weight="medium">解答欄</Text>
          <Badge variant="soft">ドラッグして並び替え</Badge>
        </Flex>
        <OrderingAnswer
          choices={normalizedChoices}
          onChange={(next) => {
            console.log("ordered choices", next);
            onOrderingChange?.(next);
          }}
        />
      </Card>
    );
  }

  if (isShort) {
    return (
      <Card variant="surface" className="border border-slate-200">
        <Flex justify="between" align="center" mb="2">
          <Text weight="medium">解答欄</Text>
          <Badge variant="soft">記述式</Badge>
        </Flex>
        <ShortAnswer
          value={shortValue}
          onChange={(value) => {
            setShortValue(value);
            console.log("short answer", value);
            onShortAnswerChange?.(value);
          }}
        />
      </Card>
    );
  }

  return (
    <Flex direction="column" gap="2">
      <Text color="gray">未対応の設問タイプです。</Text>
      <Button disabled>回答不可</Button>
    </Flex>
  );
}
