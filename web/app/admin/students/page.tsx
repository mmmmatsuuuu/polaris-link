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

const students = [
  { name: "山田 花子", email: "hanako@example.com", status: "有効", lastLogin: "今日" },
  { name: "佐藤 太郎", email: "taro@example.com", status: "無効", lastLogin: "30日前" },
];

export default function StudentAdminPage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker="管理"
          title="生徒管理"
          subtitle="メールアドレスのホワイトリスト登録やステータス変更を行うUI例です。"
          actions={
            <div className="flex gap-2">
              <Button radius="full">生徒を追加</Button>
              <Button asChild radius="full" variant="soft">
                <Link href="/admin/students/bulk">CSV一括登録</Link>
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
                <Table.ColumnHeaderCell>氏名</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>メール</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>最終ログイン</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>ステータス</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {students.map((student) => (
                <Table.Row key={student.email}>
                  <Table.RowHeaderCell>{student.name}</Table.RowHeaderCell>
                  <Table.Cell>{student.email}</Table.Cell>
                  <Table.Cell>{student.lastLogin}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      variant="soft"
                      color={student.status === "有効" ? "green" : "gray"}
                    >
                      {student.status}
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
