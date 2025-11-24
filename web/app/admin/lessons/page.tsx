import Link from "next/link";
import { Box, Button, Section } from "@radix-ui/themes";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { HeroSection } from "@/components/ui/HeroSection";
import { db } from "@/lib/firebase/server";
import { AdminLessonsTableClient } from "./components/AdminLessonsTableClient";

type LessonRow = {
  id: string;
  title: string;
  unitId: string;
  unitName: string;
  subjectName: string;
  contents: number;
  publishStatus: "public" | "private";
  order: number;
  updatedAt: string;
};

type UnitOption = { id: string; name: string; subjectName: string };
type ContentOption = { id: string; title: string; lessonId?: string, typeAndTags?: string };

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

async function fetchLessons(): Promise<{
  rows: LessonRow[];
  units: UnitOption[];
  contents: ContentOption[];
}> {
  const [subjectsSnap, unitsSnap, lessonsSnap, contentsSnap] = await Promise.all([
    getDocs(collection(db, "subjects")),
    getDocs(collection(db, "units")),
    getDocs(collection(db, "lessons")),
    getDocs(collection(db, "contents")),
  ]);

  const subjectNameById = new Map<string, string>();
  subjectsSnap.forEach((doc) => {
    const data = doc.data();
    subjectNameById.set(doc.id, (data.name as string) ?? "");
  });

  const unitById = new Map<string, { name: string; subjectId?: string }>();
  unitsSnap.forEach((doc) => {
    const data = doc.data();
    unitById.set(doc.id, {
      name: (data.name as string) ?? "",
      subjectId: data.subjectId as string | undefined,
    });
  });

  const rows = lessonsSnap.docs
    .map((doc) => {
      const data = doc.data();
      const unitId = (data.unitId as string) ?? "";
      const unit = unitById.get(unitId);
      const subjectName = unit?.subjectId ? subjectNameById.get(unit.subjectId) ?? "未設定" : "未設定";
      const contentIds = Array.isArray(data.contentIds) ? (data.contentIds as string[]) : [];
      return {
        id: doc.id,
        title: (data.title as string) ?? "",
        unitId,
        unitName: unit?.name ?? "未設定",
        subjectName,
        contents: contentIds.length,
        publishStatus: (data.publishStatus as "public" | "private") ?? "private",
        order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
        updatedAt: formatDate(data.updatedAt),
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  const units: UnitOption[] = unitsSnap.docs.map((doc) => {
    const data = doc.data();
    const subjectName = subjectNameById.get(data.subjectId as string) ?? "未設定";
    return { id: doc.id, name: (data.name as string) ?? "", subjectName };
  });

  const contents: ContentOption[] = contentsSnap.docs.map((doc) => {
    const data = doc.data();
    return { id: doc.id, title: (data.title as string) ?? "", lessonId: data.lessonId as string | undefined, typeAndTags: `${data.type}, ${data.tags}` };
  });

  return { rows, units, contents };
}

export default async function LessonAdminPage() {
  const { rows, units, contents } = await fetchLessons();

  return (
    <Box>
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker={
            <Link href="/admin" className="text-sm text-slate-500 hover:underline">
              管理メニューに戻る
            </Link>
          }
          title="授業管理"
          subtitle="授業とコンテンツの紐付けを編集するUI例です。"
          actions={
            <Button asChild radius="full" variant="soft">
              <Link href="/admin/lessons/bulk">一括登録</Link>
            </Button>
          }
        />
      </Section>

      <Section className="max-w-6xl m-auto">
        <AdminLessonsTableClient rows={rows} units={units} contents={contents} />
      </Section>
    </Box>
  );
}
