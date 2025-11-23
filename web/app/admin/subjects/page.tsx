import Link from "next/link";
import {
  Box,
  Button,
  Section,
} from "@radix-ui/themes";
import { HeroSection } from "@/components/ui/HeroSection";
import { AdminSubjectsTableClient } from "./components/AdminSubjectsTableClient";

const subjects = [
  { name: "情報リテラシー", status: "公開", units: 2, updated: "2024/04/01" },
  { name: "理科探究", status: "非公開", units: 3, updated: "2024/03/28" },
];

export default function SubjectAdminPage() {
  return (
    <Box>
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker="管理"
          title="科目管理"
          subtitle="科目の登録・公開切替・単元紐付けを行うUI例です。"
          actions={
            <div className="flex gap-2">
              <Button radius="full">科目を追加</Button>
              <Button asChild radius="full" variant="soft">
                <Link href="/admin/subjects/bulk">CSV一括登録</Link>
              </Button>
            </div>
          }
        />
      </Section>

      <Section className="max-w-6xl m-auto">
        <AdminSubjectsTableClient rows={subjects} />
      </Section>
    </Box>
  );
}
