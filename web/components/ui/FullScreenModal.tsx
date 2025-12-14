"use client";

import { Box, Button, Dialog, Flex, Text } from "@radix-ui/themes";
import type { ReactNode } from "react";

type FullScreenModalProps = {
  triggerLabel?: string;
  trigger?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideOverlay?: boolean;
};

/**
 * フルスクリーン表示のモーダル。Radix Dialog をベースにし、幅・高さともに画面いっぱいに広げます。
 */
export function FullScreenModal({
  triggerLabel = "開く",
  trigger,
  title,
  description,
  children,
  actions,
  open,
  onOpenChange,
}: FullScreenModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger>
        {trigger ?? <Button radius="full">{triggerLabel}</Button>}
      </Dialog.Trigger>
      <Dialog.Content
        className="fullscreen-modal"
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          margin: 0,
          borderRadius: 0,
          padding: "24px",
        }}
      >
        <Flex justify="between" align="start" mb="4">
          <Box>
            <Dialog.Title hidden={!title}>{title}</Dialog.Title>
            <Dialog.Description hidden={!description}>
              <Text size="2" color="gray">
                {description}
              </Text>
            </Dialog.Description>
          </Box>
        </Flex>

        <Box style={{ overflowY: "auto" }}>
          {children}
        </Box>

        <Flex justify="end" gap="2" mt="4">
          {actions}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
