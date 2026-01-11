"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { CopyButton } from "@/components/ui/CopyButton";
import { Drawer } from "@/components/ui/Drawer";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

type SubjectItem = {
  id: string;
  name: string;
};

export function SubjectListDrawer() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchSubjects = async () => {
      try {
        const snapshot = await getDocs(collection(db, "subjects"));
        if (!mounted) return;
        const items = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: (data.name as string) ?? "",
          };
        });
        setSubjects(items);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSubjects();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Drawer
      triggerLabel="科目一覧を見る"
      title="既存の科目一覧"
      description="登録済みの科目一覧を表示します。"
    >
      {loading ? (
        <Text size="2" color="gray">
          読み込み中...
        </Text>
      ) : (
        <Flex direction="column" gap="2">
          {subjects.map((subject) => (
            <Flex
              key={subject.id}
              justify="between"
              className="rounded-md border border-slate-200 bg-white px-3 py-2"
            >
              <Box>
                <Text size="2">{subject.name}</Text>
                <Text size="1" color="gray">
                  {subject.id}
                </Text>
              </Box>
              <CopyButton value={subject.id} />
            </Flex>
          ))}
          {subjects.length === 0 ? (
            <Text size="2" color="gray">
              登録済みの科目がありません。
            </Text>
          ) : null}
        </Flex>
      )}
      <Box mt="4">
        <Text size="2" color="gray">
          subjectIdは管理画面のIDコピーから取得して入力してください。
        </Text>
      </Box>
    </Drawer>
  );
}
