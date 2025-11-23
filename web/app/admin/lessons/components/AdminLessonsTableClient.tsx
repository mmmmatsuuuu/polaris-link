"use client";

import { Badge, Button } from "@radix-ui/themes";
import { ContentsTable } from "@/components/ui/ContentsTable";

type LessonRow = {
  title: string;
  subject: string;
  unit: string;
  contents: number;
  status: string;
};

type Props = {
  rows: LessonRow[];
};

export function AdminLessonsTableClient({ rows }: Props) {
  return (
    <ContentsTable
      title="授業一覧"
      columns={[
        { header: "授業名", cell: (row) => row.title, sortValue: (row) => row.title },
        { header: "科目", cell: (row) => row.subject, sortValue: (row) => row.subject },
        { header: "単元", cell: (row) => row.unit, sortValue: (row) => row.unit },
        { header: "コンテンツ数", cell: (row) => `${row.contents} 件`, sortValue: (row) => row.contents },
        {
          header: "公開状態",
          cell: (row) => (
            <Badge variant="soft" color={row.status === "公開" ? "green" : "gray"}>
              {row.status}
            </Badge>
          ),
          sortValue: (row) => row.status,
        },
        {
          header: "操作",
          cell: () => (
            <div className="flex gap-2">
              <Button variant="soft" size="2">
                編集
              </Button>
              <Button variant="outline" color="red" size="2">
                削除
              </Button>
            </div>
          ),
        },
      ]}
      rows={rows}
      getRowKey={(row) => row.title}
      rowsPerPage={5}
    />
  );
}
