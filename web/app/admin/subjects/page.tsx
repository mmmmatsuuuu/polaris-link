export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Box, Button, Section } from "@radix-ui/themes";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/server";
import { HeroSection } from "@/components/ui/HeroSection";
import { AdminSubjectsTableClient } from "./components/AdminSubjectsTableClient";
import type { Subject } from "@/types/catalog";

type SubjectRow = Pick<Subject, "id" | "order" | "name" | "publishStatus"> & {
  updatedAt: string;
};

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

async function fetchSubjects(): Promise<SubjectRow[]> {
  const [subjectsSnap, unitsSnap] = await Promise.all([
    getDocs(collection(db, "subjects")),
    getDocs(collection(db, "units")),
  ]);

  const unitCountBySubject = new Map<string, number>();
  unitsSnap.forEach((doc) => {
    const data = doc.data();
    const subjectId = data.subjectId as string | undefined;
    if (!subjectId) return;
    unitCountBySubject.set(subjectId, (unitCountBySubject.get(subjectId) ?? 0) + 1);
  });

  const rowsWithOrder = subjectsSnap.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: (data.name as string) ?? "",
        publishStatus: (data.publishStatus as "public" | "private") ?? "private",
        updatedAt: formatDate(data.updatedAt),
        order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
      };
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  return rowsWithOrder.map((row) => row);
}

export default async function SubjectAdminPage() {
  const subjects = await fetchSubjects();

  return (
    <Box>
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker={
            <Link href="/admin" className="text-sm text-slate-500 hover:underline">
              管理メニューに戻る
            </Link>
          }
          title="科目管理"
          subtitle="科目の登録・公開切替を行います。"
          actions={
            <div className="flex gap-2">
              <Button asChild radius="full" variant="soft">
                <Link href="/admin/subjects/bulk">一括登録</Link>
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
