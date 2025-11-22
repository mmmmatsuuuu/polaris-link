import { Box, Button, Card, Flex, Heading, Section, Text } from "@radix-ui/themes";

const steps = [
  "CSVテンプレートをダウンロード",
  "科目名/説明/公開状態を入力",
  "ファイルをアップロード",
  "結果ログを確認",
];

export default function SubjectBulkPage() {
  return (
    <Box className="bg-slate-50">
      <Section>
        <Card variant="classic" className="mx-auto max-w-3xl">
          <Heading size="7">科目一括登録</Heading>
          <Text color="gray">CSVを使って複数の科目をまとめて登録するUI例です。</Text>
          <Flex direction="column" gap="3" mt="5">
            {steps.map((step, index) => (
              <Flex key={step} gap="3" align="start">
                <Button variant="solid" color="gray" radius="full" size="1">
                  {index + 1}
                </Button>
                <Text color="gray">{step}</Text>
              </Flex>
            ))}
          </Flex>
          <Flex direction="column" gap="3" mt="6">
            <Button radius="full">テンプレートをダウンロード</Button>
            <Card variant="surface" className="border border-dashed border-slate-300 py-10 text-center">
              <Text color="gray">ファイルをドラッグ & ドロップ</Text>
            </Card>
          </Flex>
        </Card>
      </Section>
    </Box>
  );
}
