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
import { db } from "@/lib/firebase/client";
import type {
  Lesson,
  LessonContent,
  Subject,
  Unit,
} from "@/types/catalog";
import type { LessonCard, SubjectSectionData } from "@/app/lessons/types";
import { CatalogHero } from "@/components/lessons/CatalogHero";
import { SubjectSections } from "@/components/lessons/SubjectSections";

const DEFAULT_LESSON_DESCRIPTION = "授業概要を入力してください。";

export default function LessonsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonContents, setLessonContents] = useState<LessonContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      setError(null);
      setLoading(true);
      try {
        const [subjectsSnapshot, unitsSnapshot, lessonsSnapshot] =
          await Promise.all([
            getDocs(query(collection(db, "subjects"), orderBy("order", "asc"))),
            getDocs(query(collection(db, "units"), orderBy("order", "asc"))),
            getDocs(query(collection(db, "lessons"), orderBy("order", "asc"))),
          ]);

        const subjectDocs = subjectsSnapshot.docs
          .map(mapSubjectDocument)
          .filter((subject): subject is Subject => Boolean(subject));

        const unitDocs = unitsSnapshot.docs
          .map(mapUnitDocument)
          .filter((unit): unit is Unit => Boolean(unit));

        const hydratedLessons = await Promise.all(
          lessonsSnapshot.docs.map((lessonDoc) => hydrateLessonDocument(lessonDoc)),
        );
        const publicLessons = hydratedLessons.filter(
          (entry): entry is HydratedLesson => Boolean(entry),
        );

        if (!isMounted) return;

        setSubjects(subjectDocs);
        setUnits(unitDocs);
        setLessons(publicLessons.map((entry) => entry.lesson));
        setLessonContents(publicLessons.flatMap((entry) => entry.contents));
      } catch (catalogError) {
        console.error("Failed to load catalog", catalogError);
        if (isMounted) {
          setError("カタログデータの取得に失敗しました");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const lessonCards = useMemo(
    () => buildLessonCards(subjects, units, lessons, lessonContents),
    [subjects, units, lessons, lessonContents],
  );
  const subjectSections = useMemo(
    () => buildSubjectSections(subjects, units, lessonCards),
    [subjects, units, lessonCards],
  );

  const heroStats = useMemo(
    () => [
      { label: "科目", value: subjects.length },
      { label: "単元", value: units.length },
      { label: "授業", value: lessons.length },
    ],
    [subjects.length, units.length, lessons.length],
  );

  const statusMessage = loading
    ? "Firestoreからカタログデータを読み込んでいます..."
    : error;

  return (
    <main className="bg-slate-50 pb-24">
      <CatalogHero stats={heroStats} statusMessage={statusMessage} />
      <SubjectSections sections={subjectSections} loading={loading} />
    </main>
  );
}

type HydratedLesson = { lesson: Lesson; contents: LessonContent[] };

async function hydrateLessonDocument(
  docSnap: QueryDocumentSnapshot<DocumentData>,
): Promise<HydratedLesson | null> {
  const lesson = mapLessonDocument(docSnap);
  if (!lesson) {
    return null;
  }

  const contentsSnapshot = await getDocs(
    query(collection(docSnap.ref, "contents"), orderBy("order", "asc")),
  );
  const contents = contentsSnapshot.docs
    .map((contentDoc) => mapLessonContentDocument(docSnap.id, contentDoc))
    .filter((content): content is LessonContent => Boolean(content));

  return { lesson, contents };
}

function mapSubjectDocument(
  docSnap: QueryDocumentSnapshot<DocumentData>,
): Subject | null {
  const data = docSnap.data();
  const publishStatus = normalizePublishStatus(data.publishStatus);
  if (publishStatus !== "public") {
    return null;
  }

  return {
    id: docSnap.id,
    order: typeof data.order === "number" ? data.order : 0,
    publishStatus,
    availableYears: toNumberArray(data.availableYears),
    name: typeof data.name === "string" && data.name ? data.name : "名称未設定の科目",
    description:
      typeof data.description === "string" ? data.description : "科目の説明を入力してください。",
    createdBy: typeof data.createdBy === "string" ? data.createdBy : undefined,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined,
  };
}

function mapUnitDocument(
  docSnap: QueryDocumentSnapshot<DocumentData>,
): Unit | null {
  const data = docSnap.data();
  const publishStatus = normalizePublishStatus(data.publishStatus);
  if (publishStatus !== "public") {
    return null;
  }

  const subjectId = typeof data.subjectId === "string" ? data.subjectId : "";
  if (!subjectId) {
    return null;
  }

  return {
    id: docSnap.id,
    subjectId,
    order: typeof data.order === "number" ? data.order : 0,
    publishStatus,
    availableYears: toNumberArray(data.availableYears),
    name: typeof data.name === "string" && data.name ? data.name : "名称未設定の単元",
    description:
      typeof data.description === "string" ? data.description : "単元の説明を入力してください。",
    createdBy: typeof data.createdBy === "string" ? data.createdBy : undefined,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined,
  };
}

function mapLessonDocument(
  docSnap: QueryDocumentSnapshot<DocumentData>,
): Lesson | null {
  const data = docSnap.data();
  const publishStatus = normalizePublishStatus(data.publishStatus);
  if (publishStatus !== "public") {
    return null;
  }

  const subjectId = typeof data.subjectId === "string" ? data.subjectId : "";
  if (!subjectId) {
    return null;
  }

  const unitId = typeof data.unitId === "string" ? data.unitId : null;

  return {
    id: docSnap.id,
    subjectId,
    unitId,
    title: typeof data.title === "string" && data.title ? data.title : "名称未設定の授業",
    description:
      typeof data.description === "string" ? data.description : DEFAULT_LESSON_DESCRIPTION,
    tags: toStringArray(data.tags),
    order: typeof data.order === "number" ? data.order : 0,
    publishStatus,
    availableYears: toNumberArray(data.availableYears),
    createdBy: typeof data.createdBy === "string" ? data.createdBy : undefined,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined,
  };
}

function mapLessonContentDocument(
  lessonId: string,
  docSnap: QueryDocumentSnapshot<DocumentData>,
): LessonContent | null {
  const data = docSnap.data();
  const publishStatus = normalizePublishStatus(data.publishStatus);
  if (publishStatus !== "public") {
    return null;
  }

  const type =
    data.type === "quiz" || data.type === "link"
      ? data.type
      : "video";

  return {
    id: docSnap.id,
    lessonId,
    type,
    title: typeof data.title === "string" && data.title ? data.title : "名称未設定のコンテンツ",
    description:
      typeof data.description === "string"
        ? data.description
        : "コンテンツの説明を入力してください。",
    publishStatus,
    order: typeof data.order === "number" ? data.order : 0,
    metadata: buildContentMetadata(type, data.metadata),
    createdBy: typeof data.createdBy === "string" ? data.createdBy : undefined,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined,
  };
}

function buildContentMetadata(
  type: LessonContent["type"],
  rawMetadata: unknown,
): LessonContent["metadata"] {
  const metadata = isPlainObject(rawMetadata) ? rawMetadata : {};

  if (type === "video") {
    return {
      type: "video",
      youtubeVideoId:
        typeof metadata.youtubeVideoId === "string"
          ? metadata.youtubeVideoId
          : "",
      durationSec:
        typeof metadata.durationSec === "number" ? metadata.durationSec : 0,
      badgeLabel:
        typeof metadata.badgeLabel === "string" ? metadata.badgeLabel : undefined,
    };
  }

  if (type === "quiz") {
    return {
      type: "quiz",
      questionPoolSize:
        typeof metadata.questionPoolSize === "number"
          ? metadata.questionPoolSize
          : 0,
      questionsPerAttempt:
        typeof metadata.questionsPerAttempt === "number"
          ? metadata.questionsPerAttempt
          : 0,
      timeLimitSec:
        typeof metadata.timeLimitSec === "number"
          ? metadata.timeLimitSec
          : undefined,
      allowRetry:
        typeof metadata.allowRetry === "boolean" ? metadata.allowRetry : false,
    };
  }

  return {
    type: "link",
    url: typeof metadata.url === "string" ? metadata.url : "",
    badge: typeof metadata.badge === "string" ? metadata.badge : undefined,
  };
}

function normalizePublishStatus(value: unknown): "public" | "private" {
  return value === "private" ? "private" : "public";
}

function toNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => Number(item))
    .filter((num) => Number.isFinite(num))
    .sort();
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function buildLessonCards(
  subjects: Subject[],
  units: Unit[],
  lessons: Lesson[],
  lessonContents: LessonContent[],
): LessonCard[] {
  const subjectMap = new Map(subjects.map((subject) => [subject.id, subject]));
  const unitMap = new Map(units.map((unit) => [unit.id, unit]));
  const contentMap = new Map<string, LessonContent[]>();

  lessonContents.forEach((content) => {
    const list = contentMap.get(content.lessonId) ?? [];
    list.push(content);
    contentMap.set(content.lessonId, list);
  });

  return lessons
    .map((lesson) => {
      const subject = subjectMap.get(lesson.subjectId);
      if (!subject) return null;
      const unit = lesson.unitId ? unitMap.get(lesson.unitId) ?? null : null;
      const contents = contentMap.get(lesson.id) ?? [];
      return { lesson, subject, unit, contents };
    })
    .filter((card): card is LessonCard => card !== null)
    .sort((a, b) => a.lesson.order - b.lesson.order);
}

function buildSubjectSections(
  subjects: Subject[],
  units: Unit[],
  lessonCards: LessonCard[],
): SubjectSectionData[] {
  return subjects
    .map((subject) => {
      const subjectLessons = lessonCards.filter(
        (card) => card.subject.id === subject.id,
      );
      const subjectUnits = units
        .filter((unit) => unit.subjectId === subject.id)
        .sort((a, b) => a.order - b.order);

      const unitsWithLessons = subjectUnits
        .map((unit) => ({
          unit,
          lessons: subjectLessons.filter((card) => card.lesson.unitId === unit.id),
        }))
        .filter((group) => group.lessons.length > 0);

      const unassignedLessons = subjectLessons.filter(
        (card) => !card.lesson.unitId,
      );

      return { subject, units: unitsWithLessons, unassignedLessons };
    })
    .filter(
      (section) =>
        section.units.length > 0 || section.unassignedLessons.length > 0,
    )
    .sort((a, b) => a.subject.order - b.subject.order);
}
