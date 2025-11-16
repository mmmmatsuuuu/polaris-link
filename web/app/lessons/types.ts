import type { Lesson, LessonContent, Subject, Unit } from "@/types/catalog";

export type LessonCard = {
  lesson: Lesson;
  subject: Subject;
  unit: Unit | null;
  contents: LessonContent[];
};

export type SubjectSectionData = {
  subject: Subject;
  units: Array<{ unit: Unit; lessons: LessonCard[] }>;
  unassignedLessons: LessonCard[];
};
