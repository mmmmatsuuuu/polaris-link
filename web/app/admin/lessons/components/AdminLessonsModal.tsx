"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Dialog, Flex, Select, Spinner, Text, TextArea, TextField, Grid, Box } from "@radix-ui/themes";
import { Modal } from "@/components/ui/Modal";
import { ChipMultiSelect, type ChipOption } from "@/components/ui/ChipMultiSelect";
import { useAuth } from "@/context/AuthProvider";

type LessonForm = {
  title: string;
  description: string;
  order: number;
  unitId: string;
  publishStatus: "public" | "private";
  contentIds: string[];
};

type AdminLessonsModalProps = {
  mode: "create" | "edit";
  lessonId?: string;
  units: Array<{ id: string; name: string; subjectName: string }>;
  contents: Array<{ id: string; title: string; lessonId?: string, typeAndTags?: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
};

const emptyForm: LessonForm = {
  title: "",
  description: "",
  order: 0,
  unitId: "",
  publishStatus: "private",
  contentIds: [],
};

export function AdminLessonsModal({
  mode,
  lessonId,
  units,
  contents,
  open,
  onOpenChange,
  onCompleted,
}: AdminLessonsModalProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<LessonForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const unitOptions = useMemo(() => units ?? [], [units]);
  const contentOptions: ChipOption[] = useMemo(
    () =>
      contents.map((c) => ({
        id: c.id,
        label: c.title || "(無題)",
        description: c.typeAndTags || "",
      })),
    [contents],
  );

  useEffect(() => {
    if (!open) return;
    if (!user?.uid) {
      setStatus("ユーザー情報を取得できませんでした");
      return;
    }

    if (mode === "edit" && lessonId) {
      setIsLoading(true);
      fetch(`/api/lessons/${lessonId}`, {
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
            title: data.title ?? "",
            description: data.description ?? "",
            order: typeof data.order === "number" ? data.order : 0,
            unitId: data.unitId ?? "",
            publishStatus: (data.publishStatus as LessonForm["publishStatus"]) ?? "private",
            contentIds: Array.isArray(data.contentIds) ? (data.contentIds as string[]) : [],
          });
        })
        .catch((error) => {
          console.error(error);
          setStatus("授業の取得に失敗しました");
        })
        .finally(() => setIsLoading(false));
    }

    if (mode === "create" && open) {
      setForm(emptyForm);
      setStatus(null);
    }
  }, [mode, lessonId, open, user?.uid]);

  const handleSave = async () => {
    if (!user?.uid) {
      setStatus("ユーザー情報を取得できませんでした");
      return;
    }
    setStatus(null);
    setIsSubmitting(true);
    try {
      const endpoint =
        mode === "edit" && lessonId ? `/api/lessons/${lessonId}` : "/api/lessons";
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
      title={mode === "create" ? "授業を追加" : "授業を編集"}
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
        <Grid gap="2" columns={{ initial: "1", md: "2"}}>
          <Box>
            <Flex direction="column" gap="3">
              {status && (
                <Text size="2" color="red">
                  {status}
                </Text>
              )}

              <div>
                <Text size="2" color="gray">
                  授業名
                </Text>
                <TextField.Root
                  disabled={isLoading}
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
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
                />
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
                      setForm((prev) => ({ ...prev, publishStatus: value as LessonForm["publishStatus"] }))
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
                  単元
                </Text>
                <Select.Root
                  disabled={isLoading}
                  value={form.unitId}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, unitId: value }))}
                >
                  <Select.Trigger />
                  <Select.Content>
                    {unitOptions.map((u) => (
                      <Select.Item key={u.id} value={u.id}>
                        {u.name}（{u.subjectName}）
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>

            </Flex>

          </Box>
          <Box>

            <div>
              <Text size="2" color="gray">
                コンテンツ（クリックで追加/削除）
              </Text>
              <ChipMultiSelect
                disabled={isLoading}
                value={form.contentIds}
                options={contentOptions}
                onChange={(next) => setForm((prev) => ({ ...prev, contentIds: next }))}
                placeholder="コンテンツを検索・追加"
              />
            </div>
          </Box>
        </Grid>
      )}
    </Modal>
  );
}
