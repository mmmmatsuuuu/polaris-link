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

const students = [
  { name: "山田 花子", email: "hanako@example.com", status: "有効", lastLogin: "今日" },
  { name: "佐藤 太郎", email: "taro@example.com", status: "無効", lastLogin: "30日前" },
];

export default function StudentAdminPage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Text color="gray">管理</Text>
            <Heading size="7">生徒管理</Heading>
            <Text color="gray">メールアドレスのホワイトリスト登録やステータス変更を行うUI例です。</Text>
          </div>
          <div className="flex gap-2">
            <Button radius="full">生徒を追加</Button>
            <Button asChild radius="full" variant="soft">
              <Link href="/admin/students/bulk">CSV一括登録</Link>
            </Button>
          </div>
        </div>
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
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card>
      </Section>
    </Box>
  );
}
