export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Box, Button, Section } from "@radix-ui/themes";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { HeroSection } from "@/components/ui/HeroSection";
import { db } from "@/lib/firebase/server";
import { AdminContentsTableClient } from "./components/AdminContentsTableClient";
import type { LessonContent, LessonContentType, PublishStatus, RichTextDoc } from "@/types/catalog";

type ContentRow = Pick<LessonContent, "id" | "title" | "type" | "tags" | "publishStatus" | "order"> & {
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

async function fetchContents(): Promise<{ rows: ContentRow[] }> {
  const [contentsSnap] = await Promise.all([
    getDocs(collection(db, "contents")),
  ]);

  const rows = contentsSnap.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: (data.title as string) ?? "",
        type: (data.type as "video" | "quiz" | "link") ?? "video",
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
        publishStatus: (data.publishStatus as "public" | "private") ?? "private",
        order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
        updatedAt: formatDate(data.updatedAt),
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  return { rows };
}

async function fetchQuestions(): Promise<{ id: string; prompt: RichTextDoc | string | undefined; tags?: string[] }[]> {
  const snapshot = await getDocs(collection(db, "questions"));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      prompt: (data as any)?.prompt as RichTextDoc | string | undefined,
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    };
  });
}

export default async function ContentAdminPage() {
  const [contentResult, questionList] = await Promise.all([fetchContents(), fetchQuestions()]);
  const { rows } = contentResult;

  return (
    <Box>
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker={
            <Link href="/admin" className="text-sm text-slate-500 hover:underline">
              管理メニューに戻る
            </Link>
          }
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
        <AdminContentsTableClient rows={rows} questions={questionList} />
      </Section>
    </Box>
  );
}
