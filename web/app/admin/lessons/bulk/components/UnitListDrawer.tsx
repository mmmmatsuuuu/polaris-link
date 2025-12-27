"use client";

import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { Drawer } from "@/components/ui/Drawer";

type UnitSample = {
  id: string;
  name: string;
};

const unitSamples: UnitSample[] = [
  { id: "unit_001", name: "一次関数" },
  { id: "unit_002", name: "二次関数" },
  { id: "unit_003", name: "指数対数" },
];

export function UnitListDrawer() {
  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  return (
    <Drawer
      triggerLabel="単元一覧を見る"
      title="既存の単元一覧"
      description="参考表示用のモックです。実装時はFirestoreの一覧を表示します。"
    >
      <Flex direction="column" gap="2">
        {unitSamples.map((unit) => (
          <Flex
            key={unit.id}
            justify="between"
            className="rounded-md border border-slate-200 bg-white px-3 py-2"
          >
            <Box>
              <Text size="2">{unit.name}</Text>
              <Text size="1" color="gray">
                {unit.id}
              </Text>
            </Box>
            <Button size="1" variant="soft" onClick={() => void handleCopy(unit.id)}>
              IDをコピー
            </Button>
          </Flex>
        ))}
      </Flex>
      <Box mt="4">
        <Text size="2" color="gray">
          unitIdは管理画面のIDコピーから取得して入力してください。
        </Text>
      </Box>
    </Drawer>
  );
}
