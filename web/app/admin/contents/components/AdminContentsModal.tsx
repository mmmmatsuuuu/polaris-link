"use client";

import { useEffect, useState } from "react";
import { Button, Dialog, Flex, Select, Spinner, Text, TextArea, TextField } from "@radix-ui/themes";
import { Modal } from "@/components/ui/Modal";
import { TagInput } from "@/components/ui/TagInput";

type ContentForm = {
  title: string;
  description: string;
  type: "video" | "quiz" | "link";
  publishStatus: "public" | "private";
  order: number;
  tags: string[];
  metadata: Record<string, unknown>;
};

type AdminContentsModalProps = {
  mode: "create" | "edit";
  contentId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
};

const emptyForm: ContentForm = {
  title: "",
  description: "",
  type: "video",
  publishStatus: "private",
  order: 0,
  tags: [],
  metadata: {},
};

export function AdminContentsModal({
  mode,
  contentId,
  open,
  onOpenChange,
  onCompleted,
}: AdminContentsModalProps) {
  const [form, setForm] = useState<ContentForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (mode === "edit" && contentId && open) {
      setIsLoading(true);
      fetch(`/api/contents/${contentId}`)
        .then((res) => res.json())
        .then((data) => {
          const nextForm: ContentForm = {
            title: data.title ?? "",
            description: data.description ?? "",
            type: (data.type as ContentForm["type"]) ?? "video",
            publishStatus: (data.publishStatus as ContentForm["publishStatus"]) ?? "private",
            order: typeof data.order === "number" ? data.order : 0,
            tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
            metadata: (data.metadata as Record<string, unknown>) ?? {},
          };
          setForm(nextForm);
          setTagsInput(nextForm.tags.join(", "));
        })
        .catch((error) => {
          console.error(error);
          setStatus("コンテンツの取得に失敗しました");
        })
        .finally(() => setIsLoading(false));
    }

    if (mode === "create" && open) {
      setForm(emptyForm);
      setStatus(null);
      setTagsInput("");
    }
  }, [mode, contentId, open]);

  const handleSave = async () => {
    setStatus(null);
    setIsSubmitting(true);
    try {
      const endpoint =
        mode === "edit" && contentId ? `/api/contents/${contentId}` : "/api/contents";
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
      title={mode === "create" ? "コンテンツを追加" : "コンテンツを編集"}
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
              タイトル
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

          <div>
            <Text size="2" color="gray">
              タグ
            </Text>
            <TagInput
              disabled={isLoading}
              value={form.tags}
              onChange={(next) => setForm((prev) => ({ ...prev, tags: next }))}
              placeholder="タグを入力してEnterで追加"
            />
          </div>

          <div>
            <Text size="2" color="gray">
              種別
            </Text>
            <Select.Root
              disabled={isLoading}
              value={form.type}
              onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as ContentForm["type"] }))}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="video">動画</Select.Item>
                <Select.Item value="quiz">小テスト</Select.Item>
                <Select.Item value="link">リンク教材</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>

          {form.type === "video" && (
            <Flex gap="3">
              <div className="flex-1">
                <Text size="2" color="gray">
                  YouTube Video ID
                </Text>
                <TextField.Root
                  disabled={isLoading}
                  value={(form.metadata as any)?.youtubeVideoId ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      metadata: { ...prev.metadata, youtubeVideoId: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="flex-1">
                <Text size="2" color="gray">
                  長さ（秒）
                </Text>
                <TextField.Root
                  type="number"
                  disabled={isLoading}
                  value={(form.metadata as any)?.durationSec ?? 0}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      metadata: { ...prev.metadata, durationSec: Number(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
            </Flex>
          )}

          {form.type === "quiz" && (
            <Flex gap="3" direction={{ initial: "column", md: "row" }}>
              <div className="flex-1">
                <Text size="2" color="gray">
                  問題プール数
                </Text>
                <TextField.Root
                  type="number"
                  disabled={isLoading}
                  value={(form.metadata as any)?.questionPoolSize ?? 0}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      metadata: { ...prev.metadata, questionPoolSize: Number(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
              <div className="flex-1">
                <Text size="2" color="gray">
                  1回あたり出題数
                </Text>
                <TextField.Root
                  type="number"
                  disabled={isLoading}
                  value={(form.metadata as any)?.questionsPerAttempt ?? 0}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      metadata: { ...prev.metadata, questionsPerAttempt: Number(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
            </Flex>
          )}

          {form.type === "link" && (
            <div>
              <Text size="2" color="gray">
                URL
              </Text>
              <TextField.Root
                disabled={isLoading}
                value={(form.metadata as any)?.url ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, url: e.target.value },
                  }))
                }
              />
            </div>
          )}

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
                  setForm((prev) => ({
                    ...prev,
                    publishStatus: value as ContentForm["publishStatus"],
                  }))
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
        </Flex>
      )}
    </Modal>
  );
}
