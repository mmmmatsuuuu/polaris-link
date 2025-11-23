"use client";

import { useState } from "react";
import { Button, Dialog, Flex, Select, Text, TextArea } from "@radix-ui/themes";
import { Modal } from "@/components/ui/Modal";

type QuestionForm = {
  prompt: string;
  type: "選択" | "記述";
  difficulty: "★☆☆" | "★★☆" | "★★★";
  status: "public" | "private";
};

type AdminQuestionsModalProps = {
  apiEndpoint: string;
  triggerLabel?: string;
};

export function AdminQuestionsModal({ apiEndpoint, triggerLabel = "編集" }: AdminQuestionsModalProps) {
  const [form, setForm] = useState<QuestionForm>({
    prompt: "SNS投稿前に確認する項目は?",
    type: "選択",
    difficulty: "★☆☆",
    status: "public",
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
        <Text size="2" color="gray">問題文</Text>
        <TextArea value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} />

        <Flex gap="3">
          <div className="flex-1">
            <Text size="2" color="gray">種別</Text>
            <Select.Root value={form.type} onValueChange={(v) => setForm({ ...form, type: v as QuestionForm["type"] })}>
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="選択">選択</Select.Item>
                <Select.Item value="記述">記述</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
          <div className="flex-1">
            <Text size="2" color="gray">難易度</Text>
            <Select.Root
              value={form.difficulty}
              onValueChange={(v) => setForm({ ...form, difficulty: v as QuestionForm["difficulty"] })}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="★☆☆">★☆☆</Select.Item>
                <Select.Item value="★★☆">★★☆</Select.Item>
                <Select.Item value="★★★">★★★</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        </Flex>

        <Text size="2" color="gray">公開状態</Text>
        <Select.Root
          value={form.status}
          onValueChange={(v) => setForm({ ...form, status: v as QuestionForm["status"] })}
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
