"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { CopyButton } from "@/components/ui/CopyButton";
import { Drawer } from "@/components/ui/Drawer";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

type ContentItem = {
  id: string;
  title: string;
  type: string;
  tags: string[];
};

export function ContentListDrawer() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchContents = async () => {
      try {
        const snapshot = await getDocs(collection(db, "contents"));
        if (!mounted) return;
        const items = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: (data.title as string) ?? "",
            type: (data.type as string) ?? "-",
            tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
          };
        });
        setContents(items);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchContents();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Drawer
      triggerLabel="コンテンツ一覧を見る"
      title="既存のコンテンツ一覧"
      description="登録済みのコンテンツ一覧を表示します。"
    >
      {loading ? (
        <Text size="2" color="gray">
          読み込み中...
        </Text>
      ) : (
        <Flex direction="column" gap="2">
          {contents.map((content) => (
            <Flex
              key={content.id}
              justify="between"
              className="rounded-md border border-slate-200 px-3 py-2"
            >
              <Box>
                <Text size="2">{content.title}</Text>
                <Flex gap="2" mt="1">
                  <Text size="1" color="gray">
                    type: {content.type}
                  </Text>
                  {content.tags.length ? (
                    <Text size="1" color="gray">
                      tags: {content.tags.join(", ")}
                    </Text>
                  ) : null}
                </Flex>
                <Text size="1" color="gray">
                  {content.id}
                </Text>
              </Box>
              <CopyButton value={content.id} />
            </Flex>
          ))}
          {contents.length === 0 ? (
            <Text size="2" color="gray">
              登録済みのコンテンツがありません。
            </Text>
          ) : null}
        </Flex>
      )}
      <Box mt="4">
        <Text size="2" color="gray">
          contentIdsに指定するIDは管理画面のIDコピーから取得してください。
        </Text>
      </Box>
    </Drawer>
  );
}
