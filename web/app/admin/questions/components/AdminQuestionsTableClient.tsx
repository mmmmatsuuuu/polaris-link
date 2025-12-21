"use client";

import { useState } from "react";
import { Badge, Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { ContentsTable } from "@/components/ui/ContentsTable";
import { AdminQuestionsModal } from "./AdminQuestionsModal";
import { useAuth } from "@/context/AuthProvider";
import type { QuizQuestion, QuizQuestionType } from "@/types/catalog";
import type { RichTextDoc } from "@/types/catalog";

type QuestionRow = Pick<QuizQuestion, "id" | "prompt" | "questionType" | "difficulty" | "isActive"> & {
  updatedAt: string;
};

type Props = {
  rows: QuestionRow[];
};

const typeLabel: Record<QuizQuestionType | "", string> = {
  multipleChoice: "選択",
  ordering: "並び替え",
  shortAnswer: "記述",
  "": "-",
};

const difficultyLabel: Record<QuizQuestion["difficulty"] | "", string> = {
  easy: "★☆☆",
  medium: "★★☆",
  hard: "★★★",
  "": "-",
};

const promptPreview = (prompt: unknown, limit = 20) => {
  if (typeof prompt === "string") return prompt.slice(0, limit);
  const doc = prompt as RichTextDoc;
  const texts: string[] = [];
  const walk = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (node?.type === "text" && typeof node.text === "string") {
        texts.push(node.text);
      }
      if (Array.isArray(node?.content)) walk(node.content);
    });
  };
  if (Array.isArray((doc as any)?.content)) {
    walk((doc as any).content as any[]);
  }
  const joined = texts.join(" ").trim();
  return joined ? joined.slice(0, limit) : "";
};

export function AdminQuestionsTableClient({ rows }: Props) {
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
    if (!window.confirm("この問題を削除しますか？")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/questions/${id}`, {
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
        title="問題一覧"
        actions={
          <Button radius="full" onClick={openCreate}>
            問題を追加
          </Button>
        }
        columns={[
          {
            header: "問題文",
            cell: (row) => promptPreview(row.prompt) || "-",
            sortValue: (row) => promptPreview(row.prompt) || "",
          },
          {
            header: "種別",
            cell: (row) => typeLabel[row.questionType || ""],
            sortValue: (row) => row.questionType || "",
          },
          {
            header: "難易度",
            cell: (row) => difficultyLabel[row.difficulty || ""],
            sortValue: (row) => row.difficulty || "",
          },
          {
            header: "出題",
            cell: (row) => (
              <Badge variant="soft" color={row.isActive ? "green" : "gray"}>
                {row.isActive ? "出題中" : "停止中"}
              </Badge>
            ),
            sortValue: (row) => (row.isActive ? 1 : 0),
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
        rowsPerPage={20}
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
