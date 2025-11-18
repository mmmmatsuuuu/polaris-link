import { Box, Button, Card, Heading, Section, Text } from "@radix-ui/themes";

export default function QuestionBulkPage() {
  return (
    <Box className="bg-slate-50">
      <Section>
        <Card variant="classic" className="mx-auto max-w-3xl">
          <Heading size="7">問題一括登録</Heading>
          <Text color="gray">CSVに問題文・選択肢・正解・タグを入力する想定のUI例です。</Text>
          <Button mt="4">テンプレートをダウンロード</Button>
          <Card variant="surface" mt="4" className="border border-dashed border-slate-300 p-6 text-center">
            <Text color="gray">CSVをここにドラッグ & ドロップ</Text>
          </Card>
          <Card variant="surface" mt="4">
            <Text size="2" color="gray">エラーログ: 例) 行5 選択肢が不足しています</Text>
          </Card>
        </Card>
      </Section>
    </Box>
  );
}
