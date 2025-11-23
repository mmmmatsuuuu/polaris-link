import Link from "next/link";
import { Box, Button, Section } from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";
import { AdminUnitsTableClient } from "./components/AdminUnitsTableClient";

const units = [
  { name: "デジタル基礎", subject: "情報リテラシー", lessons: 4, status: "公開" },
  { name: "情報モラル", subject: "情報リテラシー", lessons: 3, status: "公開" },
];

export default function UnitAdminPage() {
  return (
    <Box>
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker="管理"
          title="単元管理"
          subtitle="単元と科目・授業の紐付けを編集するUI例です。"
          actions={
            <div className="flex gap-2">
              <Button radius="full">単元を追加</Button>
              <Button asChild radius="full" variant="soft">
                <Link href="/admin/units/bulk">CSV一括登録</Link>
              </Button>
            </div>
          }
        />
      </Section>

      <Section className="max-w-6xl m-auto">
        <AdminUnitsTableClient rows={units} />
      </Section>
    </Box>
  );
}
