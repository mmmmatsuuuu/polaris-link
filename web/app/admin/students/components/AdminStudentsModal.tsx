"use client";

import { useState } from "react";
import { Button, Dialog, Flex, Select, Text, TextField } from "@radix-ui/themes";
import { Modal } from "@/components/ui/Modal";

type StudentForm = {
  name: string;
  email: string;
  status: "active" | "inactive";
};

type AdminStudentsModalProps = {
  apiEndpoint: string;
  triggerLabel?: string;
};

export function AdminStudentsModal({ apiEndpoint, triggerLabel = "編集" }: AdminStudentsModalProps) {
  const [form, setForm] = useState<StudentForm>({
    name: "山田 花子",
    email: "hanako@example.com",
    status: "active",
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
        <Text size="2" color="gray">氏名</Text>
        <TextField.Root value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <Text size="2" color="gray">メール</Text>
        <TextField.Root value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

        <Text size="2" color="gray">ステータス</Text>
        <Select.Root
          value={form.status}
          onValueChange={(v) => setForm({ ...form, status: v as StudentForm["status"] })}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="active">有効</Select.Item>
            <Select.Item value="inactive">無効</Select.Item>
          </Select.Content>
        </Select.Root>

        <Text size="2" color="gray" mt="2">API: {apiEndpoint}</Text>
      </Flex>
    </Modal>
  );
}
