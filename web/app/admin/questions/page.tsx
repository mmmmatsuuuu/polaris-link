export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Box, Button, Section } from "@radix-ui/themes";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/server";
import { HeroSection } from "@/components/ui/HeroSection";
import { AdminQuestionsTableClient } from "./components/AdminQuestionsTableClient";

type QuestionRow = {
  id: string;
  prompt: string;
  questionType: "multipleChoice" | "ordering" | "shortAnswer" | "";
  difficulty: "easy" | "medium" | "hard" | "";
  publishStatus: "public" | "private";
  order: number;
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

async function fetchQuestions(): Promise<QuestionRow[]> {
  const snapshot = await getDocs(collection(db, "questions"));
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        prompt: (data.prompt as string) ?? "",
        questionType: (data.questionType as QuestionRow["questionType"]) ?? "",
        difficulty: (data.difficulty as QuestionRow["difficulty"]) ?? "",
        publishStatus: (data.publishStatus as QuestionRow["publishStatus"]) ?? "private",
        order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
        updatedAt: formatDate(data.updatedAt),
      };
    })
    .sort((a, b) => a.order - b.order || a.prompt.localeCompare(b.prompt));
}

export default async function QuestionAdminPage() {
  const questions = await fetchQuestions();

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
            <Button asChild radius="full" variant="soft">
              <Link href="/admin/questions/bulk">一括登録</Link>
            </Button>
          }
        />
      </Section>

      <Section className="max-w-6xl m-auto">
        <AdminQuestionsTableClient rows={questions} />
      </Section>
    </Box>
  );
}
