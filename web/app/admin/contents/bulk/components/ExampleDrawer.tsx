"use client";

import { Box, Text } from "@radix-ui/themes";
import { Drawer } from "@/components/ui/Drawer";

const exampleJson = `{
  "contents": [
    {
      "lessonId": "existingLessonId",
      "type": "video",
      "title": "導入動画",
      "metadata": { "youtubeVideoId": "xxxx", "durationSec": 600 }
    },
    {
      "lessonId": "existingLessonId",
      "type": "quiz",
      "title": "確認テスト",
      "metadata": {
        "questionIds": ["questionIdA", "questionIdB"],
        "questionsPerAttempt": 5,
        "allowRetry": true
      }
    },
    {
      "lessonId": "existingLessonId",
      "type": "link",
      "title": "参考資料",
      "metadata": { "url": "https://example.com" }
    }
  ]
}`;

export function ExampleDrawer() {
  return (
    <Drawer triggerLabel="入力例を見る" title="入力例">
      <Box className="rounded-md bg-slate-900/95 p-4 text-sm text-slate-100">
        <pre>{exampleJson}</pre>
      </Box>
      <Text size="2" color="gray" mt="3">
        typeごとにmetadataの必須項目が異なります。
      </Text>
    </Drawer>
  );
}
