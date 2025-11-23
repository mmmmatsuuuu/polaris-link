import Link from "next/link";
import { Box, Button, Section } from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";
import { AdminContentsTableClient } from "./components/AdminContentsTableClient";

const contents = [
  { title: "SNS動画01", type: "動画", lesson: "SNSと個人情報", status: "公開" },
  { title: "小テストA", type: "小テスト", lesson: "SNSと個人情報", status: "公開" },
];

export default function ContentAdminPage() {
  return (
    <Box>
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker="管理"
          title="コンテンツ管理"
          subtitle="動画・小テスト・教材を管理するUI例です。"
          actions={
            <Button asChild radius="full" variant="soft">
              <Link href="/admin/contents/bulk">CSV一括登録</Link>
            </Button>
          }
        />
      </Section>

      <Section className="max-w-6xl m-auto">
        <AdminContentsTableClient rows={contents} />
      </Section>
    </Box>
  );
}
