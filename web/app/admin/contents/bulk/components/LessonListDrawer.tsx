"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import { CopyButton } from "@/components/ui/CopyButton";
import { Drawer } from "@/components/ui/Drawer";

type LessonSample = {
  id: string;
  title: string;
};

const lessonSamples: LessonSample[] = [
  { id: "lesson_001", title: "導入" },
  { id: "lesson_002", title: "演習" },
  { id: "lesson_003", title: "まとめ" },
];

export function LessonListDrawer() {
  return (
    <Drawer
      triggerLabel="授業一覧を見る"
      title="既存の授業一覧"
      description="登録済みの授業一覧を表示します。"
    >
      <Flex direction="column" gap="2">
        {lessonSamples.map((lesson) => (
          <Flex
            key={lesson.id}
            justify="between"
            className="rounded-md border border-slate-200 bg-white px-3 py-2"
          >
            <Box>
              <Text size="2">{lesson.title}</Text>
              <Text size="1" color="gray">
                {lesson.id}
              </Text>
            </Box>
            <CopyButton value={lesson.id} />
          </Flex>
        ))}
      </Flex>
      <Box mt="4">
        <Text size="2" color="gray">
          lessonIdは管理画面のIDコピーから取得して入力してください。
        </Text>
      </Box>
    </Drawer>
  );
}
