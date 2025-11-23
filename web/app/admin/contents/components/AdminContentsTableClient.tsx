"use client";

import Link from "next/link";
import { Badge, Button } from "@radix-ui/themes";
import { ContentsTable } from "@/components/ui/ContentsTable";
import { AdminContentsModal } from "./AdminContentsModal";

type ContentRow = {
  title: string;
  type: string;
  lesson: string;
  status: string;
};

type Props = {
  rows: ContentRow[];
};

export function AdminContentsTableClient({ rows }: Props) {
  return (
    <ContentsTable
      title="コンテンツ一覧"
      description="動画・小テスト・教材をまとめて管理します。"
      actions={
        <>
          <Button asChild radius="full" variant="soft">
            <Link href="/admin/contents/bulk">CSV一括登録</Link>
          </Button>
          <AdminContentsModal apiEndpoint="/api/admin/contents" triggerLabel="新規作成" />
        </>
      }
      columns={[
        { header: "コンテンツ名", cell: (row) => row.title, sortValue: (row) => row.title },
        { header: "種別", cell: (row) => row.type, sortValue: (row) => row.type },
        { header: "授業", cell: (row) => row.lesson, sortValue: (row) => row.lesson },
        {
          header: "公開状態",
          cell: (row) => (
            <Badge color={row.status === "公開" ? "green" : "gray"} variant="soft">
              {row.status}
            </Badge>
          ),
          sortValue: (row) => row.status,
        },
        {
          header: "操作",
          cell: () => (
            <div className="flex gap-2">
              <AdminContentsModal apiEndpoint="/api/admin/contents" triggerLabel="編集" />
              <Button variant="outline" color="red" size="2">
                削除
              </Button>
            </div>
          ),
        },
      ]}
      rows={rows}
      rowsPerPage={5}
    />
  );
}
