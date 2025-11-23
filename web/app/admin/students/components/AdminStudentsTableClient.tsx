"use client";

import { Badge, Button } from "@radix-ui/themes";
import { ContentsTable } from "@/components/ui/ContentsTable";
import { AdminStudentsModal } from "./AdminStudentsModal";

type StudentRow = {
  name: string;
  email: string;
  status: string;
  lastLogin: string;
};

type Props = {
  rows: StudentRow[];
};

export function AdminStudentsTableClient({ rows }: Props) {
  return (
    <ContentsTable
      title="生徒一覧"
      actions={<AdminStudentsModal apiEndpoint="/api/admin/students" triggerLabel="新規作成" />}
      columns={[
        { header: "氏名", cell: (row) => row.name, sortValue: (row) => row.name },
        { header: "メール", cell: (row) => row.email, sortValue: (row) => row.email },
        { header: "最終ログイン", cell: (row) => row.lastLogin, sortValue: (row) => row.lastLogin },
        {
          header: "ステータス",
          cell: (row) => (
            <Badge variant="soft" color={row.status === "有効" ? "green" : "gray"}>
              {row.status}
            </Badge>
          ),
          sortValue: (row) => row.status,
        },
        {
          header: "操作",
          cell: () => (
            <div className="flex gap-2">
              <AdminStudentsModal apiEndpoint="/api/admin/students" triggerLabel="編集" />
              <Button variant="outline" color="red" size="2">
                削除
              </Button>
            </div>
          ),
        },
      ]}
      rows={rows}
      getRowKey={(row) => row.email}
      rowsPerPage={5}
      
    />
  );
}
