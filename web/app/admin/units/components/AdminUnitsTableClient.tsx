"use client";

import { Badge, Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContentsTable } from "@/components/ui/ContentsTable";
import { AdminUnitsModal } from "./AdminUnitsModal";
import { useAuth } from "@/context/AuthProvider";

type UnitRow = {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  lessons: number;
  publishStatus: "public" | "private";
  order: number;
  updatedAt: string;
};

type Props = {
  rows: UnitRow[];
  subjects: Array<{ id: string; name: string }>;
};

export function AdminUnitsTableClient({ rows, subjects }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [modalState, setModalState] = useState<{
    mode: "create" | "edit";
    id?: string;
    open: boolean;
  }>({ mode: "create", open: false });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => setModalState({ mode: "create", open: true });
  const openEdit = (id: string) => setModalState({ mode: "edit", id, open: true });
  const closeModal = () =>
    setModalState((prev) => ({ ...prev, open: false, id: undefined }));

  const handleDelete = async (id: string) => {
    if (!user?.uid) {
      alert("ユーザー情報を取得できませんでした");
      return;
    }
    if (!window.confirm("この単元を削除しますか？")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/units/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
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
        title="単元一覧"
        actions={
          <Button radius="full" onClick={openCreate}>
            単元を追加
          </Button>
        }
        columns={[
          { header: "表示順", cell: (row) => row.order, sortValue: (row) => row.order },
          { header: "単元名", cell: (row) => row.name, sortValue: (row) => row.name },
          { header: "科目", cell: (row) => row.subjectName, sortValue: (row) => row.subjectName },
          { header: "授業数", cell: (row) => `${row.lessons} 件`, sortValue: (row) => row.lessons },
          {
            header: "公開状態",
            cell: (row) => (
              <Badge variant="soft" color={row.publishStatus === "public" ? "green" : "gray"}>
                {row.publishStatus === "public" ? "公開" : "非公開"}
              </Badge>
            ),
            sortValue: (row) => row.publishStatus,
          },
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
        rowsPerPage={10}
      />

      <AdminUnitsModal
        mode={modalState.mode}
        unitId={modalState.id}
        open={modalState.open}
        subjects={subjects}
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
