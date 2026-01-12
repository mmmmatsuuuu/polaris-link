"use client";

import { Box, Text } from "@radix-ui/themes";
import { Drawer } from "@/components/ui/Drawer";

const exampleJson = `{
  "questions": [
    {
      "questionType": "multipleChoice",
      "prompt": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "一次関数 y = 2x + 3 において、xが1増えるとyはどう変化しますか？" }] }] },
      "choices": [
        { "key": "choice-1", "label": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "1増える" }] }] } },
        { "key": "choice-2", "label": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "2増える" }] }] } },
        { "key": "choice-3", "label": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "3増える" }] }] } },
        { "key": "choice-4", "label": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "2減る" }] }] } }
      ],
      "correctAnswer": "choice-2",
      "explanation": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "傾きが2なので、xが1増えるとyは2増えます。" }] }] },
      "difficulty": "easy",
      "tags": ["linear", "slope"]
    },
    {
      "questionType": "multipleChoice",
      "prompt": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "一次関数 y = -3x + 5 のy切片はどれですか？" }] }] },
      "choices": [
        { "key": "choice-1", "label": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "-3" }] }] } },
        { "key": "choice-2", "label": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "5" }] }] } },
        { "key": "choice-3", "label": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "-5" }] }] } },
        { "key": "choice-4", "label": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "3" }] }] } }
      ],
      "correctAnswer": "choice-2",
      "explanation": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "y切片はx=0のときのyの値なので5です。" }] }] },
      "difficulty": "easy",
      "tags": ["linear", "intercept"]
    },
    {
      "questionType": "ordering",
      "prompt": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "次の手順を、一次関数のグラフを描く順に並べてください。" }] }] },
      "choices": [
        { "key": "choice-1", "label": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "傾きを確認する" }] }] } },
        { "key": "choice-2", "label": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "y切片をとる" }] }] } },
        { "key": "choice-3", "label": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "切片から傾きで2点目を決める" }] }] } },
        { "key": "choice-4", "label": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "2点を結んで直線を引く" }] }] } }
      ],
      "correctAnswer": ["choice-2", "choice-1", "choice-3", "choice-4"],
      "explanation": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "まずy切片を取り、傾きを確認して2点目を決め、直線を引きます。" }] }] },
      "difficulty": "medium",
      "tags": ["linear", "graph"]
    },
    {
      "questionType": "shortAnswer",
      "prompt": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "一次関数 y = 4x - 7 の傾きを答えてください。" }] }] },
      "choices": [],
      "correctAnswer": "4",
      "explanation": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "xの係数が傾きです。" }] }] },
      "difficulty": "easy",
      "tags": ["linear", "slope"]
    },
    {
      "questionType": "shortAnswer",
      "prompt": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "点(2, 5)を通る一次関数で、傾きが1のときの式を答えてください。" }] }] },
      "choices": [],
      "correctAnswer": "y = x + 3",
      "explanation": { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "y = x + b とおき、5 = 2 + b なので b = 3 です。" }] }] },
      "difficulty": "medium",
      "tags": ["linear", "equation"]
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
        multipleChoice/orderingではchoicesが必須です。
      </Text>
    </Drawer>
  );
}
