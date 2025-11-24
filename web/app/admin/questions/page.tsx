import Link from "next/link";
import { Box, Button, Section } from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";
import { AdminQuestionsTableClient } from "./components/AdminQuestionsTableClient";

const questions = [
  { prompt: "SNS投稿前に確認する項目は?", type: "選択", difficulty: "★☆☆", status: "公開" },
  { prompt: "危険な投稿例を挙げよ", type: "記述", difficulty: "★★☆", status: "公開" },
];

export default function QuestionAdminPage() {
  return (
    <Box>
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker={
            <Link href="/admin" className="text-sm text-slate-500 hover:underline">
              管理メニューに戻る
            </Link>
          }
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

      <Section className="max-w-6xl m-auto">
        <AdminQuestionsTableClient rows={questions} />
      </Section>
    </Box>
  );
}
