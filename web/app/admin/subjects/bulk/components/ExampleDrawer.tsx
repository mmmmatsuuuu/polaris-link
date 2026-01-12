"use client";

import { Box, Text } from "@radix-ui/themes";
import { Drawer } from "@/components/ui/Drawer";

const exampleJson = `{
  "subjects": [
    {
      "name": "数学",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "数学の基礎と応用" }] }] },
      "publishStatus": "public"
    },
    {
      "name": "英語",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "読解と文法の基礎" }] }] },
      "publishStatus": "public"
    },
    {
      "name": "物理",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "力学と電磁気の入門" }] }] },
      "publishStatus": "public"
    },
    {
      "name": "化学",
      "description": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "化学反応と物質の性質" }] }] },
      "publishStatus": "private"
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
        必須項目はnameです。JSONはUTF-8で保存してください。
      </Text>
    </Drawer>
  );
}
