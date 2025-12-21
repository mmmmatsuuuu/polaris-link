"use client";

import { Flex, Text, TextField } from "@radix-ui/themes";

type VideoFieldProps = {
  disabled?: boolean;
  metadata: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
};

export function VideoField({ disabled, metadata, onChange }: VideoFieldProps) {
  return (
    <Flex gap="3">
      <div className="flex-1">
        <Text size="2" color="gray">
          YouTube Video ID
        </Text>
        <TextField.Root
          disabled={disabled}
          value={(metadata as any)?.youtubeVideoId ?? ""}
          onChange={(e) =>
            onChange({
              ...metadata,
              youtubeVideoId: e.target.value,
            })
          }
        />
      </div>
      <div className="flex-1">
        <Text size="2" color="gray">
          長さ（秒）
        </Text>
        <TextField.Root
          type="number"
          disabled={disabled}
          value={(metadata as any)?.durationSec ?? 0}
          onChange={(e) =>
            onChange({
              ...metadata,
              durationSec: Number(e.target.value) || 0,
            })
          }
        />
      </div>
    </Flex>
  );
}
