"use client";

import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { HeroSection } from "@/components/ui/HeroSection";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { useAuth } from "@/context/AuthProvider";
import { db } from "@/lib/firebase/client";

type LessonNode = {
  id: string;
  title: string;
  video: number;
  quiz: number | null;
};

type UnitNode = {
  id: string;
  name: string;
  lessons: LessonNode[];
};

type SubjectNode = {
  id: string;
  name: string;
  units: UnitNode[];
};

type StudentProfile = {
  createdAt?: string;
  lastLogin?: string;
};

export default function StudentSubjectUsagePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [tree, setTree] = useState<SubjectNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      if (!user) {
        setProfile(null);
        return;
      }
      try {
        const docs = await getDocs(
          query(
            collection(db, "users"),
            where("authId", "==", user.uid),
            where("role", "==", "student"),
          ),
        );
        const data = docs.docs[0]?.data() as StudentProfile | undefined;
        if (!cancelled) {
          setProfile({
            createdAt: formatDate(data?.createdAt),
            lastLogin: formatDate(data?.lastLogin),
          });
        }
      } catch (err) {
        console.error("Failed to fetch student profile", err);
        if (!cancelled) setError("生徒情報の取得に失敗しました。");
      }
    }
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    async function fetchTree() {
      setLoading(true);
      setError(null);
      try {
        const subjectsSnap = await getDocs(
          query(
            collection(db, "subjects"),
            where("publishStatus", "==", "public"),
            orderBy("order"),
            orderBy("name"),
          ),
        );

        const subjects: SubjectNode[] = [];
        for (const subjectDoc of subjectsSnap.docs) {
          const subjectData = subjectDoc.data();
          const unitsSnap = await getDocs(
            query(
              collection(db, "units"),
              where("subjectId", "==", subjectDoc.id),
              where("publishStatus", "==", "public"),
              orderBy("order"),
              orderBy("name"),
            ),
          );

          const units: UnitNode[] = [];
          for (const unitDoc of unitsSnap.docs) {
            const unitData = unitDoc.data();
            const lessonsSnap = await getDocs(
              query(
                collection(db, "lessons"),
                where("unitId", "==", unitDoc.id),
                where("publishStatus", "==", "public"),
                orderBy("order"),
                orderBy("title"),
              ),
            );

            const lessons: LessonNode[] = lessonsSnap.docs.map((lessonDoc, index) => {
              const lessonData = lessonDoc.data();
              const { video, quiz } = dummyProgress(index);
              return {
                id: lessonDoc.id,
                title: (lessonData.title as string) ?? "",
                video,
                quiz,
              };
            });

            units.push({
              id: unitDoc.id,
              name: (unitData.name as string) ?? "",
              lessons,
            });
          }

          subjects.push({
            id: subjectDoc.id,
            name: (subjectData.name as string) ?? "",
            units,
          });
        }

        if (!cancelled) setTree(subjects);
      } catch (err) {
        console.error("Failed to fetch subject tree", err);
        if (!cancelled) setError("科目データの取得に失敗しました。");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTree();
    return () => {
      cancelled = true;
    };
  }, []);

  const periodText = useMemo(() => {
    if (!profile) return "期間: 取得中...";
    const start = profile.createdAt ?? "-";
    const end = profile.lastLogin ?? "-";
    return `期間: ${start} - ${end}`;
  }, [profile]);

  return (
    <Box className="bg-white">
      <Section className="border-b border-slate-100 bg-slate-50 px-4">
        <HeroSection
          kicker={<Link href="/student" className="text-sm text-sky-600 hover:underline">&lt; ダッシュボードに戻る</Link>}
          title="科目別利用状況"
          subtitle={periodText}
        />
      </Section>

      <Section>
        <Flex direction="column" gap="4" className="mx-auto max-w-6xl">
          {loading && (
            <Text color="gray">データを取得中です...</Text>
          )}
          {error && !loading && (
            <Text color="tomato">{error}</Text>
          )}
          {!loading && !error && tree.length === 0 && (
            <Text color="gray">公開中の科目がありません。</Text>
          )}
          {tree.map((subject) => (
            <Card key={subject.id} variant="classic">
              <Heading size="5">{subject.name || "(科目名未設定)"}</Heading>
              <Flex direction="column" gap="3" mt="4">
                {subject.units.map((unit) => (
                  <Card key={unit.id} variant="surface">
                    <Text weight="medium">{unit.name}</Text>
                    <Flex gap="3" mt="3" wrap="nowrap" className="overflow-x-auto">
                      {unit.lessons.map((lesson) => {
                        const videoValue = lesson.video ?? 0;
                        const quizValue = lesson.quiz ?? 0;
                        return (
                          <Card key={lesson.id} variant="surface" className="flex min-w-[220px] p-4">
                            <Text weight="medium">{lesson.title || "(タイトル未設定)"}</Text>
                            <Flex gap="4" mt="3" align="center" wrap="wrap">
                              <CircularProgress value={videoValue} label="動画視聴率" color="#0ea5e9" />
                              {lesson.quiz === null ? (
                                <Badge variant="soft">未受験</Badge>
                              ) : (
                                <CircularProgress value={quizValue} label="テスト正答率" color="#10b981" />
                              )}
                            </Flex>
                            <Button mt="4" asChild radius="full">
                              <Link href={`/lessons/${subject.id}/${lesson.id}`}>授業ページへ</Link>
                            </Button>
                          </Card>
                        );
                      })}
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </Card>
          ))}
        </Flex>
      </Section>
    </Box>
  );
}

function formatDate(value: unknown): string | undefined {
  if (!value) return undefined;
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
  return undefined;
}

function toJst(date: Date): string {
  return date.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
}

function dummyProgress(index: number): { video: number; quiz: number | null } {
  const presets: Array<{ video: number; quiz: number | null }> = [
    { video: 100, quiz: 80 },
    { video: 80, quiz: 70 },
    { video: 60, quiz: null },
    { video: 40, quiz: 0 },
    { video: 100, quiz: 90 },
  ];
  return presets[index % presets.length];
}
