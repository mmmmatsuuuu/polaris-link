"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import { CopyButton } from "@/components/ui/CopyButton";
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
  return (
    <Drawer
      triggerLabel="科目一覧を見る"
      title="既存の科目一覧"
      description="登録済みの科目一覧を表示します。"
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
            <CopyButton value={subject.id} />
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
