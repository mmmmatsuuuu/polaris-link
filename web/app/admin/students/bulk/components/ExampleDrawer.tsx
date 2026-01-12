"use client";

import { Box, Text } from "@radix-ui/themes";
import { Drawer } from "@/components/ui/Drawer";

const exampleJson = `{
  "students": [
    {
      "displayName": "田中 太郎",
      "email": "taro.tanaka@example.com",
      "studentNumber": 1001,
      "notes": "サンプル生徒"
    },
    {
      "displayName": "佐藤 花子",
      "email": "hanako.sato@example.com",
      "studentNumber": 1002,
      "notes": "サンプル生徒"
    },
    {
      "displayName": "鈴木 健",
      "email": "ken.suzuki@example.com",
      "studentNumber": 1003,
      "notes": "サンプル生徒"
    },
    {
      "displayName": "高橋 美咲",
      "email": "misaki.takahashi@example.com",
      "studentNumber": 1004,
      "notes": "サンプル生徒"
    },
    {
      "displayName": "伊藤 大輔",
      "email": "daisuke.ito@example.com",
      "studentNumber": 1005,
      "notes": "サンプル生徒"
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
        必須項目はemailです。JSONはUTF-8で保存してください。
      </Text>
    </Drawer>
  );
}
