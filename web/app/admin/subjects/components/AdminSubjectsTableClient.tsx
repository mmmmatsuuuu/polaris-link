"use client";

import { Badge, Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContentsTable } from "@/components/ui/ContentsTable";
import { AdminSubjectsModal } from "./AdminSubjectsModal";

type SubjectRow = {
  id: string;
  name: string;
  status: string;
  units: number;
  updated: string;
};

type Props = {
  rows: SubjectRow[];
};

export function AdminSubjectsTableClient({ rows }: Props) {
  const router = useRouter();
  const [modalState, setModalState] = useState<{
    mode: "create" | "edit";
    id?: string;
    open: boolean;
  }>({ mode: "create", open: false });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => setModalState({ mode: "create", open: true });
  const openEdit = (id: string) =>
    setModalState({ mode: "edit", id, open: true });
  const closeModal = () =>
    setModalState((prev) => ({ ...prev, open: false, id: undefined }));

  const handleDelete = async (id: string) => {
    if (!window.confirm("この科目を削除しますか？")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error((await res.json().catch(() => null))?.error);
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <ContentsTable
        title="科目一覧"
        actions={
          <Button radius="full" onClick={openCreate}>
            科目を追加
          </Button>
        }
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
            cell: (row) => (
              <div className="flex gap-2">
                <Button variant="soft" size="2" onClick={() => openEdit(row.id)}>
                  編集
                </Button>
                <Button
                  variant="outline"
                  color="red"
                  size="2"
                  onClick={() => handleDelete(row.id)}
                  disabled={deletingId === row.id}
                >
                  {deletingId === row.id ? "削除中..." : "削除"}
                </Button>
              </div>
            ),
          },
        ]}
        rows={rows}
        getRowKey={(row) => row.id}
        rowsPerPage={5}
      />

      <AdminSubjectsModal
        mode={modalState.mode}
        subjectId={modalState.id}
        open={modalState.open}
        onOpenChange={(open) =>
          setModalState((prev) => ({ ...prev, open, id: open ? prev.id : undefined }))
        }
        onCompleted={() => {
          closeModal();
          router.refresh();
        }}
      />
    </>
  );
}
