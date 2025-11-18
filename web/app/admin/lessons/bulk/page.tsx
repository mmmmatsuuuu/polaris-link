import { Box, Button, Card, Heading, Section, Text } from "@radix-ui/themes";

export default function LessonBulkPage() {
  return (
    <Box className="bg-slate-50">
      <Section>
        <Card variant="classic" className="mx-auto max-w-3xl">
          <Heading size="7">授業一括登録</Heading>
          <Text color="gray">CSVで授業と紐付け単元を登録するUI例です。</Text>
          <Button mt="4">CSVテンプレート</Button>
          <Card variant="surface" mt="4" className="border border-dashed border-slate-300 p-6 text-center">
            <Text color="gray">ファイルをアップロード</Text>
          </Card>
          <Card variant="surface" mt="4">
            <Text size="2" color="gray">
              例: 行12 科目IDが存在しません
            </Text>
          </Card>
        </Card>
      </Section>
    </Box>
  );
}
