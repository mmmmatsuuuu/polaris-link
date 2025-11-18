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

const subjects = [
  { name: "情報リテラシー", status: "公開", units: 2, updated: "2024/04/01" },
  { name: "理科探究", status: "非公開", units: 3, updated: "2024/03/28" },
];

export default function SubjectAdminPage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Text color="gray">管理</Text>
            <Heading size="7">科目管理</Heading>
            <Text color="gray">科目の登録・公開切替・単元紐付けを行うUI例です。</Text>
          </div>
          <div className="flex gap-2">
            <Button radius="full">科目を追加</Button>
            <Button asChild radius="full" variant="soft">
              <Link href="/admin/subjects/bulk">CSV一括登録</Link>
            </Button>
          </div>
        </div>
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
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card>
      </Section>
    </Box>
  );
}
