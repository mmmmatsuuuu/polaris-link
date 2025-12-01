"use client";

import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { HeroSection } from "@/components/ui/HeroSection";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthProvider";

const progressCards = [
  { subject: "情報リテラシー", completed: 6, total: 10 },
  { subject: "理科探究", completed: 4, total: 8 },
];

const timeline = [
  { time: "09:00", label: "SNSセキュリティ動画を視聴", type: "動画" },
  { time: "09:20", label: "小テストA 80%", type: "小テスト" },
  { time: "10:00", label: "理科: 化学反応授業を開始", type: "動画" },
];

type StudentProfile = {
  id: string;
  displayName: string;
  email: string;
  studentNumber: string;
  lastLogin: string;
  notes?: string;
};

export default function StudentDashboardPage() {
  const { user, loading } = useAuth();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchStudentProfileForUser() {
      if (!user) {
        setStudent(null);
        return;
      }
      setFetching(true);
      setError(null);
      try {
        const profile = await fetchStudentProfile(user.uid, user.email ?? undefined);
        if (cancelled) return;
        if (!profile) {
          setStudent(null);
          setError("生徒情報が見つかりませんでした。");
          return;
        }
        setStudent(profile);
      } catch (err) {
        console.error("Failed to fetch student profile", err);
        if (!cancelled) setError("生徒情報の取得に失敗しました。");
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    fetchStudentProfileForUser();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const heroTitle = student
    ? `${student.displayName} さんのダッシュボード`
    : "生徒ダッシュボード";
  const heroKicker =
    loading || fetching
      ? "生徒情報を読み込み中..."
      : student
        ? `学籍番号 ${student.studentNumber}`
        : error ?? "生徒情報を取得できませんでした";

  return (
    <Box className="bg-slate-50">
      <Section className="border-b border-slate-100 bg-white px-4">
        <HeroSection
          title={heroTitle}
          subtitle="最近の学習ログと未完了コンテンツを確認できます。"
          kicker={heroKicker}
          actions={
            <Flex direction='column' gap="2" align="start">
              {student ? (
                <>
                  <Badge variant="surface" color="gray">メール: {student.email}</Badge>
                  <Badge variant="surface" color="gray">最終ログイン: {student.lastLogin}</Badge>
                </>
              ) : (
                <Text mt="3" color="gray">
                  {error ??
                    (loading || fetching
                      ? "生徒情報を読み込み中です。"
                      : "Firestoreから生徒情報を取得できませんでした。権限やデータを確認してください。")}
                </Text>
              )}
              <Button asChild radius="full" mt="4">
                <Link href="/student/subjects">科目利用状況ページへ</Link>
              </Button>
            </Flex>
          }
        />
      </Section>

      <Section>
        {/* 実装中 */}
        {/* <Grid className="mx-auto max-w-6xl" gap="4" columns={{ initial: "1", md: "2" }}>
          <WipOverlay>
            <Card variant="classic">
              <Heading size="5">教師からのお知らせ</Heading>
              <Text mt="2" color="gray">
                5月の小テストは5/20(月)までに受験してください。疑問点は教師ページのメッセージフォームから連絡してください。
              </Text>
            </Card>
          </WipOverlay>
          <WipOverlay>
            <Card variant="classic">
              <Heading size="5">最近の学習履歴</Heading>
              <Flex direction="column" gap="3" mt="4">
                {timeline.map((entry) => (
                  <Card key={entry.time} variant="surface">
                    <Flex justify="between" align="center">
                      <div>
                        <Text weight="medium">{entry.label}</Text>
                        <Text color="gray">{entry.time}</Text>
                      </div>
                      <Badge variant="soft">{entry.type}</Badge>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </Card>
          </WipOverlay>
        </Grid> */}
      </Section>

      <Section>
        {/* 実装中 */}
        {/* <Heading size="5" className="pb-6 text-center">科目別進捗状況</Heading>
        <WipOverlay>
          <Grid className="mx-auto max-w-6xl" gap="4" columns={{ initial: "1" }}>
            {progressCards.map((card) => (
              <Card key={card.subject} variant="classic">
                <Text color="gray">科目</Text>
                <Heading size="5">{card.subject}</Heading>
                <Box className="mt-4 h-2 rounded-full bg-slate-100">
                  <Box
                    className="h-2 rounded-full bg-sky-500"
                    style={{ width: `${Math.round((card.completed / card.total) * 100)}%` }}
                  />
                </Box>
                <Text mt="2" color="gray">
                  完了 {card.completed} / {card.total}
                </Text>
              </Card>
            ))}
          </Grid>
        </WipOverlay> */}
      </Section>
    </Box>
  );
}

async function fetchStudentProfile(
  authId: string,
  email?: string,
): Promise<StudentProfile | null> {
  try {
    const byAuthId = await getDocs(
      query(collection(db, "users"), where("authId", "==", authId), limit(1)),
    );
    let doc = byAuthId.docs[0];

    if (!doc && email) {
      const byEmail = await getDocs(
        query(
          collection(db, "users"),
          where("email", "==", email.toLowerCase()),
          limit(1),
        ),
      );
      doc = byEmail.docs[0];
    }

    if (!doc) return null;

    const data = doc.data() as Partial<StudentProfile> & {
      lastLogin?: unknown;
      studentNumber?: unknown;
      role?: string;
    };
    if (data.role && data.role !== "student") return null;
    return {
      id: doc.id,
      displayName: data.displayName ?? "(名前未設定)",
      email: data.email ?? "(メール未設定)",
      studentNumber: formatStudentNumber(data.studentNumber),
      lastLogin: formatTimestamp(data.lastLogin),
      notes: data.notes,
    };
  } catch (error) {
    console.error("Failed to fetch student profile", error);
    return null;
  }
}

function formatStudentNumber(value: unknown): string {
  if (typeof value === "number") return String(value);
  if (typeof value === "string" && value.trim()) return value.trim();
  return "未登録";
}

function formatTimestamp(value: unknown): string {
  if (!value) return "未取得";
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
  return "未取得";
}

function toJst(date: Date): string {
  return date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text size="1" color="gray">{label}</Text>
      <Text weight="medium">{value}</Text>
    </Box>
  );
}

function WipOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-white via-white/70 to-transparent backdrop-blur-sm z-10" />
      <div className="pointer-events-none absolute right-3 top-3 z-20">
        <Badge variant="surface" color="gray">実装中</Badge>
      </div>
      {children}
    </div>
  );
}
