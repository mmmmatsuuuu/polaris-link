import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Section,
  Table,
  Text,
} from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";

const units = [
  { name: "デジタル基礎", subject: "情報リテラシー", lessons: 4, status: "公開" },
  { name: "情報モラル", subject: "情報リテラシー", lessons: 3, status: "公開" },
];

export default function UnitAdminPage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker="管理"
          title="単元管理"
          subtitle="単元と科目・授業の紐付けを編集するUI例です。"
          actions={
            <div className="flex gap-2">
              <Button radius="full">単元を追加</Button>
              <Button asChild radius="full" variant="soft">
                <Link href="/admin/units/bulk">CSV一括登録</Link>
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
                <Table.ColumnHeaderCell>単元名</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>科目</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>授業数</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>公開状態</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {units.map((unit) => (
                <Table.Row key={unit.name}>
                  <Table.RowHeaderCell>{unit.name}</Table.RowHeaderCell>
                  <Table.Cell>{unit.subject}</Table.Cell>
                  <Table.Cell>{unit.lessons} 件</Table.Cell>
                  <Table.Cell>
                    <Badge variant="soft" color={unit.status === "公開" ? "green" : "gray"}>
                      {unit.status}
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
