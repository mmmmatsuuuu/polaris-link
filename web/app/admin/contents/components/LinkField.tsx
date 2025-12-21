"use client";

import { Text, TextField } from "@radix-ui/themes";

type LinkFieldProps = {
  disabled?: boolean;
  metadata: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
};

export function LinkField({ disabled, metadata, onChange }: LinkFieldProps) {
  return (
    <div>
      <Text size="2" color="gray">
        URL
      </Text>
      <TextField.Root
        disabled={disabled}
        value={(metadata as any)?.url ?? ""}
        onChange={(e) =>
          onChange({
            ...metadata,
            url: e.target.value,
          })
        }
      />
    </div>
  );
}
