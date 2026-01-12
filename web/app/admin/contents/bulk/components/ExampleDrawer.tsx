"use client";

import { Box, Text } from "@radix-ui/themes";
import { Drawer } from "@/components/ui/Drawer";

const exampleJson = `{
  "contents": [
    {
      "type": "video",
      "title": "一次関数の導入動画",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "一次関数の概要を理解するための動画です。" }] }] },
      "tags": ["math", "intro"],
      "publishStatus": "public",
      "metadata": { "youtubeVideoId": "abc123xyz", "durationSec": 420 }
    },
    {
      "type": "quiz",
      "title": "一次関数の確認テスト",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "一次関数の基本用語を確認します。" }] }] },
      "tags": ["math", "quiz"],
      "publishStatus": "public",
      "metadata": {
        "questionIds": ["769gGA3AyNB0L16H3I1c", "8tnFEPerUyIrc6lR953A", "qwxOtx5HyQiabuauRcS7", "rjmC2NwjrD4mdDwa4RKN", "yFeAMhLeJ4kGsKE9Ul93"],
        "questionsPerAttempt": 5,
        "allowRetry": true
      }
    },
    {
      "type": "link",
      "title": "補足資料",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "復習用の外部資料へのリンクです。" }] }] },
      "tags": ["math", "reference"],
      "publishStatus": "public",
      "metadata": { "url": "https://example.com/linear-function" }
    }
  ]
}
`;

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
