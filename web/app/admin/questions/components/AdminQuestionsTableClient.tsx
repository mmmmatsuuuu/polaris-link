"use client";

import { Badge, Button } from "@radix-ui/themes";
import { ContentsTable } from "@/components/ui/ContentsTable";
import { AdminQuestionsModal } from "./AdminQuestionsModal";

type QuestionRow = {
  prompt: string;
  type: string;
  difficulty: string;
  status: string;
};

type Props = {
  rows: QuestionRow[];
};

export function AdminQuestionsTableClient({ rows }: Props) {
  return (
    <ContentsTable
      title="問題一覧"
      actions={<AdminQuestionsModal apiEndpoint="/api/admin/questions" triggerLabel="新規作成" />}
      columns={[
        { header: "問題文", cell: (row) => row.prompt, sortValue: (row) => row.prompt },
        { header: "種別", cell: (row) => row.type, sortValue: (row) => row.type },
        { header: "難易度", cell: (row) => row.difficulty, sortValue: (row) => row.difficulty },
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
              <AdminQuestionsModal apiEndpoint="/api/admin/questions" triggerLabel="編集" />
              <Button variant="outline" color="red" size="2">
                削除
              </Button>
            </div>
          ),
        },
      ]}
      rows={rows}
      getRowKey={(row) => row.prompt}
      rowsPerPage={5}
    />
  );
}
