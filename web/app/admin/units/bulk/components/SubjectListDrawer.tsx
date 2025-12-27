"use client";

import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { Drawer } from "@/components/ui/Drawer";

type SubjectSample = {
  id: string;
  name: string;
};

const subjectSamples: SubjectSample[] = [
  { id: "subject_001", name: "数学" },
  { id: "subject_002", name: "英語" },
  { id: "subject_003", name: "化学" },
];

export function SubjectListDrawer() {
  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  return (
    <Drawer
      triggerLabel="科目一覧を見る"
      title="既存の科目一覧"
      description="参考表示用のモックです。実装時はFirestoreの一覧を表示します。"
    >
      <Flex direction="column" gap="2">
        {subjectSamples.map((subject) => (
          <Flex
            key={subject.id}
            justify="between"
            className="rounded-md border border-slate-200 bg-white px-3 py-2"
          >
            <Box>
              <Text size="2">{subject.name}</Text>
              <Text size="1" color="gray">
                {subject.id}
              </Text>
            </Box>
            <Button size="1" variant="soft" onClick={() => void handleCopy(subject.id)}>
              IDをコピー
            </Button>
          </Flex>
        ))}
      </Flex>
      <Box mt="4">
        <Text size="2" color="gray">
          subjectIdは管理画面のIDコピーから取得して入力してください。
        </Text>
      </Box>
    </Drawer>
  );
}
