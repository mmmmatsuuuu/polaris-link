"use client";

import { useEffect, useState } from "react";
import { Button, Dialog, Flex, Select, Spinner, Text, TextArea, TextField } from "@radix-ui/themes";
import { Modal } from "@/components/ui/Modal";

type SubjectForm = {
  name: string;
  description: string;
  order: number;
  publishStatus: "public" | "private";
};

type AdminSubjectsModalProps = {
  mode: "create" | "edit";
  subjectId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
};

const emptyForm: SubjectForm = {
  name: "",
  description: "",
  order: 0,
  publishStatus: "private",
};

export function AdminSubjectsModal({
  mode,
  subjectId,
  open,
  onOpenChange,
  onCompleted,
}: AdminSubjectsModalProps) {
  const [form, setForm] = useState<SubjectForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && subjectId && open) {
      setIsLoading(true);
      fetch(`/api/subjects/${subjectId}`)
        .then((res) => res.json())
        .then((data) => {
          setForm({
            name: data.name ?? "",
            description: data.description ?? "",
            order: typeof data.order === "number" ? data.order : 0,
            publishStatus: (data.publishStatus as SubjectForm["publishStatus"]) ?? "private",
          });
        })
        .catch((error) => {
          console.error(error);
          setStatus("科目の取得に失敗しました");
        })
        .finally(() => setIsLoading(false));
    }

    if (mode === "create" && open) {
      setForm(emptyForm);
      setStatus(null);
    }
  }, [mode, subjectId, open]);

  const handleSave = async () => {
    setStatus(null);
    setIsSubmitting(true);

    try {
      const endpoint =
        mode === "edit" && subjectId
          ? `/api/subjects/${subjectId}`
          : "/api/subjects";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      title={mode === "create" ? "科目を追加" : "科目を編集"}
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
              科目名
            </Text>
            <TextField.Root
              disabled={isLoading}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="科目名を入力"
            />
          </div>
          <div>
            <Text size="2" color="gray">
              説明
            </Text>
            <TextArea
              disabled={isLoading}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="説明を入力"
            />
          </div>
          <Flex gap="3">
            <div className="flex-1">
              <Text size="2" color="gray">
                表示順
              </Text>
              <TextField.Root
                type="number"
                disabled={isLoading}
                value={form.order}
                onChange={(e) => setForm((prev) => ({ ...prev, order: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex-1">
              <Text size="2" color="gray">
                公開状態
              </Text>
              <Select.Root
                disabled={isLoading}
                value={form.publishStatus}
                onValueChange={(value) => setForm((prev) => ({ ...prev, publishStatus: value as SubjectForm["publishStatus"] }))}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="public">公開</Select.Item>
                  <Select.Item value="private">非公開</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
          </Flex>
        </Flex>
      )}
    </Modal>
  );
}
