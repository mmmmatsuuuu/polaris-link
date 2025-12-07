"use client";

import { Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContentsTable } from "@/components/ui/ContentsTable";
import { AdminStudentsModal } from "./AdminStudentsModal";
import { useAuth } from "@/context/AuthProvider";

export type StudentRow = {
  id: string;
  studentNumber: string;
  displayName: string;
  email: string;
  lastLogin: string;
};

type Props = {
  rows: StudentRow[];
};

export function AdminStudentsTableClient({ rows }: Props) {
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
  const closeModal = () => setModalState((prev) => ({ ...prev, open: false, id: undefined }));

  const handleDelete = async (id: string) => {
    if (!user?.uid) {
      alert("ユーザー情報を取得できませんでした");
      return;
    }
    if (!window.confirm("この生徒を削除しますか？")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/students/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error ?? res.statusText);
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
        title="生徒一覧"
        actions={
          <Button radius="full" onClick={openCreate}>
            生徒を追加
          </Button>
        }
        columns={[
          { header: "学籍番号", cell: (row) => row.studentNumber, sortValue: (row) => row.studentNumber },
          { header: "氏名", cell: (row) => row.displayName, sortValue: (row) => row.displayName },
          { header: "メール", cell: (row) => row.email, sortValue: (row) => row.email },
          { header: "最終ログイン", cell: (row) => row.lastLogin, sortValue: (row) => row.lastLogin },
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
        rowsPerPage={40}
      />

      <AdminStudentsModal
        mode={modalState.mode}
        studentId={modalState.id}
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
