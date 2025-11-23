"use client";

import { useState } from "react";
import { Button, Dialog, Flex, Select, Text, TextArea, TextField } from "@radix-ui/themes";
import { Modal } from "@/components/ui/Modal";

type UnitForm = {
  name: string;
  description: string;
  order: number;
  subject: string;
  publishStatus: "public" | "private";
};

type AdminUnitsModalProps = {
  apiEndpoint: string;
  triggerLabel?: string;
};

const subjectOptions = ["情報リテラシー", "理科探究"];

export function AdminUnitsModal({ apiEndpoint, triggerLabel = "編集" }: AdminUnitsModalProps) {
  const [form, setForm] = useState<UnitForm>({
    name: "デジタル基礎",
    description: "基本操作とオンラインの基礎を学ぶ単元。",
    order: 1,
    subject: "情報リテラシー",
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
        <Text size="2" color="gray">単元名</Text>
        <TextField.Root value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

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
              onValueChange={(v) => setForm({ ...form, publishStatus: v as UnitForm["publishStatus"] })}
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

        <Text size="2" color="gray" mt="2">API: {apiEndpoint}</Text>
      </Flex>
    </Modal>
  );
}
