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

const lessons = [
  { title: "SNSと個人情報", subject: "情報リテラシー", unit: "情報モラル", contents: 3, status: "公開" },
  { title: "クラウド活用", subject: "情報リテラシー", unit: "デジタル基礎", contents: 2, status: "非公開" },
];

export default function LessonAdminPage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker="管理"
          title="授業管理"
          subtitle="授業とコンテンツの紐付けを編集するUI例です。"
          actions={
            <div className="flex gap-2">
              <Button radius="full">授業を追加</Button>
              <Button asChild radius="full" variant="soft">
                <Link href="/admin/lessons/bulk">一括登録</Link>
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
                <Table.ColumnHeaderCell>授業名</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>科目</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>単元</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>コンテンツ数</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>公開状態</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {lessons.map((lesson) => (
                <Table.Row key={lesson.title}>
                  <Table.RowHeaderCell>{lesson.title}</Table.RowHeaderCell>
                  <Table.Cell>{lesson.subject}</Table.Cell>
                  <Table.Cell>{lesson.unit}</Table.Cell>
                  <Table.Cell>{lesson.contents} 件</Table.Cell>
                  <Table.Cell>
                    <Badge variant="soft" color={lesson.status === "公開" ? "green" : "gray"}>
                      {lesson.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button variant="soft" size="2">編集</Button>
                      <Button variant="outline" color="red" size="2">削除</Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
          <div className="mt-6 flex flex-col items-center gap-2 md:flex-row md:justify-between">
            <Text size="2" color="gray">ページ 1 / 5</Text>
            <div className="flex gap-2">
              <Button variant="soft" radius="full" disabled>前へ</Button>
              <Button radius="full">次へ</Button>
            </div>
          </div>
        </Card>
      </Section>
    </Box>
  );
}
