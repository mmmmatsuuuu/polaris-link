"use client";

import { Badge, Button } from "@radix-ui/themes";
import { ContentsTable } from "@/components/ui/ContentsTable";

type SubjectRow = {
  name: string;
  status: string;
  units: number;
  updated: string;
};

type Props = {
  rows: SubjectRow[];
};

export function AdminSubjectsTableClient({ rows }: Props) {
  return (
    <ContentsTable
      title="科目一覧"
      columns={[
        { header: "科目名", cell: (row) => row.name, sortValue: (row) => row.name },
        {
          header: "公開状態",
          cell: (row) => (
            <Badge color={row.status === "公開" ? "green" : "gray"} variant="soft">
              {row.status}
            </Badge>
          ),
          sortValue: (row) => row.status,
        },
        { header: "紐付け単元", cell: (row) => `${row.units} 単元`, sortValue: (row) => row.units },
        { header: "更新日", cell: (row) => row.updated, sortValue: (row) => Date.parse(row.updated) },
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
      getRowKey={(row) => row.name}
      rowsPerPage={5}
    />
  );
}
