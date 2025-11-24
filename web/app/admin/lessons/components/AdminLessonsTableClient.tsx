"use client";

import { Badge, Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContentsTable } from "@/components/ui/ContentsTable";
import { AdminLessonsModal } from "./AdminLessonsModal";

type LessonRow = {
  id: string;
  title: string;
  subjectName: string;
  unitId: string;
  unitName: string;
  contents: number;
  publishStatus: "public" | "private";
  order: number;
  updatedAt: string;
};

type Props = {
  rows: LessonRow[];
  units: Array<{ id: string; name: string; subjectName: string }>;
  contents: Array<{ id: string; title: string; lessonId?: string }>;
};

export function AdminLessonsTableClient({ rows, units, contents }: Props) {
  const router = useRouter();
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
    if (!window.confirm("この授業を削除しますか？")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/lessons/${id}`, { method: "DELETE" });
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
        title="授業一覧"
        actions={
          <Button radius="full" onClick={openCreate}>
            授業を追加
          </Button>
        }
        columns={[
          { header: "表示順", cell: (row) => row.order, sortValue: (row) => row.order },
          { header: "授業名", cell: (row) => row.title, sortValue: (row) => row.title },
          { header: "科目", cell: (row) => row.subjectName, sortValue: (row) => row.subjectName },
          { header: "単元", cell: (row) => row.unitName, sortValue: (row) => row.unitName },
          { header: "コンテンツ数", cell: (row) => `${row.contents} 件`, sortValue: (row) => row.contents },
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
        rowsPerPage={5}
      />

      <AdminLessonsModal
        mode={modalState.mode}
        lessonId={modalState.id}
        units={units}
        contents={contents}
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
