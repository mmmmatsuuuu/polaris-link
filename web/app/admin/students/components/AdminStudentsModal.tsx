"use client";

import { useEffect, useState } from "react";
import { Button, Dialog, Flex, Spinner, Text, TextArea, TextField } from "@radix-ui/themes";
import { FullScreenModal } from "@/components/ui/FullScreenModal";
import { useAuth } from "@/context/AuthProvider";

type StudentForm = {
  displayName: string;
  email: string;
  studentNumber: string;
  notes: string;
};

type AdminStudentsModalProps = {
  mode: "create" | "edit";
  studentId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
};

const emptyForm: StudentForm = {
  displayName: "",
  email: "",
  studentNumber: "",
  notes: "",
};

export function AdminStudentsModal({
  mode,
  studentId,
  open,
  onOpenChange,
  onCompleted,
}: AdminStudentsModalProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!user?.uid) {
      setStatus("ユーザー情報を取得できませんでした");
      return;
    }

    if (mode === "edit" && studentId) {
      setIsLoading(true);
      setStatus(null);
      fetch(`/api/students/${studentId}`, {
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
            displayName: data.displayName ?? "",
            email: data.email ?? "",
            studentNumber: data.studentNumber
              ? String(data.studentNumber)
              : "",
            notes: data.notes ?? "",
          });
        })
        .catch((error) => {
          console.error(error);
          setStatus("生徒情報の取得に失敗しました");
        })
        .finally(() => setIsLoading(false));
    }

    if (mode === "create" && open) {
      setForm(emptyForm);
      setStatus(null);
    }
  }, [mode, studentId, open, user?.uid]);

  const handleSave = async () => {
    if (!user?.uid) {
      setStatus("ユーザー情報を取得できませんでした");
      return;
    }
    setStatus(null);
    setIsSubmitting(true);

    try {
      const endpoint =
        mode === "edit" && studentId ? `/api/students/${studentId}` : "/api/students";
      const method = mode === "edit" ? "PUT" : "POST";

      const payload = {
        displayName: form.displayName,
        email: form.email,
        studentNumber: form.studentNumber ? Number(form.studentNumber) : undefined,
        notes: form.notes,
        userId: user.uid,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? res.statusText);
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
    <FullScreenModal
      trigger={<span />}
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "生徒を追加" : "生徒を編集"}
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
              氏名
            </Text>
            <TextField.Root
              value={form.displayName}
              onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
              placeholder="氏名を入力"
            />
          </div>

          <div>
            <Text size="2" color="gray">
              メール
            </Text>
            <TextField.Root
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="student@example.com"
            />
          </div>

          <div>
            <Text size="2" color="gray">
              学籍番号
            </Text>
            <TextField.Root
              inputMode="numeric"
              value={form.studentNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, studentNumber: e.target.value }))}
              placeholder="24001 など"
            />
          </div>

          <div>
            <Text size="2" color="gray">
              メモ
            </Text>
            <TextArea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="補足・連絡事項など"
            />
          </div>
        </Flex>
      )}
    </FullScreenModal>
  );
}
