"use client";

import { Box, Text } from "@radix-ui/themes";
import { Drawer } from "@/components/ui/Drawer";

const exampleJson = `{
  "lessons": [
    {
      "unitId": "OzqcD90NPVEM8HdWDdVb",
      "title": "一次関数の導入",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "一次関数の基本的な考え方を確認します。" }] }] },
      "contentIds": ["a6SxIG6RpDW7fObytdJC", "dqrrUf3gVF7FEgXPe0Hy"],
      "tags": ["math", "linear"],
      "publishStatus": "public"
    },
    {
      "unitId": "OzqcD90NPVEM8HdWDdVb",
      "title": "変化の割合",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "変化の割合の意味と計算方法を学びます。" }] }] },
      "contentIds": [],
      "tags": ["math", "linear"],
      "publishStatus": "public"
    },
    {
      "unitId": "OzqcD90NPVEM8HdWDdVb",
      "title": "グラフの描き方",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "一次関数のグラフを描く手順を整理します。" }] }] },
      "contentIds": [],
      "tags": ["math", "graph"],
      "publishStatus": "public"
    },
    {
      "unitId": "OzqcD90NPVEM8HdWDdVb",
      "title": "文章題演習",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "文章題から一次関数を立式する練習を行います。" }] }] },
      "contentIds": [],
      "tags": ["math", "practice"],
      "publishStatus": "private"
    }
  ]
}
`;

export function ExampleDrawer() {
  return (
    <Drawer triggerLabel="入力例を見る" title="入力例">
      <Box className="w-full rounded-md bg-slate-900/95 p-4 text-sm text-slate-100 overflow-auto">
        <pre>{exampleJson}</pre>
      </Box>
      <Text size="2" color="gray" mt="3">
        必須項目はunitIdとtitleです。JSONはUTF-8で保存してください。
      </Text>
    </Drawer>
  );
}
