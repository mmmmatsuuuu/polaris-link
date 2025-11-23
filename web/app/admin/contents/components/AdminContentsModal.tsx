"use client";

import { useState } from "react";
import { Button, Dialog, Flex, Select, Text, TextArea, TextField } from "@radix-ui/themes";
import { Modal } from "@/components/ui/Modal";

type ContentForm = {
  title: string;
  description: string;
  type: "video" | "quiz" | "link";
  lesson: string;
  publishStatus: "public" | "private";
};

type AdminContentsModalProps = {
  apiEndpoint: string;
  triggerLabel?: string;
};

const lessonOptions = ["SNSと個人情報", "クラウド活用"];

export function AdminContentsModal({ apiEndpoint, triggerLabel = "編集" }: AdminContentsModalProps) {
  const [form, setForm] = useState<ContentForm>({
    title: "SNS動画01",
    description: "SNSの危険性を学ぶ動画です。",
    type: "video",
    lesson: "SNSと個人情報",
    publishStatus: "public",
  });

  return (
    <Modal
      triggerLabel={triggerLabel}
      actions={
        <>
          <Dialog.Close>
            <Button variant="soft" color="gray">
              キャンセル
            </Button>
          </Dialog.Close>
          <Button>保存</Button>
        </>
      }
    >
      <Flex direction="column" gap="3">
        <Text size="2" color="gray">タイトル</Text>
        <TextField.Root value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

        <Text size="2" color="gray">説明</Text>
        <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <Text size="2" color="gray">種別</Text>
        <Select.Root value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ContentForm["type"] })}>
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="video">動画</Select.Item>
            <Select.Item value="quiz">小テスト</Select.Item>
            <Select.Item value="link">リンク教材</Select.Item>
          </Select.Content>
        </Select.Root>

        <Text size="2" color="gray">授業</Text>
        <Select.Root value={form.lesson} onValueChange={(v) => setForm({ ...form, lesson: v })}>
          <Select.Trigger />
          <Select.Content>
            {lessonOptions.map((l) => (
              <Select.Item key={l} value={l}>{l}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Text size="2" color="gray">公開状態</Text>
        <Select.Root
          value={form.publishStatus}
          onValueChange={(v) => setForm({ ...form, publishStatus: v as ContentForm["publishStatus"] })}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="public">公開</Select.Item>
            <Select.Item value="private">非公開</Select.Item>
          </Select.Content>
        </Select.Root>

        <Text size="2" color="gray" mt="2">API: {apiEndpoint}</Text>
      </Flex>
    </Modal>
  );
}
