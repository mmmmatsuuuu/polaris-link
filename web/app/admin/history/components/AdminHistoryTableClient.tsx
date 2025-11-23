"use client";

import { Badge, Box, Button, Flex, Text } from "@radix-ui/themes";
import { ContentsTable } from "@/components/ui/ContentsTable";

type HistoryRow = {
  subject: string;
  lesson: string;
  user: string;
  watch: string;
  quiz: string;
};

type Props = {
  rows: HistoryRow[];
};

export function AdminHistoryTableClient({ rows }: Props) {
  return (
    <ContentsTable
      title="利用履歴"
      description="期間や科目ごとの利用ログを確認できます。"
      actions={
        <Flex gap="3" wrap="wrap">
          <Flex gap="2" wrap="wrap">
            <Badge variant="soft">期間: 今月</Badge>
            <Badge variant="soft">科目: 情報リテラシー</Badge>
          </Flex>
          <Flex gap="2">
            <Button variant="soft">CSVエクスポート</Button>
            <Button color="red" variant="soft">
              古いログを削除
            </Button>
          </Flex>
        </Flex>
      }
      columns={[
        {
          header: "科目/授業",
          cell: (row) => (
            <Box>
              <Text weight="medium">{row.lesson}</Text>
              <Text size="2" color="gray">
                {row.subject}
              </Text>
            </Box>
          ),
          sortValue: (row) => row.lesson,
        },
        { header: "ユーザー", cell: (row) => row.user, sortValue: (row) => row.user },
        { header: "視聴時間", cell: (row) => row.watch, sortValue: (row) => row.watch },
        { header: "小テスト", cell: (row) => row.quiz, sortValue: (row) => row.quiz },
      ]}
      rows={rows}
      rowsPerPage={5}
    />
  );
}
