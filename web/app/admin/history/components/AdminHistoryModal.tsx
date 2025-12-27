"use client";

import { Button, Dialog, Flex, Text } from "@radix-ui/themes";
import { FullScreenModal } from "@/components/ui/FullScreenModal";

type AdminHistoryModalProps = {
  apiEndpoint: string;
  triggerLabel?: string;
};

export function AdminHistoryModal({ apiEndpoint, triggerLabel = "フィルター" }: AdminHistoryModalProps) {
  return (
    <FullScreenModal
      triggerLabel={triggerLabel}
      actions={
        <>
          <Dialog.Close>
            <Button variant="soft" color="gray">
              キャンセル
            </Button>
          </Dialog.Close>
          <Button>適用</Button>
        </>
      }
    >
      <Flex direction="column" gap="3">
        <Text size="2" color="gray">期間: 今月</Text>
        <Text size="2" color="gray">科目: 情報リテラシー</Text>
        <Text size="2" color="gray">API: {apiEndpoint}</Text>
      </Flex>
    </FullScreenModal>
  );
}
