"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { CopyButton } from "@/components/ui/CopyButton";
import { Drawer } from "@/components/ui/Drawer";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

type UnitItem = {
  id: string;
  name: string;
};

export function UnitListDrawer() {
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchUnits = async () => {
      try {
        const snapshot = await getDocs(collection(db, "units"));
        if (!mounted) return;
        const items = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: (data.name as string) ?? "",
          };
        });
        setUnits(items);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchUnits();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Drawer
      triggerLabel="単元一覧を見る"
      title="既存の単元一覧"
      description="登録済みの単元一覧を表示します。"
    >
      {loading ? (
        <Text size="2" color="gray">
          読み込み中...
        </Text>
      ) : (
        <Flex direction="column" gap="2">
          {units.map((unit) => (
            <Flex
              key={unit.id}
              justify="between"
              className="rounded-md border border-slate-200 px-3 py-2"
            >
              <Box>
                <Text size="2">{unit.name}</Text>
                <Text size="1" color="gray">
                  {unit.id}
                </Text>
              </Box>
              <CopyButton value={unit.id} />
            </Flex>
          ))}
          {units.length === 0 ? (
            <Text size="2" color="gray">
              登録済みの単元がありません。
            </Text>
          ) : null}
        </Flex>
      )}
      <Box mt="4">
        <Text size="2" color="gray">
          unitIdは管理画面のIDコピーから取得して入力してください。
        </Text>
      </Box>
    </Drawer>
  );
}
