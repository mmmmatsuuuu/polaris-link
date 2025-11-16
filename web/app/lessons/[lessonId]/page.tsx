import { notFound } from "next/navigation";
import PublicLessonDetail from "@/components/public-lessons/PublicLessonDetail";
import {
  getPublicLessonById,
  getPublicLessons,
} from "@/lib/publicContent";

export const revalidate = 600;

export async function generateStaticParams() {
  const lessons = await getPublicLessons();
  return lessons.map((lesson) => ({ lessonId: lesson.id }));
}

type LessonDetailProps = {
  params: { lessonId: string };
};

export default async function LessonDetailPage({ params }: LessonDetailProps) {
  const lesson = await getPublicLessonById(params.lessonId);

  if (!lesson) {
    notFound();
  }

  return <PublicLessonDetail lesson={lesson} />;
}
