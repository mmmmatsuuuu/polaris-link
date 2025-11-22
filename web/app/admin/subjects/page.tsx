import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Section,
  Table,
  Text,
} from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";

const subjects = [
  { name: "情報リテラシー", status: "公開", units: 2, updated: "2024/04/01" },
  { name: "理科探究", status: "非公開", units: 3, updated: "2024/03/28" },
];

export default function SubjectAdminPage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker="管理"
          title="科目管理"
          subtitle="科目の登録・公開切替・単元紐付けを行うUI例です。"
          actions={
            <div className="flex gap-2">
              <Button radius="full">科目を追加</Button>
              <Button asChild radius="full" variant="soft">
                <Link href="/admin/subjects/bulk">CSV一括登録</Link>
              </Button>
            </div>
          }
        />
      </Section>

      <Section>
        <Card variant="classic" className="mx-auto max-w-6xl">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>科目名</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>公開状態</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>紐付け単元</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>更新日</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {subjects.map((subject) => (
                <Table.Row key={subject.name}>
                  <Table.RowHeaderCell>{subject.name}</Table.RowHeaderCell>
                  <Table.Cell>
                    <Badge color={subject.status === "公開" ? "green" : "gray"} variant="soft">
                      {subject.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{subject.units} 単元</Table.Cell>
                  <Table.Cell>{subject.updated}</Table.Cell>
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
          <Flex justify="between" align="center" mt="4">
            <Text size="2" color="gray">
              ページ 1 / 5
            </Text>
            <Flex gap="2">
              <Button variant="soft" radius="full" disabled>
                前へ
              </Button>
              <Button radius="full">次へ</Button>
            </Flex>
          </Flex>
        </Card>
      </Section>
    </Box>
  );
}
