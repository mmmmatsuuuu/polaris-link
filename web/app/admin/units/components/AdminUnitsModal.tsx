"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Dialog, Flex, Select, Spinner, Text, TextField } from "@radix-ui/themes";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthProvider";
import { TipTapEditor } from "@/components/ui/tiptap";
import type { PublishStatus, RichTextDoc, Subject, Unit } from "@/types/catalog";

type UnitForm = Pick<Unit, "name" | "order" | "subjectId"> & {
  description: RichTextDoc;
  publishStatus: PublishStatus;
};

type AdminUnitsModalProps = {
  mode: "create" | "edit";
  unitId?: string;
  subjects: Array<Pick<Subject, "id" | "name">>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
};

const emptyForm: UnitForm = {
  name: "",
  description: { type: "doc", content: [{ type: "paragraph" }] },
  order: 0,
  subjectId: "",
  publishStatus: "private",
};

function normalizeDoc(value: unknown, fallback: RichTextDoc): RichTextDoc {
  if (value && typeof value === "object" && "type" in value) {
    return value as RichTextDoc;
  }
  if (typeof value === "string") {
    return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: value }] }] };
  }
  return fallback;
}

export function AdminUnitsModal({
  mode,
  unitId,
  subjects,
  open,
  onOpenChange,
  onCompleted,
}: AdminUnitsModalProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<UnitForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const subjectOptions = useMemo(() => subjects ?? [], [subjects]);

  useEffect(() => {
    if (!open) return;
    if (!user?.uid) {
      setStatus("ユーザー情報を取得できませんでした");
      return;
    }

    if (mode === "edit" && unitId) {
      setIsLoading(true);
      fetch(`/api/units/${unitId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const payload = await res.json().catch(() => null);
            throw new Error(payload?.error ?? res.statusText);
          }
          return res.json();
        })
        .then((data) => {
          setForm({
            name: data.name ?? "",
            description: normalizeDoc(data.description, emptyForm.description),
            order: typeof data.order === "number" ? data.order : 0,
            subjectId: data.subjectId ?? "",
            publishStatus: (data.publishStatus as UnitForm["publishStatus"]) ?? "private",
          });
        })
        .catch((error) => {
          console.error(error);
          setStatus("単元の取得に失敗しました");
        })
        .finally(() => setIsLoading(false));
    }

    if (mode === "create" && open) {
      setForm(emptyForm);
      setStatus(null);
    }
  }, [mode, unitId, open, user?.uid]);

  const handleSave = async () => {
    if (!user?.uid) {
      setStatus("ユーザー情報を取得できませんでした");
      return;
    }
    setStatus(null);
    setIsSubmitting(true);
    try {
      const endpoint =
        mode === "edit" && unitId ? `/api/units/${unitId}` : "/api/units";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId: user.uid }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error ?? res.statusText);
      }
      onCompleted?.();
    } catch (error) {
      console.error(error);
      setStatus("保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      trigger={<span />}
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "単元を追加" : "単元を編集"}
      actions={
        <>
          <Dialog.Close>
            <Button variant="soft" color="gray">
              キャンセル
            </Button>
          </Dialog.Close>
          <Button onClick={handleSave} disabled={isSubmitting || isLoading}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </>
      }
    >
      {isLoading ? (
        <Flex direction="column" align="center" justify="center" gap="3" style={{ minHeight: 200 }}>
          <Spinner size="3" />
          <Text color="gray">読み込み中...</Text>
        </Flex>
      ) : (
        <Flex direction="column" gap="3">
          {status && (
            <Text size="2" color="red">
              {status}
            </Text>
          )}

          <div>
            <Text size="2" color="gray">
              単元名
            </Text>
            <TextField.Root
              disabled={isLoading}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <Text size="2" color="gray">
              説明
            </Text>
            <div className="rounded border border-slate-200">
              <TipTapEditor
                value={form.description}
                onChange={(next) => setForm((prev) => ({ ...prev, description: next }))}
                placeholder="説明を入力"
              />
            </div>
          </div>

          <Flex gap="3">
            {mode === "edit" && (
              <div className="flex-1">
                <Text size="2" color="gray">
                  表示順
                </Text>
                <TextField.Root
                  type="number"
                  disabled={isLoading}
                  value={form.order}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, order: Number(e.target.value) || 0 }))
                  }
                />
              </div>
            )}
            <div className="flex-1">
              <Text size="2" color="gray">
                公開状態
              </Text>
              <Select.Root
                disabled={isLoading}
                value={form.publishStatus}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, publishStatus: value as UnitForm["publishStatus"] }))
                }
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="public">公開</Select.Item>
                  <Select.Item value="private">非公開</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
          </Flex>

          <div>
            <Text size="2" color="gray">
              科目
            </Text>
            <Select.Root
              disabled={isLoading}
              value={form.subjectId}
              onValueChange={(value) => setForm((prev) => ({ ...prev, subjectId: value }))}
            >
              <Select.Trigger />
              <Select.Content>
                {subjectOptions.map((s) => (
                  <Select.Item key={s.id} value={s.id}>
                    {s.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
        </Flex>
      )}
    </Modal>
  );
}
