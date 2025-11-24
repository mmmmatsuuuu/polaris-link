"use client";

import { Box, Button, Dialog, Flex, Text } from "@radix-ui/themes";
import type { ReactNode } from "react";

type ModalProps = {
  /** モーダルを開くトリガーボタンのラベル（自由にカスタムしたい場合はtriggerを使う） */
  triggerLabel?: string;
  /** カスタムトリガーを使いたい場合はこちら（例: <Button>開く</Button>） */
  trigger?: ReactNode;
  /** モーダルのタイトル */
  title?: ReactNode;
  /** タイトル下の説明 */
  description?: ReactNode;
  /** 本文コンテンツ。各ページ側でラッパーを用意して個別実装してください。 */
  children: ReactNode;
  /** フッターのアクション（保存ボタンなど） */
  actions?: ReactNode;
  /** 開閉検知が必要な場合に利用 */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * シンプルなモーダル。本文は各ページ側のラッパーで自由に実装できます。
 */
export function Modal({
  triggerLabel = "開く",
  trigger,
  title,
  description,
  children,
  actions,
  open,
  onOpenChange,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger>
        {trigger ?? (
          <Button radius="full">
            {triggerLabel}
          </Button>
        )}
      </Dialog.Trigger>

      <Dialog.Content
        maxWidth="720px"
        style={{
          width: "min(90vw, 720px)",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <Flex justify="between" align="start" mb="3">
          <Box>
            <Dialog.Title hidden={!title}>
              {title}
            </Dialog.Title>
            <Dialog.Description hidden={!description}>
              <Text size="2" color="gray">{description}</Text>
            </Dialog.Description>
          </Box>
        </Flex>

        <Box>
          {children}
        </Box>

        {actions && (
          <Flex justify="end" gap="2" mt="4">
            {actions}
          </Flex>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
