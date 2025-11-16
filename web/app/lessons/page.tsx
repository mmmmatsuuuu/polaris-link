import PublicLessonsList from "@/components/public-lessons/PublicLessonsList";
import { getPublicLessons } from "@/lib/publicContent";

export const revalidate = 600;

export default async function LessonsPage() {
  const lessons = await getPublicLessons();
  return <PublicLessonsList lessons={lessons} />;
}
