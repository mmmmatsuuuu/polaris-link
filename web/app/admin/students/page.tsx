import Link from "next/link";
import { Box, Button, Section } from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";
import { AdminStudentsTableClient } from "./components/AdminStudentsTableClient";

const students = [
  { name: "山田 花子", email: "hanako@example.com", status: "有効", lastLogin: "今日" },
  { name: "佐藤 太郎", email: "taro@example.com", status: "無効", lastLogin: "30日前" },
];

export default function StudentAdminPage() {
  return (
    <Box>
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker={
            <Link href="/admin" className="text-sm text-slate-500 hover:underline">
              管理メニューに戻る
            </Link>
          }
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

      <Section className="max-w-6xl m-auto">
        <AdminStudentsTableClient rows={students} />
      </Section>
    </Box>
  );
}
