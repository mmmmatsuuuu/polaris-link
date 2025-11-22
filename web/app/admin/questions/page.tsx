import Link from "next/link";
import { Badge, Box, Button, Card, Section, Table, Text } from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";

const questions = [
  { prompt: "SNS投稿前に確認する項目は?", type: "選択", difficulty: "★☆☆", status: "公開" },
  { prompt: "危険な投稿例を挙げよ", type: "記述", difficulty: "★★☆", status: "公開" },
];

export default function QuestionAdminPage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker="管理"
          title="問題管理"
          subtitle="小テスト問題の編集やプレビューのUI例です。"
          actions={
            <div className="flex gap-2">
              <Button radius="full">問題を追加</Button>
              <Button asChild radius="full" variant="soft">
                <Link href="/admin/questions/bulk">一括登録</Link>
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
                <Table.ColumnHeaderCell>問題文</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>種別</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>難易度</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>公開状態</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {questions.map((question) => (
                <Table.Row key={question.prompt}>
                  <Table.RowHeaderCell>{question.prompt}</Table.RowHeaderCell>
                  <Table.Cell>{question.type}</Table.Cell>
                  <Table.Cell>{question.difficulty}</Table.Cell>
                  <Table.Cell>
                    <Badge variant="soft" color={question.status === "公開" ? "green" : "gray"}>
                      {question.status}
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
