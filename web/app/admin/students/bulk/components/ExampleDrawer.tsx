"use client";

import { Box, Text } from "@radix-ui/themes";
import { Drawer } from "@/components/ui/Drawer";

const exampleJson = `{
  "students": [
    { "displayName": "田中", "email": "a@example.com", "studentNumber": 1 }
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
