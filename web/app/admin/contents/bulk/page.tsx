import { Box, Button, Card, Flex, Heading, Section, Text } from "@radix-ui/themes";

const types = ["動画", "小テスト", "その他"];

export default function ContentBulkPage() {
  return (
    <Box className="bg-slate-50">
      <Section>
        <Flex direction="column" gap="4" className="mx-auto max-w-3xl">
          <Heading size="7">コンテンツ一括登録</Heading>
          <Text color="gray">コンテンツ種別ごとにCSVをアップロードするUI例です。</Text>
          {types.map((type) => (
            <Card key={type} variant="classic">
              <Text color="gray">{type}</Text>
              <Button mt="3">テンプレートをダウンロード</Button>
              <Card variant="surface" mt="3" className="border border-dashed border-slate-300 p-6 text-center">
                <Text color="gray">CSVをアップロード</Text>
              </Card>
            </Card>
          ))}
        </Flex>
      </Section>
    </Box>
  );
}
