"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Flex, Text, TextField } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";

export type ChipOption = {
  id: string;
  label: string;
  description?: string;
};

type ChipMultiSelectProps = {
  value: string[];
  options: ChipOption[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  showFilter?: boolean;
  columns?: number;
};

export function ChipMultiSelect({
  value,
  options,
  onChange,
  placeholder = "検索してコンテンツを追加",
  disabled,
  showFilter = true,
  columns = 1,
}: ChipMultiSelectProps) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const keyword = filter.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(keyword) ||
        (opt.description ?? "").toLowerCase().includes(keyword),
    );
  }, [filter, options]);

  const toggle = (id: string) => {
    if (disabled) return;
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {showFilter && (
        <TextField.Root
          disabled={disabled}
          placeholder={placeholder}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      )}

      {value.length > 0 && (
        <Flex gap="2" wrap="wrap">
          {value.map((id) => {
            const opt = options.find((o) => o.id === id);
            const label = opt?.label ?? id;
            return (
              <Badge key={id} variant="soft" radius="full">
                <span className="mr-1">{label}</span>
                {!disabled && (
                  <Button
                    size="1"
                    variant="ghost"
                    color="gray"
                    onClick={() => toggle(id)}
                    aria-label={`${label} を削除`}
                  >
                    <Cross2Icon />
                  </Button>
                )}
              </Badge>
            );
          })}
        </Flex>
      )}

      <Flex
        direction="column"
        gap="2"
        className="max-h-[160px] overflow-y-auto"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.max(1, Math.floor(columns))}, minmax(0, 1fr))`,
        }}
      >
        {filtered
          .filter((opt) => !value.includes(opt.id))
          .map((opt) => (
            <Button
              key={opt.id}
              size="2"
              variant="soft"
              color="gray"
              radius="full"
              disabled={disabled}
              onClick={() => toggle(opt.id)}
              className="justify-start"
            >
              <Flex direction="row" gap="2" align="center" className="overflow-hidden">
                <Text size="2" weight="medium" className="text-nowrap truncate">
                  {opt.label}
                </Text>
                {opt.description && (
                  <Text size="1" color="gray" className="text-nowrap truncate">
                    {opt.description}
                  </Text>
                )}
              </Flex>
            </Button>
          ))}
        {filtered.filter((opt) => !value.includes(opt.id)).length === 0 && (
          <Text size="2" color="gray">
            選択可能な項目がありません
          </Text>
        )}
      </Flex>
    </div>
  );
}
