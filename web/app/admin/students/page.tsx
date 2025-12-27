import Link from "next/link";
import { Box, Button, Section } from "@radix-ui/themes";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/server";
import type { StudentUser } from "@/types/users";
import { HeroSection } from "@/components/ui/HeroSection";
import { AdminStudentsTableClient, type StudentRow } from "./components/AdminStudentsTableClient";

export const dynamic = "force-dynamic";

export default async function StudentAdminPage() {
  const students = await fetchStudents();

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
          subtitle="メールアドレスのホワイトリスト登録やステータス変更を行います。"
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

async function fetchStudents(): Promise<StudentRow[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, "users"), where("role", "==", "student")),
    );

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Partial<StudentUser> & { status?: string };

      return {
        id: doc.id,
        studentNumber: formatStudentNumber(data.studentNumber),
        displayName: data.displayName ?? "(名前未設定)",
        email: data.email ?? "(メール未設定)",
        lastLogin: formatTimestamp(data.lastLogin),
      };
    });
  } catch (error) {
    console.error("Failed to fetch students", error);
    return [];
  }
}

function formatStudentNumber(value: unknown): string {
  if (typeof value === "number") return String(value);
  if (typeof value === "string" && value.trim()) return value.trim();
  return "-";
}

function formatTimestamp(value: unknown): string {
  if (!value) return "-";
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return toJst(parsed);
    }
  }
  if (typeof value === "object" && value !== null) {
    const maybeDate = (value as { toDate?: () => Date }).toDate?.();
    if (maybeDate instanceof Date && !Number.isNaN(maybeDate.getTime())) {
      return toJst(maybeDate);
    }
  }
  return "-";
}

function toJst(date: Date): string {
  return date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}
