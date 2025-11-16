"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  DocumentData,
  getDocs,
  orderBy,
  query,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import PublicLessonsList from "@/components/public-lessons/PublicLessonsList";
import { db } from "@/lib/firebase/client";
import type { PublicLesson, PublicContentItem } from "@/types/publicLessons";

type HydratedContent = PublicContentItem & { isHighlight?: boolean };

export default function LessonsPage() {
  const [lessons, setLessons] = useState<PublicLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLessons() {
      try {
        const lessonsCollection = collection(db, "lessons");
        const lessonsSnapshot = await getDocs(
          query(lessonsCollection, orderBy("order", "asc")),
        );

        const hydrated = await Promise.all(
          lessonsSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            if ((data.publishStatus ?? "public") !== "public") {
              return null;
            }

            const contentsSnapshot = await getDocs(
              query(
                collection(docSnap.ref, "contents"),
                orderBy("order", "asc"),
              ),
            );

            const contents = contentsSnapshot.docs.map(mapContent);
            return buildLesson(docSnap.id, data, contents);
          }),
        );

        if (isMounted) {
          setLessons(hydrated.filter(Boolean) as PublicLesson[]);
        }
      } catch (err) {
        console.error("Failed to fetch lessons", err);
        if (isMounted) {
          setError("授業データの取得に失敗しました");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLessons();
    return () => {
      isMounted = false;
    };
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center text-gray-500">
          授業データを読み込んでいます…
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex min-h-screen items-center justify-center text-red-500">
          {error}
        </div>
      );
    }

    if (lessons.length === 0) {
      return (
        <div className="flex min-h-screen items-center justify-center text-gray-500">
          公開中の授業はまだ登録されていません。
        </div>
      );
    }

    return <PublicLessonsList lessons={lessons} />;
  }, [error, lessons, loading]);

  return content;
}

function buildLesson(
  id: string,
  data: DocumentData,
  contents: HydratedContent[],
): PublicLesson {
  const highlights = contents
    .filter((item) => item.isHighlight)
    .map(stripHighlightFlag);
  const videos = contents
    .filter((item) => item.kind === "video")
    .map(stripHighlightFlag);
  const quizzes = contents
    .filter((item) => item.kind === "quiz")
    .map(stripHighlightFlag);
  const resources = contents
    .filter((item) => item.kind === "resource")
    .map(stripHighlightFlag);

  return {
    id,
    title: data.title ?? "",
    subject: data.subject ?? "",
    unit: data.unit ?? "",
    academicYear: String(data.academicYear ?? ""),
    description: data.description ?? "",
    summary: data.summary ?? "",
    lastUpdated: data.lastUpdated ?? "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    highlights,
    videos,
    quizzes,
    resources,
  };
}

function mapContent(
  docSnap: QueryDocumentSnapshot<DocumentData>,
): HydratedContent {
  const data = docSnap.data();
  const metadata = (data.metadata ?? {}) as Record<string, unknown>;

  const meta =
    (typeof metadata.meta === "string" && metadata.meta) ||
    (typeof metadata.durationLabel === "string" && metadata.durationLabel) ||
    (typeof metadata.questionCountLabel === "string" &&
      metadata.questionCountLabel) ||
    (typeof metadata.badge === "string" && metadata.badge) ||
    undefined;

  return {
    id: docSnap.id,
    title: data.title ?? "",
    kind: normalizeContentType(data.type),
    description: data.description ?? "",
    meta,
    isHighlight: Boolean(metadata.isHighlight),
  };
}

function stripHighlightFlag(content: HydratedContent): PublicContentItem {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isHighlight, ...rest } = content;
  return rest;
}

function normalizeContentType(
  type: unknown,
): "video" | "quiz" | "resource" {
  if (type === "video" || type === "quiz" || type === "resource") {
    return type;
  }

  if (type === "link") {
    return "resource";
  }

  return "resource";
}
