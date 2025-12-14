"use client";

import { Badge, Button, Flex, Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContentsTable } from "@/components/ui/ContentsTable";
import { AdminContentsModal } from "./AdminContentsModal";
import { useAuth } from "@/context/AuthProvider";
import type { LessonContent, PublishStatus } from "@/types/catalog";

type ContentRow = Pick<LessonContent, "id" | "title" | "type" | "tags" | "publishStatus" | "order"> & {
  updatedAt: string;
};

type Props = {
  rows: ContentRow[];
};

export function AdminContentsTableClient({ rows }: Props) {
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
    if (!window.confirm("このコンテンツを削除しますか？")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/contents/${id}`, {
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
        title="コンテンツ一覧"
        description="動画・小テスト・教材をまとめて管理します。"
        actions={
            <Button radius="full" onClick={openCreate}>
              新規作成
            </Button>
        }
        columns={[
          { header: "表示順", cell: (row) => row.order, sortValue: (row) => row.order },
          { header: "コンテンツ名", cell: (row) => row.title, sortValue: (row) => row.title },
          { header: "種別", cell: (row) => row.type, sortValue: (row) => row.type },
          {
            header: "タグ",
            cell: (row) =>
              row.tags?.length ? (
                <Flex gap="2" wrap="wrap">
                  {row.tags.map((tag) => (
                    <Badge key={tag} variant="soft">
                      {tag}
                    </Badge>
                  ))}
                </Flex>
              ) : (
                <Text size="2" color="gray">
                  なし
                </Text>
              ),
            sortValue: (row) => (row.tags ?? []).join(","),
          },
          {
            header: "公開状態",
            cell: (row) => (
              <Badge color={row.publishStatus === "public" ? "green" : "gray"} variant="soft">
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
        rowsPerPage={20}
      />

      <AdminContentsModal
        mode={modalState.mode}
        contentId={modalState.id}
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
