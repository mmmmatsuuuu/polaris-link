"use client";

import { Badge, Button } from "@radix-ui/themes";
import { ContentsTable } from "@/components/ui/ContentsTable";

type UnitRow = {
  name: string;
  subject: string;
  lessons: number;
  status: string;
};

type Props = {
  rows: UnitRow[];
};

export function AdminUnitsTableClient({ rows }: Props) {
  return (
    <ContentsTable
      title="単元一覧"
      columns={[
        { header: "単元名", cell: (row) => row.name, sortValue: (row) => row.name },
        { header: "科目", cell: (row) => row.subject, sortValue: (row) => row.subject },
        { header: "授業数", cell: (row) => `${row.lessons} 件`, sortValue: (row) => row.lessons },
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
      getRowKey={(row) => row.name}
      rowsPerPage={5}
    />
  );
}
