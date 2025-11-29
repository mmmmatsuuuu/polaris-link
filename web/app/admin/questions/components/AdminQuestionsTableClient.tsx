"use client";

import { useState } from "react";
import { Badge, Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { ContentsTable } from "@/components/ui/ContentsTable";
import { AdminQuestionsModal } from "./AdminQuestionsModal";

type QuestionRow = {
  id: string;
  prompt: string;
  questionType: "multipleChoice" | "ordering" | "shortAnswer" | "";
  difficulty: "easy" | "medium" | "hard" | "";
  publishStatus: "public" | "private";
  updatedAt: string;
};

type Props = {
  rows: QuestionRow[];
};

const typeLabel = {
  multipleChoice: "選択",
  ordering: "並び替え",
  shortAnswer: "記述",
  "": "-",
} as const;

const difficultyLabel = {
  easy: "★☆☆",
  medium: "★★☆",
  hard: "★★★",
  "": "-",
} as const;

export function AdminQuestionsTableClient({ rows }: Props) {
  const router = useRouter();
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
    if (!window.confirm("この問題を削除しますか？")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
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
        title="問題一覧"
        actions={
          <Button radius="full" onClick={openCreate}>
            問題を追加
          </Button>
        }
        columns={[
          { header: "問題文", cell: (row) => row.prompt, sortValue: (row) => row.prompt },
          {
            header: "種別",
            cell: (row) => typeLabel[row.questionType],
            sortValue: (row) => row.questionType,
          },
          {
            header: "難易度",
            cell: (row) => difficultyLabel[row.difficulty],
            sortValue: (row) => row.difficulty,
          },
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
            header: "更新日",
            cell: (row) => row.updatedAt,
            sortValue: (row) => Date.parse(row.updatedAt),
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

      <AdminQuestionsModal
        mode={modalState.mode}
        questionId={modalState.id}
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
