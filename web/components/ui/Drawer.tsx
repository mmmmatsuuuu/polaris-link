"use client";

import { Box, Button, Dialog, Flex, Text } from "@radix-ui/themes";
import type { ReactNode } from "react";

type DrawerProps = {
  /** ドロワーを開くトリガーラベル（自由にカスタムしたい場合はtriggerを使う） */
  triggerLabel?: string;
  /** カスタムトリガーを使いたい場合はこちら（例: <Button>開く</Button>） */
  trigger?: ReactNode;
  /** ドロワーのタイトル */
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
 * 右側から開くドロワー。Radix Dialog をベースにしています。
 */
export function Drawer({
  triggerLabel = "開く",
  trigger,
  title,
  description,
  children,
  actions,
  open,
  onOpenChange,
}: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger>
        {trigger ?? <Button radius="full">{triggerLabel}</Button>}
      </Dialog.Trigger>
      <Dialog.Content
        className="drawer-content"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "fit-content",
          maxWidth: "92vw",
          height: "100vh",
          margin: 0,
          borderRadius: "0",
        }}
      >
        <Flex direction="column" height="100%">
          <Flex justify="between" align="start" mb="3">
            <Box>
              <Dialog.Title hidden={!title}>{title}</Dialog.Title>
              <Dialog.Description hidden={!description}>
                <Text size="2" color="gray">
                  {description}
                </Text>
              </Dialog.Description>
            </Box>
          </Flex>

          <Box style={{ flex: 1, overflowY: "auto" }}>{children}</Box>

          <Flex justify="end" gap="2" mt="4">
            {actions}
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
