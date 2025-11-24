import Link from "next/link";
import { Box, Section } from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";
import { AdminHistoryTableClient } from "./components/AdminHistoryTableClient";

const logs = [
  { subject: "情報リテラシー", lesson: "SNSと個人情報", user: "hanako@example.com", watch: "12分", quiz: "80%" },
  { subject: "理科探究", lesson: "化学反応", user: "taro@example.com", watch: "5分", quiz: "未受験" },
];

export default function HistoryAdminPage() {
  return (
    <Box>
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker={
            <Link href="/admin" className="text-sm text-slate-500 hover:underline">
              管理メニューに戻る
            </Link>
          }
          title="利用履歴管理"
          subtitle="フィルター: 期間=2024/04/01-2024/04/30、科目=情報リテラシー（UIモック）"
        />
      </Section>

      <Section className="max-w-6xl m-auto">
        <AdminHistoryTableClient rows={logs} />
      </Section>
    </Box>
  );
}
