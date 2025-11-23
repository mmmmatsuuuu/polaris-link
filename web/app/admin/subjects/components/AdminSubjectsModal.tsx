"use client";

import { useState } from "react";
import { Button, Checkbox, Dialog, Flex, Select, Text, TextArea, TextField } from "@radix-ui/themes";
import { Modal } from "@/components/ui/Modal";

type SubjectForm = {
  name: string;
  description: string;
  order: number;
  publishStatus: "public" | "private";
  units: string[];
};

type AdminSubjectsModalProps = {
  /** データ取得や更新で利用するAPIエンドポイント（現状はダミーで未呼出） */
  apiEndpoint: string;
  /** トリガーボタンのラベル */
  triggerLabel?: string;
};

const unitOptions = ["デジタル基礎", "情報モラル", "プログラミング基礎"];

export function AdminSubjectsModal({
  apiEndpoint,
  triggerLabel = "編集",
}: AdminSubjectsModalProps) {
  // TODO: GETで取得した値を初期値にセットする。現状はダミー。
  const [form, setForm] = useState<SubjectForm>({
    name: "情報リテラシー",
    description: "基本操作から情報モラルを学ぶ入門科目です。",
    order: 1,
    publishStatus: "public",
    units: ["デジタル基礎"],
  });

  const toggleUnit = (unit: string, checked: boolean | "indeterminate") => {
    setForm((prev) => {
      if (checked) {
        return prev.units.includes(unit) ? prev : { ...prev, units: [...prev.units, unit] };
      }
      return { ...prev, units: prev.units.filter((u) => u !== unit) };
    });
  };

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
        <div>
          <Text size="2" color="gray">
            科目名
          </Text>
          <TextField.Root
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
              value={form.order}
              onChange={(e) => setForm((prev) => ({ ...prev, order: Number(e.target.value) || 0 }))}
            />
          </div>
          <div className="flex-1">
            <Text size="2" color="gray">
              公開状態
            </Text>
            <Select.Root
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

        <div>
          <Text size="2" color="gray">
            紐付け単元
          </Text>
          <Flex direction="column" gap="2" mt="2">
            {unitOptions.map((unit) => (
              <Flex key={unit} align="center" gap="2">
                <Checkbox
                  checked={form.units.includes(unit)}
                  onCheckedChange={(checked) => toggleUnit(unit, checked)}
                />
                <Text>{unit}</Text>
              </Flex>
            ))}
          </Flex>
          <Text size="2" color="gray" mt="2">
            {/* apiEndpointは将来のデータ取得/保存で使用予定 */}
            API: {apiEndpoint}
          </Text>
        </div>
      </Flex>
    </Modal>
  );
}
