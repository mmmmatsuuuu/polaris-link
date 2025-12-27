"use client";

import { Box, Text } from "@radix-ui/themes";
import { Drawer } from "@/components/ui/Drawer";

const exampleJson = `{
  "lessons": [
    { "unitId": "existingUnitId", "title": "導入", "publishStatus": "private" }
  ]
}`;

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
