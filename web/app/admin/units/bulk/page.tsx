import { Box, Button, Card, Heading, Section, Text } from "@radix-ui/themes";

export default function UnitBulkPage() {
  return (
    <Box className="bg-slate-50">
      <Section>
        <Card variant="classic" className="mx-auto max-w-3xl">
          <Heading size="7">単元一括登録</Heading>
          <Text color="gray">科目IDと単元情報をCSVで登録するUI例です。</Text>
          <Button mt="4">テンプレートをダウンロード</Button>
          <Card variant="surface" mt="4" className="border border-dashed border-slate-300 p-6 text-center">
            <Text color="gray">CSVをここにドラッグ</Text>
          </Card>
          <Text size="2" color="gray" mt="2">
            エラー発生時は行番号とメッセージを表示します。
          </Text>
        </Card>
      </Section>
    </Box>
  );
}
