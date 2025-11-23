import Link from "next/link";
import { Box, Button, Section } from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";
import { AdminLessonsTableClient } from "./components/AdminLessonsTableClient";

const lessons = [
  { title: "SNSと個人情報", subject: "情報リテラシー", unit: "情報モラル", contents: 3, status: "公開" },
  { title: "クラウド活用", subject: "情報リテラシー", unit: "デジタル基礎", contents: 2, status: "非公開" },
];

export default function LessonAdminPage() {
  return (
    <Box>
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

      <Section className="max-w-6xl m-auto">
        <AdminLessonsTableClient rows={lessons} />
      </Section>
    </Box>
  );
}
