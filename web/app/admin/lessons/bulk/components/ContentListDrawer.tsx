"use client";

import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { Drawer } from "@/components/ui/Drawer";

type ContentSample = {
  id: string;
  title: string;
};

const contentSamples: ContentSample[] = [
  { id: "content_001", title: "導入動画" },
  { id: "content_002", title: "確認テスト" },
  { id: "content_003", title: "参考資料" },
];

export function ContentListDrawer() {
  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  return (
    <Drawer
      triggerLabel="コンテンツ一覧を見る"
      title="既存のコンテンツ一覧"
      description="参考表示用のモックです。実装時はFirestoreの一覧を表示します。"
    >
      <Flex direction="column" gap="2">
        {contentSamples.map((content) => (
          <Flex
            key={content.id}
            justify="between"
            className="rounded-md border border-slate-200 bg-white px-3 py-2"
          >
            <Box>
              <Text size="2">{content.title}</Text>
              <Text size="1" color="gray">
                {content.id}
              </Text>
            </Box>
            <Button size="1" variant="soft" onClick={() => void handleCopy(content.id)}>
              IDをコピー
            </Button>
          </Flex>
        ))}
      </Flex>
      <Box mt="4">
        <Text size="2" color="gray">
          contentIdsに指定するIDは管理画面のIDコピーから取得してください。
        </Text>
      </Box>
    </Drawer>
  );
}
