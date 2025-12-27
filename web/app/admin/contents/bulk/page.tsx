import { Badge, Box, Button, Card, Flex, Heading, Section, Text } from "@radix-ui/themes";
import { ExampleDrawer } from "./components/ExampleDrawer";

export default function ContentBulkPage() {
  const status: "idle" | "processing" | "error" | "success" = "idle";
  const statusStyle = {
    idle: "bg-white border-slate-200",
    processing: "bg-blue-50 border-blue-200",
    error: "bg-red-50 border-red-200",
    success: "bg-emerald-50 border-emerald-200",
  }[status];

  return (
    <Box className="bg-slate-50">
      <Section>
        <Flex direction="column" gap="4" className="mx-auto max-w-3xl">
          <Card variant="classic">
            <Heading size="7">コンテンツ一括登録</Heading>
            <Text color="gray">JSONファイルでコンテンツをまとめて登録します。上限は300件です。</Text>
            <Flex direction="column" gap="2" mt="4">
              <Flex align="center" gap="2">
                <Badge color="red">必須</Badge>
                <Text size="2" color="gray">
                  type, title, metadata
                </Text>
              </Flex>
              <Flex align="center" gap="2">
                <Badge color="gray">任意</Badge>
                <Text size="2" color="gray">
                  lessonId, description, tags, publishStatus, order
                </Text>
              </Flex>
              <Text size="2" color="gray">
                lessonIdは管理画面のIDコピーから取得します（任意）。
              </Text>
            </Flex>
            <Flex gap="2" mt="4" wrap="wrap">
              <ExampleDrawer />
            </Flex>
          </Card>

          <Card variant="surface">
            <Text weight="bold">ファイルアップロード</Text>
            <Flex gap="2" mt="3">
              <Button radius="full" variant="soft">
                JSONファイルを選択
              </Button>
              <Button radius="full">一括登録を実行</Button>
            </Flex>
            <Card
              variant="surface"
              mt="3"
              className="border border-dashed border-slate-300 px-4 py-6 text-center"
            >
              <Text color="gray">ここにファイルをドラッグ & ドロップ</Text>
            </Card>

            <Box mt="4" className={`rounded-md border px-4 py-3 ${statusStyle}`}>
              <Text weight="bold">進捗・エラー表示</Text>
              <Text size="2" color="gray" mt="2">
                アップロード中... / 検証中... / 登録中...
              </Text>
              <Text size="2" color="gray" mt="2">
                エラー例: 4行目 metadata.url: 形式が正しくありません。
              </Text>
            </Box>
          </Card>
        </Flex>
      </Section>
    </Box>
  );
}
