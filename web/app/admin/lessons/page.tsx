import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";

const lessons = [
  { title: "SNSと個人情報", subject: "情報リテラシー", unit: "情報モラル", contents: 3, status: "公開" },
  { title: "クラウド活用", subject: "情報リテラシー", unit: "デジタル基礎", contents: 2, status: "非公開" },
];

export default function LessonAdminPage() {
  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Text color="gray">管理</Text>
            <Heading size="7">授業管理</Heading>
            <Text color="gray">授業とコンテンツの紐付けを編集するUI例です。</Text>
          </div>
          <div className="flex gap-2">
            <Button radius="full">授業を追加</Button>
            <Button asChild radius="full" variant="soft">
              <Link href="/admin/lessons/bulk">一括登録</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <Card variant="classic" className="mx-auto max-w-6xl">
          <Text color="gray">登録済み授業</Text>
          <div className="mt-4 space-y-3">
            {lessons.map((lesson) => (
              <Card key={lesson.title} variant="surface">
                <Text size="2" color="gray">
                  科目: {lesson.subject} / 単元: {lesson.unit}
                </Text>
                <Heading size="4" mt="1">
                  {lesson.title}
                </Heading>
                <Text size="2" color="gray">
                  コンテンツ {lesson.contents} 件
                </Text>
                <Badge variant="soft" color={lesson.status === "公開" ? "green" : "gray"} className="mt-2">
                  {lesson.status}
                </Badge>
              </Card>
            ))}
          </div>
        </Card>
      </Section>
    </Box>
  );
}
