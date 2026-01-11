"use client";

import { useRef, useState } from "react";
import { Badge, Box, Button, Card, Flex, Heading, Section, Text } from "@radix-ui/themes";
import { ExampleDrawer } from "./components/ExampleDrawer";
import { StatusPanel } from "./components/StatusPanel";
import { validateSubjectsPayload, type SubjectBulkItem, type ValidationError } from "./components/validation";
import { useAuth } from "@/context/AuthProvider";

export default function SubjectBulkPage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [panelMode, setPanelMode] = useState<"idle" | "error" | "confirm" | "processing" | "success">("idle");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [previewItems, setPreviewItems] = useState<SubjectBulkItem[]>([]);
  const [successCount, setSuccessCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrors([
        {
          index: 0,
          field: "file",
          code: "required",
          message: "JSONファイルを選択してください。",
        },
      ]);
      setPanelMode("error");
      return;
    }

    try {
      setPanelMode("processing");
      const text = await selectedFile.text();
      const json = JSON.parse(text);
      const result = validateSubjectsPayload(json);
      if (result.errors.length > 0) {
        setErrors(result.errors);
        setPanelMode("error");
        setPreviewItems([]);
        return;
      }
      const items = result.data?.subjects ?? [];
      setPreviewItems(items.slice(0, 5));
      setErrors([]);
      setPanelMode("confirm");
    } catch (error) {
      setErrors([
        {
          index: 0,
          field: "file",
          code: "invalid",
          message: "JSONの解析に失敗しました。",
        },
      ]);
      setPanelMode("error");
    }
  };

  const handleRegister = async () => {
    if (!selectedFile) return;
    if (!user?.uid) {
      setErrors([
        {
          index: 0,
          field: "userId",
          code: "required",
          message: "ログイン情報が取得できませんでした。",
        },
      ]);
      setPanelMode("error");
      return;
    }
    try {
      setPanelMode("processing");
      const text = await selectedFile.text();
      const json = JSON.parse(text);
      const response = await fetch("/api/subjects/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...json, userId: user.uid }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { details?: ValidationError[] };
        setErrors(payload.details ?? []);
        setPanelMode("error");
        return;
      }
      const payload = (await response.json()) as { count?: number };
      setSuccessCount(payload.count ?? 0);
      setPanelMode("success");
    } catch (error) {
      setErrors([
        {
          index: 0,
          field: "request",
          code: "invalid",
          message: "登録に失敗しました。",
        },
      ]);
      setPanelMode("error");
    }
  };

  return (
    <Box className="bg-slate-50">
      <Section>
        <Flex direction="column" gap="4" className="mx-auto max-w-3xl">
          <Card variant="classic">
            <Heading size="7">科目一括登録</Heading>
            <Text color="gray">JSONファイルを使って科目をまとめて登録します。上限は300件です。</Text>
            <Flex direction="column" gap="2" mt="4">
              <Flex align="center" gap="2">
                <Badge color="red">必須</Badge>
                <Text size="2" color="gray">
                  name
                </Text>
              </Flex>
              <Flex align="center" gap="2">
                <Badge color="gray">任意</Badge>
                <Text size="2" color="gray">
                  description, publishStatus, order
                </Text>
              </Flex>
              <Text size="2" color="gray">
                エラー時は登録されません（全件ロールバック）。
              </Text>
            </Flex>
            <Flex gap="2" mt="4" wrap="wrap">
              <ExampleDrawer />
            </Flex>
          </Card>

          <Card variant="surface">
            <Text weight="bold">ファイルアップロード</Text>
            <Text size="2" color="gray" mt="1">
              JSONファイルはUTF-8で保存してください。
            </Text>
            <Flex gap="2" mt="3">
              <Button radius="full" variant="soft" onClick={handlePickFile}>
                JSONファイルを選択
              </Button>
              <Button radius="full" onClick={() => void handleUpload()}>
                アップロード
              </Button>
            </Flex>
            <Card
              variant="surface"
              mt="3"
              className="border border-dashed border-slate-300 px-4 py-6 text-center"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Text color="gray">
                {selectedFile ? selectedFile.name : "ここにファイルをドラッグ & ドロップ"}
              </Text>
            </Card>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleFileChange}
            />

            <Box mt="4">
              <StatusPanel
                mode={panelMode}
                errors={errors}
                previewItems={previewItems}
                onRegister={handleRegister}
                successCount={successCount}
              />
            </Box>
          </Card>
        </Flex>
      </Section>
    </Box>
  );
}
