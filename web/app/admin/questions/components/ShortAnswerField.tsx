"use client";

import { TextField } from "@radix-ui/themes";

type ShortAnswerFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ShortAnswerField({ value, onChange }: ShortAnswerFieldProps) {
  return (
    <TextField.Root
      placeholder="正解を入力"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
