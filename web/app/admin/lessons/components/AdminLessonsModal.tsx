"use client";

import { useState } from "react";
import { Button, Dialog, Flex, Select, Text, TextArea, TextField } from "@radix-ui/themes";
import { Modal } from "@/components/ui/Modal";

type LessonForm = {
  title: string;
  description: string;
  order: number;
  subject: string;
  unit: string;
  publishStatus: "public" | "private";
};

type AdminLessonsModalProps = {
  apiEndpoint: string;
  triggerLabel?: string;
};

const subjectOptions = ["情報リテラシー", "理科探究"];
const unitOptions = ["デジタル基礎", "情報モラル"];

export function AdminLessonsModal({ apiEndpoint, triggerLabel = "編集" }: AdminLessonsModalProps) {
  const [form, setForm] = useState<LessonForm>({
    title: "SNSと個人情報",
    description: "SNSでの安全な情報の扱い方を学ぶ授業です。",
    order: 1,
    subject: "情報リテラシー",
    unit: "情報モラル",
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
        <Text size="2" color="gray">授業名</Text>
        <TextField.Root value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

        <Text size="2" color="gray">説明</Text>
        <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <Flex gap="3">
          <div className="flex-1">
            <Text size="2" color="gray">表示順</Text>
            <TextField.Root
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="flex-1">
            <Text size="2" color="gray">公開状態</Text>
            <Select.Root
              value={form.publishStatus}
              onValueChange={(v) => setForm({ ...form, publishStatus: v as LessonForm["publishStatus"] })}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="public">公開</Select.Item>
                <Select.Item value="private">非公開</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        </Flex>

        <Text size="2" color="gray">科目</Text>
        <Select.Root value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
          <Select.Trigger />
          <Select.Content>
            {subjectOptions.map((s) => (
              <Select.Item key={s} value={s}>{s}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Text size="2" color="gray">単元</Text>
        <Select.Root value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
          <Select.Trigger />
          <Select.Content>
            {unitOptions.map((u) => (
              <Select.Item key={u} value={u}>{u}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Text size="2" color="gray" mt="2">API: {apiEndpoint}</Text>
      </Flex>
    </Modal>
  );
}
