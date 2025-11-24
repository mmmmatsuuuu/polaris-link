"use client";

import { useState, KeyboardEvent, useEffect } from "react";
import { Badge, Button, Flex, TextField } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";

type TagInputProps = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function TagInput({ value, onChange, placeholder = "タグを入力してEnterで追加", disabled }: TagInputProps) {
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    // keep local input in sync when parent resets tags
    setInput((prev) => (value.length === 0 ? "" : prev));
  }, [value]);

  const addTag = (raw: string) => {
    const next = raw.trim();
    if (!next) return;
    if (value.includes(next)) {
      setInput("");
      return;
    }
    onChange([...value, next]);
    setInput("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (isComposing) return; // skip IME composing confirmed with composition events
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(input);
    } else if (event.key === "Backspace" && input === "") {
      onChange(value.slice(0, -1));
    }
  };

  const handleRemove = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-col gap-2">
      <TextField.Root
        disabled={disabled}
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        onKeyDown={handleKeyDown}
      />
      <Flex gap="2" wrap="wrap">
        {value.map((tag) => (
          <Badge key={tag} variant="soft" radius="full" color="gray">
            <span className="mr-2">{tag}</span>
            {!disabled && (
              <Button
                size="1"
                variant="ghost"
                color="gray"
                onClick={() => handleRemove(tag)}
                aria-label={`${tag} を削除`}
              >
                <Cross2Icon />
              </Button>
            )}
          </Badge>
        ))}
      </Flex>
    </div>
  );
}
