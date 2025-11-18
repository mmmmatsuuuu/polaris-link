import { Box, Button, Card, Heading, Section, Text } from "@radix-ui/themes";

export default function StudentBulkPage() {
  return (
    <Box className="bg-slate-50">
      <Section>
        <Card variant="classic" className="mx-auto max-w-3xl">
          <Heading size="7">生徒一括登録</Heading>
          <Text color="gray">氏名・メールアドレス・ステータスをCSVで登録するUI例です。</Text>
          <Button mt="4">テンプレートをダウンロード</Button>
          <Card variant="surface" mt="4" className="border border-dashed border-slate-300 p-6 text-center">
            <Text color="gray">CSVをアップロード</Text>
          </Card>
          <Card variant="surface" mt="4">
            <Text size="2" color="gray">
              成功 20件 / 失敗 1件
            </Text>
          </Card>
        </Card>
      </Section>
    </Box>
  );
}
