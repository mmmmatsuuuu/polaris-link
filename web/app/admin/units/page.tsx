export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Box, Button, Section } from "@radix-ui/themes";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { HeroSection } from "@/components/ui/HeroSection";
import { db } from "@/lib/firebase/server";
import { AdminUnitsTableClient } from "./components/AdminUnitsTableClient";

type UnitRow = {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  lessons: number;
  publishStatus: "public" | "private";
  order: number;
  updatedAt: string;
};

type SubjectOption = { id: string; name: string };

function formatDate(value: unknown): string {
  if (value instanceof Timestamp) {
    const date = value.toDate();
    return date.toISOString().slice(0, 10).replace(/-/g, "/");
  }
  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10).replace(/-/g, "/");
    }
  }
  return "-";
}

async function fetchUnits(): Promise<{ rows: UnitRow[]; subjects: SubjectOption[] }> {
  const [subjectsSnap, unitsSnap, lessonsSnap] = await Promise.all([
    getDocs(collection(db, "subjects")),
    getDocs(collection(db, "units")),
    getDocs(collection(db, "lessons")),
  ]);

  const subjectNameById = new Map<string, string>();
  subjectsSnap.forEach((doc) => {
    const data = doc.data();
    subjectNameById.set(doc.id, (data.name as string) ?? "");
  });

  const lessonCountByUnit = new Map<string, number>();
  lessonsSnap.forEach((doc) => {
    const data = doc.data();
    const unitId = data.unitId as string | undefined;
    if (!unitId) return;
    lessonCountByUnit.set(unitId, (lessonCountByUnit.get(unitId) ?? 0) + 1);
  });

  const rows = unitsSnap.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: (data.name as string) ?? "",
        subjectId: (data.subjectId as string) ?? "",
        subjectName: subjectNameById.get(data.subjectId as string) ?? "未設定",
        lessons: lessonCountByUnit.get(doc.id) ?? 0,
        publishStatus: (data.publishStatus as "public" | "private") ?? "private",
        order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
        updatedAt: formatDate(data.updatedAt),
      };
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  const subjects: SubjectOption[] = subjectsSnap.docs.map((doc) => {
    const data = doc.data();
    return { id: doc.id, name: (data.name as string) ?? "" };
  });

  return { rows, subjects };
}

export default async function UnitAdminPage() {
  const { rows, subjects } = await fetchUnits();

  return (
    <Box>
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker={
            <Link href="/admin" className="text-sm text-slate-500 hover:underline">
              管理メニューに戻る
            </Link>
          }
          title="単元管理"
          subtitle="単元と科目・授業の紐付けを編集するUI例です。"
          actions={
            <Button asChild radius="full" variant="soft">
              <Link href="/admin/units/bulk">CSV一括登録</Link>
            </Button>
          }
        />
      </Section>

      <Section className="max-w-6xl m-auto">
        <AdminUnitsTableClient rows={rows} subjects={subjects} />
      </Section>
    </Box>
  );
}
