import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Heading,
  Section,
  Table,
  Text,
} from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";

const contents = [
  { title: "SNS動画01", type: "動画", lesson: "SNSと個人情報", status: "公開" },
  { title: "小テストA", type: "小テスト", lesson: "SNSと個人情報", status: "公開" },
];

export default function ContentAdminPage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker="管理"
          title="コンテンツ管理"
          subtitle="動画・小テスト・教材を管理するUI例です。"
          actions={
            <Button asChild radius="full" variant="soft">
              <Link href="/admin/contents/bulk">CSV一括登録</Link>
            </Button>
          }
        />
      </Section>

      <Section>
        <Card variant="classic" className="mx-auto max-w-6xl">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>コンテンツ名</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>種別</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>授業</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>公開状態</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {contents.map((content) => (
                <Table.Row key={content.title}>
                  <Table.RowHeaderCell>{content.title}</Table.RowHeaderCell>
                  <Table.Cell>{content.type}</Table.Cell>
                  <Table.Cell>{content.lesson}</Table.Cell>
                  <Table.Cell>
                    <Badge color={content.status === "公開" ? "green" : "gray"} variant="soft">
                      {content.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button variant="soft" size="2">
                        編集
                      </Button>
                      <Button variant="outline" color="red" size="2">
                        削除
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
          <div className="mt-6 flex flex-col items-center gap-2 md:flex-row md:justify-between">
            <Text size="2" color="gray">
              ページ 1 / 5
            </Text>
            <div className="flex gap-2">
              <Button variant="soft" radius="full" disabled>
                前へ
              </Button>
              <Button radius="full">次へ</Button>
            </div>
          </div>
        </Card>
      </Section>
    </Box>
  );
}
