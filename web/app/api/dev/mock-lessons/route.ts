import { NextResponse } from "next/server";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/server";

type LessonPayload = {
  id: string;
  title?: string;
  subject?: string;
  unit?: string;
  academicYear?: number | string;
  description?: string;
  summary?: string;
  lastUpdated?: string;
  tags?: string[];
  publishStatus?: "public" | "private";
  order?: number;
  availableYears?: number[];
  contents?: ContentPayload[];
};

type ContentPayload = {
  id: string;
  title?: string;
  description?: string;
  type?: "video" | "quiz" | "resource";
  order?: number;
  publishStatus?: "public" | "private";
  metadata?: Record<string, unknown>;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lessons = Array.isArray(body) ? body : body.lessons;

    if (!Array.isArray(lessons)) {
      return NextResponse.json(
        { error: "Invalid payload. Expecting an array or { lessons: [] }." },
        { status: 400 },
      );
    }

    const lessonsCollection = collection(db, "lessons");
    const results: string[] = [];

    for (const [index, rawLesson] of lessons.entries()) {
      const lesson = rawLesson as LessonPayload;

      if (!lesson.id) {
        continue;
      }

      const lessonRef = doc(lessonsCollection, lesson.id);
      await setDoc(lessonRef, {
        title: lesson.title ?? "",
        subject: lesson.subject ?? "",
        unit: lesson.unit ?? "",
        academicYear: lesson.academicYear ?? "",
        description: lesson.description ?? "",
        summary: lesson.summary ?? "",
        lastUpdated: lesson.lastUpdated ?? new Date().toISOString().slice(0, 10),
        tags: Array.isArray(lesson.tags) ? lesson.tags : [],
        publishStatus: lesson.publishStatus ?? "public",
        order: typeof lesson.order === "number" ? lesson.order : index + 1,
        availableYears: Array.isArray(lesson.availableYears)
          ? lesson.availableYears
          : lesson.academicYear
            ? [Number(lesson.academicYear)]
            : [],
      });

      const contentsRef = collection(lessonRef, "contents");
      const existing = await getDocs(contentsRef);
      await Promise.all(existing.docs.map((contentDoc) => deleteDoc(contentDoc.ref)));

      const contents = Array.isArray(lesson.contents) ? lesson.contents : [];
      for (const [contentIndex, rawContent] of contents.entries()) {
        const content = rawContent as ContentPayload;
        if (!content.id) continue;

        const contentDoc = doc(contentsRef, content.id);
        await setDoc(contentDoc, {
          title: content.title ?? "",
          description: content.description ?? "",
          type: content.type ?? "resource",
          order:
            typeof content.order === "number" ? content.order : contentIndex + 1,
          publishStatus: content.publishStatus ?? "public",
          metadata: content.metadata ?? {},
        });
      }

      results.push(lesson.id);
    }

    return NextResponse.json({ imported: results });
  } catch (error) {
    console.error("Mock import failed", error);
    return NextResponse.json(
      { error: "Failed to import lessons", detail: (error as Error).message },
      { status: 500 },
    );
  }
}
