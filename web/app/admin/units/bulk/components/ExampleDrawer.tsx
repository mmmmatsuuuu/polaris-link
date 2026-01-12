"use client";

import { Box, Text } from "@radix-ui/themes";
import { Drawer } from "@/components/ui/Drawer";

const exampleJson = `{
  "units": [
    {
      "subjectId": "Z4BqKIFnqwhvizrIC8a7",
      "name": "一次関数",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "変化の割合とグラフの読み取り" }] }] },
      "publishStatus": "public"
    },
    {
      "subjectId": "Z4BqKIFnqwhvizrIC8a7",
      "name": "二次関数",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "放物線の性質と最大・最小" }] }] },
      "publishStatus": "public"
    },
    {
      "subjectId": "Z4BqKIFnqwhvizrIC8a7",
      "name": "三角関数",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "角度と比、グラフの基本" }] }] },
      "publishStatus": "public"
    },
    {
      "subjectId": "Z4BqKIFnqwhvizrIC8a7",
      "name": "指数・対数",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "指数法則と対数の性質" }] }] },
      "publishStatus": "private"
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
        必須項目はsubjectIdとnameです。JSONはUTF-8で保存してください。
      </Text>
    </Drawer>
  );
}
