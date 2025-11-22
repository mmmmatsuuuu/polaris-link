import { Badge, Box, Button, Card, Flex, Section, Table, Text } from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";

const logs = [
  { subject: "情報リテラシー", lesson: "SNSと個人情報", user: "hanako@example.com", watch: "12分", quiz: "80%" },
  { subject: "理科探究", lesson: "化学反応", user: "taro@example.com", watch: "5分", quiz: "未受験" },
];

export default function HistoryAdminPage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker="ログ確認"
          title="利用履歴管理"
          subtitle="フィルター: 期間=2024/04/01-2024/04/30、科目=情報リテラシー（UIモック）"
        />
      </Section>

      <Section>
        <Card variant="classic" className="mx-auto max-w-6xl">
          <Flex direction={{ initial: "column", md: "row" }} justify="between" align={{ initial: "start", md: "center" }} gap="3">
            <Flex gap="2" wrap="wrap">
              <Badge variant="soft">期間: 今月</Badge>
              <Badge variant="soft">科目: 情報リテラシー</Badge>
            </Flex>
            <Flex gap="2">
              <Button variant="soft">CSVエクスポート</Button>
              <Button color="red" variant="soft">
                古いログを削除
              </Button>
            </Flex>
          </Flex>
          <Table.Root mt="4">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>科目/授業</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>ユーザー</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>視聴時間</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>小テスト</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {logs.map((log) => (
                <Table.Row key={log.lesson}>
                  <Table.RowHeaderCell>
                    <Text weight="medium">{log.lesson}</Text>
                    <Text size="2" color="gray">
                      {log.subject}
                    </Text>
                  </Table.RowHeaderCell>
                  <Table.Cell>{log.user}</Table.Cell>
                  <Table.Cell>{log.watch}</Table.Cell>
                  <Table.Cell>{log.quiz}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card>
      </Section>
    </Box>
  );
}
